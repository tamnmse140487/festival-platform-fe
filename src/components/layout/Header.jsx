import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();

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
          <button className="p-2 text-gray-400 hover:text-gray-600 relative transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          
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

const getRoleDisplayName = (role) => {
  const roleNames = {
    'admin': 'Quản trị viên',
    'school_manager': 'Quản lý trường',
    'teacher': 'Giáo viên',
    'student': 'Học sinh',
    'supplier': 'Nhà cung cấp',
    'guest': 'Khách'
  };
  return roleNames[role] || 'Người dùng';
};

export default Header;