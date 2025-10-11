import { useState, useEffect } from "react";
import { postsApi } from "../api/posts";
import { useSocket } from "../contexts/SocketContext";

export const usePosts = (channelId?: number) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { socket, joinChannel, leaveChannel, onNewPost, offNewPost } =
    useSocket();

  useEffect(() => {
    loadPosts();
  }, [channelId]);

  useEffect(() => {
    if (channelId) {
      joinChannel(channelId);
    }

    const handleNewPost = (data: any) => {
      if (!channelId || data.channelId === channelId) {
        setPosts((prev) => [data.post, ...prev]);
      }
    };

    onNewPost(handleNewPost);

    return () => {
      if (channelId) {
        leaveChannel(channelId);
      }
      offNewPost();
    };
  }, [channelId, joinChannel, leaveChannel, onNewPost, offNewPost]);

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

  const createPost = async (
    content: string,
    postChannelId: number,
    postType: "text" | "voice" | "image" | "location" | "status" = "text"
  ) => {
    await postsApi.create({
      channelId: postChannelId,
      content,
      postType,
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

  const deletePost = async (postId: number) => {
    await postsApi.delete(postId);
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  return {
    posts,
    isLoading,
    error,
    loadPosts,
    createPost,
    reactToPost,
    removeReaction,
    deletePost,
  };
};
