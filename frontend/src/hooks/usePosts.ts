import { useState, useEffect } from "react";
import { postsApi } from "../api/posts";
import { useSocket } from "../contexts/SocketContext";

export const usePosts = (channelId?: number) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    loadPosts();
  }, [channelId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("new_post", (data: any) => {
      if (!channelId || data.channelId === channelId) {
        setPosts((prev) => [data.post, ...prev]);
      }
    });

    return () => {
      socket.off("new_post");
    };
  }, [socket, channelId]);

  const loadPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = channelId
        ? ((await postsApi.getChannelPosts(channelId)) as any)
        : ((await postsApi.getFeed()) as any);
      setPosts(response.posts || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async (content: string, postChannelId: number) => {
    await postsApi.create({
      channelId: postChannelId,
      content,
      postType: "text",
    });
  };

  const reactToPost = async (postId: number, reactionType: string) => {
    await postsApi.react(postId, reactionType);
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              user_reaction: reactionType,
              reaction_count: post.reaction_count + 1,
            }
          : post
      )
    );
  };

  const removeReaction = async (postId: number) => {
    await postsApi.removeReaction(postId);
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              user_reaction: null,
              reaction_count: Math.max(0, post.reaction_count - 1),
            }
          : post
      )
    );
  };

  return {
    posts,
    isLoading,
    error,
    loadPosts,
    createPost,
    reactToPost,
    removeReaction,
  };
};
