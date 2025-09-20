import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "./AuthContext";
import { notificationServices } from "../services/notificationServices";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const { user, token, isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const SOCKET_SERVER_URL =
    process.env.REACT_APP_NODE_ENV === "development"
      ? process.env.REACT_APP_CHAT_SERVER_URL
      : process.env.REACT_APP_CHAT_SERVER_PROD;

  useEffect(() => {
    const bootstrap = async () => {
      if (!(isAuthenticated && user?.id)) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      try {
        const res = await notificationServices.getByUser(user.id, {
          page: 1,
          limit: 50,
        });
        const items = res?.data?.data || [];
        setNotifications(items);
        setUnreadCount(items.filter((n) => !n.isRead).length);
      } catch (e) {
        console.warn("Failed to load notifications:", e?.message || e);
      }
    };
    bootstrap();
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id && user?.fullName) {
      const newSocket = io(SOCKET_SERVER_URL, {
        auth: {
          userId: user.id,
          senderName: user.fullName,
        },
        autoConnect: true,
      });

      newSocket.on("connect", () => {
        console.log("Connected to chat server");
        setIsConnected(true);
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from chat server");
        setIsConnected(false);
      });

      newSocket.on("new_message", (message) => {
        // console.log("New message received:", message);
        setMessages((prev) => ({
          ...prev,
          [message.groupId]: [...(prev[message.groupId] || []), message],
        }));
      });

      newSocket.on("message_history", (data) => {
        // console.log("Message history received:", data);
        setMessages((prev) => ({
          ...prev,
          [data.groupId]: data.messages,
        }));
      });

      newSocket.on("user_typing", (data) => {
        setTypingUsers((prev) => ({
          ...prev,
          [data.groupId]: [
            ...(prev[data.groupId] || []).filter((id) => id !== data.userId),
            data.userId,
          ],
        }));
      });

      newSocket.on("user_stopped_typing", (data) => {
        setTypingUsers((prev) => ({
          ...prev,
          [data.groupId]: (prev[data.groupId] || []).filter(
            (id) => id !== data.userId
          ),
        }));
      });

      newSocket.on("error", (error) => {
        console.error("Socket error:", error);
      });

      newSocket.on("groups_joined", (data) => {
        // console.log("Groups joined:", data);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [isAuthenticated, user?.id, user?.fullName, SOCKET_SERVER_URL]);

  useEffect(() => {
    if (!socket || !isConnected || !user?.id) return;

    const channel = `notification-${user.id}`;

    const prependIfNew = (list, noti) => {
      const exists = list.some((x) => x.notificationId === noti.notificationId);
      return exists ? list : [noti, ...list];
    };

    const onRealtimeNoti = (noti) => {
      setNotifications((prev) => prependIfNew(prev, noti));
      setUnreadCount((c) => c + 1);
    };

    socket.on(channel, onRealtimeNoti);
    return () => {
      socket.off(channel, onRealtimeNoti);
    };
  }, [socket, isConnected, user?.id]);

  const joinGroups = (groupIds) => {
    if (socket && isConnected) {
      socket.emit("join_groups", { groupIds });
    }
  };

  const sendMessage = (groupId, messageType, contentText) => {
    if (socket && isConnected) {
      socket.emit("send_message", {
        groupId,
        messageType: messageType || "user_text",
        contentText,
      });
    }
  };

  const sendMessageWithAttachment = (
    groupId,
    messageType,
    contentText,
    attachment
  ) => {
    if (socket && isConnected) {
      socket.emit("send_message_with_attachment", {
        groupId,
        messageType: messageType || "user_img",
        contentText,
        attachment,
      });
    }
  };

  const getMessageHistory = (groupId, page = 1, limit = 50) => {
    if (socket && isConnected) {
      socket.emit("get_message_history", {
        groupId,
        page,
        limit,
      });
    }
  };

  const startTyping = (groupId) => {
    if (socket && isConnected) {
      socket.emit("typing_start", { groupId });
    }
  };

  const stopTyping = (groupId) => {
    if (socket && isConnected) {
      socket.emit("typing_stop", { groupId });
    }
  };

  const refreshNotifications = async (opts = { page: 1, limit: 50 }) => {
    if (!user?.id) return [];
    const res = await notificationServices.getByUser(user.id, opts);
    const items = res?.data?.data || [];
    setNotifications(items);
    setUnreadCount(items.filter((n) => !n.isRead).length);
    return items;
  };

  const markOneNotificationRead = async (notificationId) => {
    if (!user?.id) return;
    await notificationServices.markOneRead(notificationId, user.id);
    setNotifications((prev) =>
      prev.map((n) =>
        n.notificationId === notificationId ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllNotificationsRead = async () => {
    if (!user?.id) return;
    await notificationServices.markAllRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const clearAllNotifications = async () => {
    if (!user?.id) return;
    await notificationServices.clearAll(user.id);
    setNotifications([]);
    setUnreadCount(0);
  };

  const value = {
    socket,
    isConnected,
    messages,
    typingUsers,
    joinGroups,
    sendMessage,
    sendMessageWithAttachment,
    getMessageHistory,
    startTyping,
    stopTyping,
    getGroupMessages: (groupId) => messages[groupId] || [],
    getTypingUsers: (groupId) => typingUsers[groupId] || [],

    notifications,
    unreadCount,
    refreshNotifications,
    markOneNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
