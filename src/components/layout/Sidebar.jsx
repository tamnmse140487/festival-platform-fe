import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  ShoppingCart,
  Store,
  GamepadIcon,
  Coins,
  School,
  LogOut,
  X,
  User,
  Settings,
  ChefHat,
  UserPen,
  Handshake,
  SquareUser,
  TicketCheck,
  RefreshCcw,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { ROLE_NAME } from "../../utils/constants";

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const navigationItems = [
    {
      id: "dashboard",
      label: "Tổng quan",
      icon: Calendar,
      path: "/app/dashboard",
      roles: [ROLE_NAME.ADMIN, ROLE_NAME.SCHOOL_MANAGER],
    },
    {
      id: "festivals",
      label: "Lễ hội",
      icon: Calendar,
      path: "/app/festivals",
      roles: [
        ROLE_NAME.ADMIN,
        ROLE_NAME.SCHOOL_MANAGER,
        ROLE_NAME.STUDENT,
        ROLE_NAME.SUPPLIER,
        ROLE_NAME.TEACHER,
        ROLE_NAME.USER,
      ],
    },
    {
      id: "festivals_followed",
      label: "Lễ hội quan tâm",
      icon: TicketCheck,
      path: "/app/festivals-followed",
      roles: [
        ROLE_NAME.USER,
        ROLE_NAME.STUDENT,
        ROLE_NAME.TEACHER,
      ],
    },
    // {
    //   id: 'suppliers',
    //   label: 'Nhà cung cấp',
    //   icon: Store,
    //   path: '/app/suppliers',
    //   roles: [ROLE_NAME.ADMIN, ROLE_NAME.SCHOOL_MANAGER]
    // },
    // {
    //   id: 'ingredients',
    //   label: 'Quản lý nguyên liệu',
    //   icon: ChefHat,
    //   path: '/app/ingredients',
    //   roles: [ROLE_NAME.SUPPLIER, ROLE_NAME.ADMIN]
    // },
    // {
    //   id: 'supplies',
    //   label: 'Quản lý cung cấp',
    //   icon: Handshake,
    //   path: '/app/supplies',
    //   roles: [ROLE_NAME.SUPPLIER, ROLE_NAME.ADMIN, ROLE_NAME.SCHOOL_MANAGER]
    // },
    {
      id: "schools",
      label: "Quản lý trường",
      icon: School,
      path: "/app/schools",
      roles: [ROLE_NAME.ADMIN],
    },
    {
      id: "accounts",
      label: "Quản lý tài khoản",
      icon: UserPen,
      path: "/app/accounts",
      roles: [ROLE_NAME.SCHOOL_MANAGER, ROLE_NAME.ADMIN],
    },
    {
      id: "refunds",
      label: "Yêu cầu hoàn tiền",
      icon: RefreshCcw,
      path: "/app/refunds",
      roles: [ROLE_NAME.ADMIN],
    },
    {
      id: "groups",
      label:
        user?.role === ROLE_NAME.SCHOOL_MANAGER
          ? "Nhóm học sinh"
          : "Nhóm của tôi",
      icon: Users,
      path: "/app/groups",
      roles: [ROLE_NAME.SCHOOL_MANAGER, ROLE_NAME.TEACHER, ROLE_NAME.STUDENT],
    },
    {
      id: "profile",
      label: "Quản lý cá nhân",
      icon: SquareUser,
      path: "/app/profile",
      roles: [
        ROLE_NAME.SCHOOL_MANAGER,
        ROLE_NAME.ADMIN,
        ROLE_NAME.TEACHER,
        ROLE_NAME.STUDENT,
        ROLE_NAME.SUPPLIER,
        ROLE_NAME.USER,
      ],
    },
    // {
    //   id: 'booths',
    //   label: 'Gian hàng',
    //   icon: ShoppingCart,
    //   path: '/app/booths',
    //   roles: [ROLE_NAME.ADMIN, ROLE_NAME.SCHOOL_MANAGER]
    // },
    // {
    //   id: 'games',
    //   label: 'Mini Games',
    //   icon: GamepadIcon,
    //   path: '/app/games',
    //   roles: [ROLE_NAME.STUDENT, ROLE_NAME.USER]
    // },
    // {
    //   id: 'points',
    //   label: 'Điểm tích lũy',
    //   icon: Coins,
    //   path: '/app/points',
    //   roles: [ROLE_NAME.STUDENT, ROLE_NAME.USER]
    // },
    // {
    //   id: 'system',
    //   label: 'Hệ thống',
    //   icon: Settings,
    //   path: '/app/system',
    //   roles: [ROLE_NAME.ADMIN]
    // }
  ];

  const visibleNavItems = navigationItems.filter((item) => hasRole(item.roles));

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <School className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Festival Hub</h1>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="mt-6 px-3">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `w-full flex items-center px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <Icon size={20} className="mr-3" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={20} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.fullName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.schoolName || user?.companyName || "Festival Hub"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut size={16} className="mr-3" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
