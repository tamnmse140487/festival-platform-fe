import React, { useState } from 'react';
import { Key } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

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
    </div>
  );
};

export default SecurityTab;