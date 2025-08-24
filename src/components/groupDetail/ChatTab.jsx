import React, { useState, useEffect, useRef, useMemo } from "react";
import { Send, Paperclip } from "lucide-react";
import { useSocket } from "../../contexts/SocketContext";
import { chatServices } from "../../services/chatServices";
import toast from "react-hot-toast";

const ChatTab = ({ groupId, user }) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const listRef = useRef(null);
  const prevLenRef = useRef(0);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const {
    isConnected,
    joinGroups,
    sendMessage,
    sendMessageWithAttachment,
    getMessageHistory,
    startTyping,
    stopTyping,
    getGroupMessages,
    getTypingUsers,
  } = useSocket();

  const messages = getGroupMessages(groupId) || [];
  const typingUsers = getTypingUsers(groupId) || [];

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, [messages]);

  useEffect(() => {
    if (isConnected && groupId) {
      joinGroups([groupId]);
      getMessageHistory(groupId);
    }
  }, [isConnected, groupId, joinGroups, getMessageHistory]);

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const threshold = 80;
    const distance = el.scrollHeight - (el.scrollTop + el.clientHeight);
    setIsAtBottom(distance <= threshold);
  };

  useEffect(() => {
    const len = sortedMessages.length;
    const increased = len > prevLenRef.current;
    prevLenRef.current = len;
    if (!increased || len === 0) return;
    const last = sortedMessages[len - 1];
    const own = last?.senderId === user.id;
    if (isAtBottom || own) {
      scrollToBottom(len === 1 ? "auto" : "smooth");
    }
  }, [sortedMessages, isAtBottom, user.id]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !isConnected) return;
    sendMessage(groupId, "user_text", message);
    setMessage("");
    handleStopTyping();
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      startTyping(groupId);
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      stopTyping(groupId);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const uploadResponse = await chatServices.uploadFile(file);
      if (uploadResponse?.success) {
        const attachment = {
          attachmentType: "user_upload",
          fileType: uploadResponse.data.fileType,
          fileName: uploadResponse.data.fileName,
          fileUrl: uploadResponse.data.fileUrl,
          fileSize: uploadResponse.data.fileSize,
        };
        sendMessageWithAttachment(
          groupId,
          uploadResponse.data.fileType === "image" ? "user_img" : "user_text",
          `Đã gửi ${
            uploadResponse.data.fileType === "image" ? "hình ảnh" : "tài liệu"
          }: ${file.name}`,
          attachment
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải file lên");
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  };

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleImageError = (url, name) => {
    console.error('❌ Image load failed:', { url, name });
    setImageErrors(prev => new Set([...prev, url]));
    
    // Log detailed error info
    fetch(url, { method: 'HEAD', mode: 'cors' })
      .then(response => {
        console.log('Image URL test:', {
          url,
          status: response.status,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });
      })
      .catch(error => {
        console.error('Image URL fetch error:', error);
      });
  };

  const handleImageLoad = (url) => {
    console.log('✅ Image loaded successfully:', url);
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(url);
      return newSet;
    });
  };

  const renderMessage = (msg) => {
    const isOwnMessage = msg.senderId === user.id;
    const attachments = msg.attachments || [];
    return (
      <div
        key={msg.messageId}
        className={`flex ${
          isOwnMessage ? "justify-end" : "justify-start"
        } mb-4`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isOwnMessage
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          {!isOwnMessage && (
            <div className="text-xs font-semibold mb-1 opacity-70">
              {msg.senderName || `User ${msg.senderId}`}
            </div>
          )}
          <div className="break-words">{msg.contentText}</div>

          {attachments.length > 0 && (
            <div className="mt-2">
              {attachments.map((att, i) => {
                const type = att.file_type ?? att.fileType;
                const url = att.file_url ?? att.fileUrl;
                const name = att.file_name ?? att.fileName;
                const hasError = imageErrors.has(url);
                
                return (
                  <div key={i} className="border-t border-opacity-30 pt-2">
                    {type === "image" ? (
                      <div className="relative">
                        {!hasError ? (
                          <img
                            src={url}
                            alt={name}
                            className="max-w-full rounded cursor-pointer transition-opacity duration-200"
                            onClick={() => window.open(url, "_blank")}
                            onLoad={() => handleImageLoad(url)}
                            onError={() => handleImageError(url, name)}
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                        ) : (
                          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded p-4 text-center">
                            <div className="text-gray-500 mb-2">
                              <Paperclip size={24} className="mx-auto" />
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Không thể tải ảnh: {name}
                            </p>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-sm underline ${
                                isOwnMessage
                                  ? "text-blue-100 hover:text-white"
                                  : "text-blue-600 hover:text-blue-800"
                              }`}
                            >
                              Mở trong tab mới
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center space-x-2 ${
                          isOwnMessage
                            ? "text-blue-100 hover:text-white"
                            : "text-blue-600 hover:text-blue-800"
                        }`}
                      >
                        <Paperclip size={16} />
                        <span className="text-sm">{name}</span>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div
            className={`text-xs mt-1 ${
              isOwnMessage ? "text-blue-100" : "text-gray-500"
            }`}
          >
            {formatTime(msg.createdAt)}
          </div>
        </div>
      </div>
    );
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
        <p className="text-gray-600">Đang kết nối đến server chat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white rounded-lg border h-[65vh]">
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <h3 className="font-semibold text-gray-800">Chat nhóm</h3>
        <p className="text-sm text-gray-600 mb-0">
          {isConnected ? "🟢 Đã kết nối" : "🔴 Mất kết nối"}
        </p>
      </div>
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {sortedMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Chưa có tin nhắn nào</p>
            <p className="text-sm">Hãy gửi tin nhắn đầu tiên!</p>
          </div>
        ) : (
          sortedMessages.map(renderMessage)
        )}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t bg-gray-50 rounded-b-lg"
      >
        <div className="flex space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx,.txt"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            {uploadingFile ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <Paperclip size={20} />
            )}
          </button>
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            placeholder="Nhập tin nhắn..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!message.trim() || !isConnected}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatTab;