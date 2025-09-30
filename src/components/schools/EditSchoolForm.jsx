import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { accountServices } from '../../services/accountServices';
import { schoolServices } from '../../services/schoolServices';
import toast from 'react-hot-toast';

const EditSchoolForm = ({ school, accountInfo, onClose, onEditSuccess }) => {
  const [formData, setFormData] = useState({
    email: accountInfo?.email || '',
    password: '',
    phoneNumber: accountInfo?.phoneNumber || '',
    contactInfo: school.contactInfo || '',
    logoUrl: school.logoUrl || '',
    description: school.description || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const accountUpdateData = {
        // email: formData.email,
        // phoneNumber: formData.phoneNumber,
        updatedAt: new Date().toISOString()
      };

      if (formData.password.trim()) {
        accountUpdateData.password = formData.password;
      }

      await accountServices.update({ id: school.accountId }, accountUpdateData);

      const schoolUpdateParams = {
        id: school?.schoolId,
        contactInfo: formData.contactInfo,
        logoUrl: formData.logoUrl,
        description: formData.description
      };

      const response = await schoolServices.update(schoolUpdateParams);
      toast.success('Cập nhật thông tin thành công');
      onEditSuccess(response?.data);
    } catch (error) {
      console.error('Error updating school:', error);
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Thông tin tài khoản</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            required
            placeholder="contact@school.edu.vn"
            value={formData.email}
            disabled
            onChange={(e) => handleChange('email', e.target.value)}
            className="bg-gray-300"
          />

          <Input
            label="Số điện thoại"
            required
            placeholder="0901234567"
            value={formData.phoneNumber}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            className="bg-gray-300"
            disabled
          />
        </div>

        <Input
          label="Mật khẩu mới"
          type="password"
          placeholder="Để trống nếu không muốn thay đổi"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Thông tin trường học</h4>

        <Input
          label="Thông tin liên hệ"
          required
          placeholder="028-12345678"
          value={formData.contactInfo}
          onChange={(e) => handleChange('contactInfo', e.target.value)}
        />

        <Input
          label="URL Logo"
          placeholder="https://..."
          value={formData.logoUrl}
          onChange={(e) => handleChange('logoUrl', e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả
          </label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Nhập mô tả về trường học"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          loading={isLoading}
        >
          Cập nhật
        </Button>
      </div>
    </form>
  );
};

export default EditSchoolForm;