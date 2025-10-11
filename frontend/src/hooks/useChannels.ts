import { useState, useEffect } from "react";
import { channelsApi } from "../api/channels";

export const useChannels = () => {
  const [myChannels, setMyChannels] = useState<any[]>([]);
  const [discoverChannels, setDiscoverChannels] = useState<any[]>([]);
  const [trendingChannels, setTrendingChannels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDiscoverLoading, setIsDiscoverLoading] = useState(false);
  const [isTrendingLoading, setIsTrendingLoading] = useState(false);

  useEffect(() => {
    loadMyChannels();
  }, []);

  const loadMyChannels = async () => {
    setIsLoading(true);
    try {
      const response = (await channelsApi.getMyChannels()) as any;
      setMyChannels(response.channels || []);
    } catch (error) {
      console.error("Failed to load channels:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDiscoverChannels = async (params?: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    setIsDiscoverLoading(true);
    try {
      const response = (await channelsApi.discover(params)) as any;
      setDiscoverChannels(response.channels || []);
    } catch (error) {
      console.error("Failed to load discover channels:", error);
    } finally {
      setIsDiscoverLoading(false);
    }
  };

  const loadTrendingChannels = async (limit = 20) => {
    setIsTrendingLoading(true);
    try {
      const response = (await channelsApi.getTrending(limit)) as any;
      setTrendingChannels(response.channels || []);
    } catch (error) {
      console.error("Failed to load trending channels:", error);
    } finally {
      setIsTrendingLoading(false);
    }
  };

  const createChannel = async (data: any) => {
    const response = (await channelsApi.create(data)) as any;
    setMyChannels((prev) => [response.channel, ...prev]);
    return response.channel;
  };

  const updateChannel = async (channelId: number, data: any) => {
    const response = (await channelsApi.update(channelId, data)) as any;
    setMyChannels((prev) =>
      prev.map((channel) =>
        channel.id === channelId ? response.channel : channel
      )
    );
    return response.channel;
  };

  const deleteChannel = async (channelId: number) => {
    await channelsApi.delete(channelId);
    setMyChannels((prev) => prev.filter((channel) => channel.id !== channelId));
  };

  return {
    myChannels,
    discoverChannels,
    trendingChannels,
    isLoading,
    isDiscoverLoading,
    isTrendingLoading,
    loadMyChannels,
    loadDiscoverChannels,
    loadTrendingChannels,
    createChannel,
    updateChannel,
    deleteChannel,
  };
};
