import React, { useState } from 'react';
import { Settings, Database, Shield, Bell, Mail, Globe, Save, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { ROLE_NAME } from '../../utils/constants';

const SystemSettingsPage = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'general', label: 'Cài đặt chung', icon: <Settings size={16} /> },
    { id: 'database', label: 'Cơ sở dữ liệu', icon: <Database size={16} /> },
    { id: 'security', label: 'Bảo mật', icon: <Shield size={16} /> },
    { id: 'notifications', label: 'Thông báo', icon: <Bell size={16} /> },
    { id: 'email', label: 'Email', icon: <Mail size={16} /> },
    { id: 'localization', label: 'Ngôn ngữ', icon: <Globe size={16} /> }
  ];


  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt Hệ thống</h1>
          <p className="text-gray-600 mt-1">
            Quản lý cấu hình và tùy chọn toàn hệ thống Festival Hub.
          </p>
        </div>
      </div>

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
          {activeTab === 'general' && <GeneralSettings isLoading={isLoading} setIsLoading={setIsLoading} />}
          {activeTab === 'database' && <DatabaseSettings isLoading={isLoading} setIsLoading={setIsLoading} />}
          {activeTab === 'security' && <SecuritySettings isLoading={isLoading} setIsLoading={setIsLoading} />}
          {activeTab === 'notifications' && <NotificationSettings isLoading={isLoading} setIsLoading={setIsLoading} />}
          {activeTab === 'email' && <EmailSettings isLoading={isLoading} setIsLoading={setIsLoading} />}
          {activeTab === 'localization' && <LocalizationSettings isLoading={isLoading} setIsLoading={setIsLoading} />}
        </Card.Content>
      </Card>
    </div>
  );
};

