import React, { useState } from 'react';
import { Key } from 'lucide-react';
import { Input, Form, Button, message } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { accountServices } from '../../services/accountServices';
import toast from 'react-hot-toast';

const SecurityTab = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await accountServices.updatePassword({
        accountId: user.id,
        oldPassword: values.currentPassword,
        newPassword: values.newPassword
      });

      toast.success('Cập nhật mật khẩu thành công!');
      form.resetFields();
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Có lỗi xảy ra khi cập nhật mật khẩu');
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Mật khẩu là bắt buộc'));
    }
    if (value.length < 6) {
      return Promise.reject(new Error('Mật khẩu phải có ít nhất 6 ký tự'));
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Xác nhận mật khẩu là bắt buộc'));
    }
    if (value !== form.getFieldValue('newPassword')) {
      return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
    }
    return Promise.resolve();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Đổi mật khẩu</h3>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="max-w-md"
        >
          <Form.Item
            label="Mật khẩu hiện tại"
            name="currentPassword"
            rules={[
              { required: true, message: 'Mật khẩu hiện tại là bắt buộc' }
            ]}
          >
            <Input.Password
              prefix={<Key size={16} />}
              placeholder="Nhập mật khẩu hiện tại"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { validator: validatePassword }
            ]}
          >
            <Input.Password
              prefix={<Key size={16} />}
              placeholder="Nhập mật khẩu mới"
            />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            rules={[
              { validator: validateConfirmPassword }
            ]}
          >
            <Input.Password
              prefix={<Key size={16} />}
              placeholder="Xác nhận mật khẩu mới"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              Cập nhật mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default SecurityTab;