import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, CircleX, MoreHorizontal, Trash2 } from "lucide-react";
import { useSocket } from "../../contexts/SocketContext";
import { useAuth } from "../../contexts/AuthContext";
import { notificationServices } from "../../services/notificationServices";
import { Dropdown } from "antd";
import { navTargetByType, timeAgo } from "../../utils/helpers";
import { useNavigate } from "react-router-dom";

const LIMIT = 50;

export default function NotificationDropdown({
  open,
  onClose,
  align = "left",
  containerRef,
}) {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    refreshNotifications,
    markOneNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
  } = useSocket();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    const bootstrap = async () => {
      if (!open || !user?.id) return;

      try {
        if (filter === "all") {
          await refreshNotifications({ page: 1, limit: LIMIT });
          const base = notifications ? [...notifications] : [];
          setItems(base);
          setPage(1);
          setHasMore((base.length || 0) === LIMIT);
        } else {
          const res = await notificationServices.getByUser(user.id, {
            page: 1,
            limit: LIMIT,
            is_read: false,
          });
          const data = res?.data?.data || [];
          setItems(data);
          setPage(1);
          setHasMore(data.length === LIMIT);
        }
      } catch (e) {
        console.warn("Bootstrap notifications failed:", e?.message || e);
        setItems([]);
        setPage(1);
        setHasMore(false);
      }
    };

    bootstrap();
  }, [open, user?.id, filter]);

  useEffect(() => {
    if (!open) return;

    setItems((prev) => {
      if (!notifications || !notifications.length) return prev;
      const map = new Map(prev.map((x) => [x.notificationId, x]));
      let next = prev;

      notifications.forEach((n) => {
        const passesFilter = filter === "all" ? true : !n.isRead;
        if (passesFilter && !map.has(n.notificationId)) {
          map.set(n.notificationId, n);
          next = [n, ...next];
        }
      });
      return next;
    });
  }, [notifications, open, filter]);

  const handleItemClick = async (n) => {
    try {
      if (!n.isRead) {
        await markOneNotificationRead(n.notificationId);
        setItems((prev) => {
          const next = prev.map((x) =>
            x.notificationId === n.notificationId ? { ...x, isRead: true } : x
          );
          return filter === "unread" ? next.filter((x) => !x.isRead) : next;
        });
      }
    } catch (e) {
      console.warn("Mark read failed:", e?.message || e);
    } finally {
      const target = navTargetByType(n);
      if (target) {
        navigate(target);
        onClose?.();
      }
    }
  };

  const loadMore = async () => {
    if (!user?.id || loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await notificationServices.getByUser(user.id, {
        page: nextPage,
        limit: LIMIT,
        ...(filter === "unread" ? { is_read: false } : {}),
      });
      const data = res?.data?.data || [];
      setItems((prev) => {
        const existing = new Set(prev.map((x) => x.notificationId));
        const appended = data.filter((x) => !existing.has(x.notificationId));
        return [...prev, ...appended];
      });
      setPage(nextPage);
      setHasMore(data.length === LIMIT);
    } catch (e) {
      console.warn("Load more notifications failed:", e?.message || e);
    } finally {
      setLoading(false);
    }
  };

  const onScroll = (e) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
    if (nearBottom) loadMore();
  };

  const handleMarkOne = async (id) => {
    await markOneNotificationRead(id);
    setItems((prev) => {
      const next = prev.map((n) =>
        n.notificationId === id ? { ...n, isRead: true } : n
      );
      return filter === "unread" ? next.filter((n) => !n.isRead) : next;
    });
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    if (filter === "unread") {
      setItems([]);
      setHasMore(false);
      setPage(1);
    } else {
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const handleClearAll = async () => {
    await clearAllNotifications();
    setItems([]);
    setHasMore(false);
    setPage(1);
  };

  if (!open) return null;

  const menuItems = [
    {
      key: "markAll",
      label: (
        <span className="inline-flex items-center gap-2">
          <CheckCircle2 size={14} />
          Đánh dấu tất cả là đã đọc
        </span>
      ),
      onClick: handleMarkAll,
    },
    { type: "divider" },
    {
      key: "clearAll",
      danger: true,
      label: (
        <span className="inline-flex items-center gap-2">
          <Trash2 size={14} />
          Xoá tất cả thông báo
        </span>
      ),
      onClick: handleClearAll,
    },
    { type: "divider" },
    {
      key: "close",
      label: (
        <span className="inline-flex items-center gap-2">
          <CircleX size={14} />
          Đóng
        </span>
      ),
      onClick: () => onClose?.(),
    },
  ];

  return (
    <div
      className={`absolute ${align === "right" ? "right-0" : "left-0"} mt-2 
                  w-[360px] max-h-[70vh] bg-white shadow-xl rounded-2xl 
                  border border-gray-200 z-50`}
    >
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-900">Thông báo</p>

          <div className="ml-2 flex items-center gap-1">
            <button
              className={`text-xs px-2 py-1 rounded-full border ${
                filter === "all"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => setFilter("all")}
            >
              Tất cả
            </button>
            <button
              className={`text-xs px-2 py-1 rounded-full border ${
                filter === "unread"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => setFilter("unread")}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>
        </div>

        <Dropdown
          trigger={["click"]}
          placement="bottomRight"
          menu={{ items: menuItems }}
          getPopupContainer={() => containerRef?.current || document.body}
        >
          <button
            className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 hover:bg-gray-50"
            aria-label="More actions"
          >
            <MoreHorizontal size={18} />
          </button>
        </Dropdown>
      </div>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="max-h-[60vh] overflow-y-auto scrollbar-thin"
      >
        {items.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            Chưa có thông báo
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 border-b-1 ">
            {items.map((n) => (
              <li
                key={n.notificationId}
                role="button"
                tabIndex={0}
                onClick={() => handleItemClick(n)}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && handleItemClick(n)
                }
                className={`px-4 py-3 hover:bg-gray-50 transition cursor-pointer ${
                  n.isRead ? "opacity-70" : "bg-white"
                }`}
                aria-label={`Notification: ${n.content || ""}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1 inline-block w-2 h-2 rounded-full ${
                      n.isRead ? "bg-gray-300" : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 break-words">
                      {n.content || "(no content)"}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {loading && (
          <div className="p-3 text-center text-xs text-gray-500">Loading…</div>
        )}
        {!loading && !hasMore && items.length > 0 && (
          <div className="p-3 text-center text-xs text-gray-400">
            Đã hết thông báo
          </div>
        )}
      </div>
    </div>
  );
}
