import React, { useState } from 'react';
import { User, Mail, Phone, School, MapPin, Calendar, Edit, Save, Camera, Key, Bell, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { getRoleDisplayName } from '../../utils/helpers';

const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    address: '',
    bio: ''
  });

  const tabs = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: <User size={16} /> },
    { id: 'security', label: 'Bảo mật', icon: <Shield size={16} /> },
    { id: 'notifications', label: 'Thông báo', icon: <Bell size={16} /> }
  ];

  const handleSave = () => {
    console.log('Saving profile:', profileData);
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
          <p className="text-gray-600 mt-1">
            Quản lý thông tin tài khoản và cài đặt bảo mật.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <Card.Content>
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <User className="w-12 h-12 text-blue-600" />
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                    <Camera size={16} />
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {user?.full_name}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {getRoleDisplayName(user?.role)}
                </p>
                <p className="text-gray-500 text-xs">
                  {user?.school?.school_name || user?.company?.company_name || user?.organization?.name}
                </p>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Tham gia từ</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(user?.created_at || '2024-01-01').toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    {tab.icon}
                    <span className="ml-2">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <Card.Content>
              {activeTab === 'profile' && (
                <ProfileTab
                  profileData={profileData}
                  isEditing={isEditing}
                  onEdit={() => setIsEditing(true)}
                  onSave={handleSave}
                  onCancel={() => setIsEditing(false)}
                  onChange={handleChange}
                  user={user}
                />
              )}
              {activeTab === 'security' && <SecurityTab />}
              {activeTab === 'notifications' && <NotificationsTab />}
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ProfileTab = ({ profileData, isEditing, onEdit, onSave, onCancel, onChange, user }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h3>
        {!isEditing ? (
          <Button size="sm" onClick={onEdit} icon={<Edit size={16} />}>
            Chỉnh sửa
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              Hủy
            </Button>
            <Button size="sm" onClick={onSave} icon={<Save size={16} />}>
              Lưu
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Họ và tên"
          leftIcon={<User size={20} />}
          value={profileData.full_name}
          onChange={(e) => onChange('full_name', e.target.value)}
          disabled={!isEditing}
        />

        <Input
          label="Email"
          type="email"
          leftIcon={<Mail size={20} />}
          value={profileData.email}
          onChange={(e) => onChange('email', e.target.value)}
          disabled={!isEditing}
        />

        <Input
          label="Số điện thoại"
          leftIcon={<Phone size={20} />}
          value={profileData.phone_number}
          onChange={(e) => onChange('phone_number', e.target.value)}
          disabled={!isEditing}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vai trò
          </label>
          <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
            <Shield size={20} className="text-gray-400" />
            <span className="text-gray-700">
              {getRoleDisplayName(user?.role)}
            </span>
          </div>
        </div>

        <div className="md:col-span-2">
          <Input
            label="Địa chỉ"
            leftIcon={<MapPin size={20} />}
            value={profileData.address}
            onChange={(e) => onChange('address', e.target.value)}
            disabled={!isEditing}
            placeholder="Nhập địa chỉ của bạn"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giới thiệu bản thân
          </label>
          <textarea
            rows={4}
            placeholder="Viết vài dòng giới thiệu về bản thân..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            value={profileData.bio}
            onChange={(e) => onChange('bio', e.target.value)}
            disabled={!isEditing}
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tổ chức</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {user?.role === 'supplier' ? 'Công ty' : 'Trường/Tổ chức'}
            </label>
            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
              <School size={20} className="text-gray-400" />
              <span className="text-gray-700">
                {user?.school?.school_name || user?.company?.company_name || user?.organization?.name}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày tham gia
            </label>
            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
              <Calendar size={20} className="text-gray-400" />
              <span className="text-gray-700">
                {new Date(user?.created_at || '2024-01-01').toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SecurityTab = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Đổi mật khẩu</h3>
        <div className="space-y-4 max-w-md">
          <Input
            label="Mật khẩu hiện tại"
            type="password"
            leftIcon={<Key size={20} />}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <Input
            label="Mật khẩu mới"
            type="password"
            leftIcon={<Key size={20} />}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <Input
            label="Xác nhận mật khẩu mới"
            type="password"
            leftIcon={<Key size={20} />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button>
            Cập nhật mật khẩu
          </Button>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bảo mật tài khoản</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Xác thực hai yếu tố</h4>
              <p className="text-sm text-gray-600">Thêm lớp bảo mật cho tài khoản</p>
            </div>
            <Button variant="outline" size="sm">
              Bật
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Đăng nhập từ thiết bị mới</h4>
              <p className="text-sm text-gray-600">Gửi email thông báo khi có đăng nhập mới</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationsTab = () => {
  const notificationSettings = [
    {
      id: 'email_festivals',
      title: 'Lễ hội mới',
      description: 'Thông báo khi có lễ hội mới được tạo',
      enabled: true
    },
    {
      id: 'email_orders',
      title: 'Đơn hàng',
      description: 'Thông báo về trạng thái đơn hàng',
      enabled: true
    },
    {
      id: 'email_points',
      title: 'Điểm tích lũy',
      description: 'Thông báo khi nhận được điểm mới',
      enabled: false
    },
    {
      id: 'email_games',
      title: 'Mini Games',
      description: 'Thông báo về game mới và kết quả',
      enabled: true
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt thông báo</h3>
        <p className="text-gray-600 mb-6">Chọn loại thông báo bạn muốn nhận</p>
      </div>

      <div className="space-y-4">
        {notificationSettings.map((setting) => (
          <div key={setting.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">{setting.title}</h4>
              <p className="text-sm text-gray-600">{setting.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                defaultChecked={setting.enabled}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="border-t pt-6">
        <Button>
          Lưu cài đặt
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;