const GeneralSettings = ({ isLoading, setIsLoading }) => {
  const [settings, setSettings] = useState({
    site_name: 'Festival Hub',
    site_description: 'Hệ thống quản lý lễ hội cho các trường học',
    admin_email: 'admin@festivalhub.vn',
    max_upload_size: '10',
    timezone: 'Asia/Ho_Chi_Minh',
    date_format: 'dd/MM/yyyy',
    currency: 'VND',
    maintenance_mode: false
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Saving general settings:', settings);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin chung</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Tên hệ thống"
            value={settings.site_name}
            onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
          />

          <Input
            label="Email quản trị"
            type="email"
            value={settings.admin_email}
            onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
          />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả hệ thống
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={settings.site_description}
              onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cấu hình hệ thống</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kích thước file tối đa (MB)
            </label>
            <input
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={settings.max_upload_size}
              onChange={(e) => setSettings({ ...settings, max_upload_size: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Múi giờ
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            >
              <option value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</option>
              <option value="Asia/Bangkok">Bangkok (UTC+7)</option>
              <option value="Asia/Singapore">Singapore (UTC+8)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Định dạng ngày
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={settings.date_format}
              onChange={(e) => setSettings({ ...settings, date_format: e.target.value })}
            >
              <option value="dd/MM/yyyy">dd/MM/yyyy</option>
              <option value="MM/dd/yyyy">MM/dd/yyyy</option>
              <option value="yyyy-MM-dd">yyyy-MM-dd</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đơn vị tiền tệ
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
            >
              <option value="VND">Việt Nam Đồng (VND)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chế độ bảo trì</h3>
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Bật chế độ bảo trì</h4>
            <p className="text-sm text-gray-600">Hệ thống sẽ hiển thị trang bảo trì cho tất cả người dùng</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.maintenance_mode}
              onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} loading={isLoading} icon={<Save size={16} />}>
          Lưu cài đặt
        </Button>
      </div>
    </div>
  );
};

const DatabaseSettings = ({ isLoading, setIsLoading }) => {
  const [backupStatus, setBackupStatus] = useState({
    last_backup: '2025-06-02 08:30:00',
    backup_size: '2.4 GB',
    auto_backup: true,
    backup_frequency: 'daily'
  });

  const handleBackup = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('Creating backup...');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái cơ sở dữ liệu</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">Hoạt động</div>
            <div className="text-green-800 font-medium">Kết nối DB</div>
          </div>

          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">2.4 GB</div>
            <div className="text-blue-800 font-medium">Kích thước DB</div>
          </div>

          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">15,432</div>
            <div className="text-purple-800 font-medium">Tổng bản ghi</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sao lưu dữ liệu</h3>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900">Sao lưu lần cuối</h4>
                <p className="text-sm text-gray-600">{backupStatus.last_backup}</p>
                <p className="text-sm text-gray-600">Kích thước: {backupStatus.backup_size}</p>
              </div>
              <Button
                onClick={handleBackup}
                loading={isLoading}
                icon={<Database size={16} />}
              >
                Sao lưu ngay
              </Button>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Tự động sao lưu</h4>
                <p className="text-sm text-gray-600">Sao lưu dữ liệu theo lịch trình</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={backupStatus.auto_backup}
                  onChange={(e) => setBackupStatus({ ...backupStatus, auto_backup: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {backupStatus.auto_backup && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tần suất sao lưu
                </label>
                <select
                  className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={backupStatus.backup_frequency}
                  onChange={(e) => setBackupStatus({ ...backupStatus, backup_frequency: e.target.value })}
                >
                  <option value="hourly">Mỗi giờ</option>
                  <option value="daily">Hằng ngày</option>
                  <option value="weekly">Hằng tuần</option>
                  <option value="monthly">Hằng tháng</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SecuritySettings = ({ isLoading, setIsLoading }) => {
  const [securitySettings, setSecuritySettings] = useState({
    require_2fa: false,
    session_timeout: '24',
    password_min_length: '8',
    max_login_attempts: '5',
    lockout_duration: '30',
    api_rate_limit: '1000'
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Saving security settings:', securitySettings);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt bảo mật</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Bắt buộc xác thực 2 yếu tố</h4>
              <p className="text-sm text-gray-600">Yêu cầu tất cả người dùng bật 2FA</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={securitySettings.require_2fa}
                onChange={(e) => setSecuritySettings({ ...securitySettings, require_2fa: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian hết hạn phiên (giờ)
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={securitySettings.session_timeout}
                onChange={(e) => setSecuritySettings({ ...securitySettings, session_timeout: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Độ dài mật khẩu tối thiểu
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={securitySettings.password_min_length}
                onChange={(e) => setSecuritySettings({ ...securitySettings, password_min_length: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lần đăng nhập sai tối đa
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={securitySettings.max_login_attempts}
                onChange={(e) => setSecuritySettings({ ...securitySettings, max_login_attempts: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian khóa tài khoản (phút)
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={securitySettings.lockout_duration}
                onChange={(e) => setSecuritySettings({ ...securitySettings, lockout_duration: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giới hạn tốc độ API (requests/hour)
            </label>
            <input
              type="number"
              className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={securitySettings.api_rate_limit}
              onChange={(e) => setSecuritySettings({ ...securitySettings, api_rate_limit: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} loading={isLoading} icon={<Save size={16} />}>
          Lưu cài đặt
        </Button>
      </div>
    </div>
  );
};

const NotificationSettings = ({ isLoading, setIsLoading }) => {
  return (
    <div className="text-center py-12">
      <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Cài đặt thông báo</h3>
      <p className="text-gray-600">Tính năng đang được phát triển</p>
    </div>
  );
};

const EmailSettings = ({ isLoading, setIsLoading }) => {
  return (
    <div className="text-center py-12">
      <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Cài đặt email</h3>
      <p className="text-gray-600">Tính năng đang được phát triển</p>
    </div>
  );
};

const LocalizationSettings = ({ isLoading, setIsLoading }) => {
  return (
    <div className="text-center py-12">
      <Globe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Cài đặt ngôn ngữ</h3>
      <p className="text-gray-600">Tính năng đang được phát triển</p>
    </div>
  );
};

export default SystemSettingsPage;