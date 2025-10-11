import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../config/constants";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinChannel: (channelId: number) => void;
  leaveChannel: (channelId: number) => void;
  sendTyping: (channelId: number) => void;
  updateStatus: (status: string) => void;
  onNewPost: (callback: (data: any) => void) => void;
  onUserPresence: (callback: (data: any) => void) => void;
  onUserTyping: (callback: (data: any) => void) => void;
  onNotification: (callback: (data: any) => void) => void;
  offNewPost: () => void;
  offUserPresence: () => void;
  offUserTyping: () => void;
  offNotification: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAuth();

  const joinChannel = (channelId: number) => {
    socket?.emit("join_channel", channelId);
  };

  const leaveChannel = (channelId: number) => {
    socket?.emit("leave_channel", channelId);
  };

  const sendTyping = (channelId: number) => {
    socket?.emit("user_typing", { channelId });
  };

  const updateStatus = (status: string) => {
    socket?.emit("update_status", status);
  };

  const onNewPost = (callback: (data: any) => void) => {
    socket?.on("new_post", callback);
  };

  const onUserPresence = (callback: (data: any) => void) => {
    socket?.on("user_presence", callback);
  };

  const onUserTyping = (callback: (data: any) => void) => {
    socket?.on("user_typing", callback);
  };

  const onNotification = (callback: (data: any) => void) => {
    socket?.on("notification", callback);
  };

  const offNewPost = () => {
    socket?.off("new_post");
  };

  const offUserPresence = () => {
    socket?.off("user_presence");
  };

  const offUserTyping = () => {
    socket?.off("user_typing");
  };

  const offNotification = () => {
    socket?.off("notification");
  };

  useEffect(() => {
    if (!isAuthenticated) {
      socket?.disconnect();
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const initSocket = async () => {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) return;

      const newSocket = io(API_CONFIG.WS_URL, {
        auth: { token },
        transports: ["websocket"],
      });

      newSocket.on("connect", () => {
        console.log("Socket connected");
        setIsConnected(true);
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      setSocket(newSocket);
    };

    initSocket();

    return () => {
      socket?.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinChannel,
        leaveChannel,
        sendTyping,
        updateStatus,
        onNewPost,
        onUserPresence,
        onUserTyping,
        onNotification,
        offNewPost,
        offUserPresence,
        offUserTyping,
        offNotification,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within SocketProvider");
  return context;
};
