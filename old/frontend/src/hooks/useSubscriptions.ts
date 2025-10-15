import { useState, useEffect } from "react";
import { subscriptionsApi } from "../api/subscriptions";

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setIsLoading(true);
    try {
      const response = (await subscriptionsApi.getMySubscriptions()) as any;
      setSubscriptions(response.subscriptions || []);
    } catch (error) {
      console.error("Failed to load subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribe = async (channelId: number) => {
    await subscriptionsApi.subscribe(channelId);
    await loadSubscriptions();
  };

  const unsubscribe = async (channelId: number) => {
    await subscriptionsApi.unsubscribe(channelId);
    setSubscriptions((prev) => prev.filter((sub) => sub.id !== channelId));
  };

  const updateNotificationLevel = async (
    channelId: number,
    notificationLevel: string
  ) => {
    await subscriptionsApi.updateNotificationLevel(
      channelId,
      notificationLevel
    );
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.id === channelId
          ? { ...sub, notification_level: notificationLevel }
          : sub
      )
    );
  };

  return {
    subscriptions,
    isLoading,
    loadSubscriptions,
    subscribe,
    unsubscribe,
    updateNotificationLevel,
  };
};
