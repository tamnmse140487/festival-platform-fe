import React, { useState, useRef, useEffect } from "react";
import { Menu, Bell, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getRoleDisplayName } from "../../utils/helpers";
import { useSocket } from "../../contexts/SocketContext";
import NotificationDropdown from "../notifications/NotificationDropdown";

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { unreadCount } = useSocket();
  const [open, setOpen] = useState(false);
  const notifWrapRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (notifWrapRef.current && notifWrapRef.current.contains(e.target))
        return;
      setOpen(false);
    };
    if (open) document.addEventListener("pointerdown", onClickOutside);
    return () => document.removeEventListener("pointerdown", onClickOutside);
  }, [open]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="flex-1 lg:hidden"></div>

        <div className="flex items-center space-x-4">
          <div ref={notifWrapRef} className="relative">
            <button
              className="p-2 text-gray-400 hover:text-gray-600 relative transition-colors"
              onClick={() => setOpen((v) => !v)}
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[10px] font-semibold text-white bg-red-500 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <NotificationDropdown
              open={open}
              onClose={() => setOpen(false)}
              containerRef={notifWrapRef}
            />
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={16} className="text-blue-600" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.full_name || user?.name}
              </p>
              <p className="text-xs text-gray-500">
                {getRoleDisplayName(user?.role)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
