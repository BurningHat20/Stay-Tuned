import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "../config/constants";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAuth();

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
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within SocketProvider");
  return context;
};
