import React from 'react';
import { User, Mail, Phone, Shield, Edit, Save } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { getRoleDisplayName } from '../../utils/helpers';

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
          value={profileData.fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
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
      </div>

      {profileData.schoolInfo && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">Thông tin trường học</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Tên trường:</span>
              <p className="text-blue-600">{profileData.schoolInfo.schoolName}</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Địa chỉ:</span>
              <p className="text-blue-600">{profileData.schoolInfo.address}</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Liên hệ:</span>
              <p className="text-blue-600">{profileData.schoolInfo.contactInfo}</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Mô tả:</span>
              <p className="text-blue-600">{profileData.schoolInfo.description}</p>
            </div>
          </div>
        </div>
      )}

      {profileData.supplierInfo && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900 mb-3">Thông tin nhà cung cấp</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-700 font-medium">Tên công ty:</span>
              <p className="text-green-600">{profileData.supplierInfo.companyName}</p>
            </div>
            <div>
              <span className="text-green-700 font-medium">Giấy phép kinh doanh:</span>
              <p className="text-green-600">{profileData.supplierInfo.businessLicense}</p>
            </div>
            <div>
              <span className="text-green-700 font-medium">Danh mục:</span>
              <p className="text-green-600">{profileData.supplierInfo.category}</p>
            </div>
            <div>
              <span className="text-green-700 font-medium">Địa chỉ:</span>
              <p className="text-green-600">{profileData.supplierInfo.address}</p>
            </div>
          </div>
        </div>
      )}

      {profileData.relationInfo && (
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <h4 className="font-medium text-purple-900 mb-3">Thông tin trường học</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-purple-700 font-medium">Tên trường:</span>
              <p className="text-purple-600">{profileData.relationInfo.school.schoolName}</p>
            </div>
            <div>
              <span className="text-purple-700 font-medium">Vai trò:</span>
              <p className="text-purple-600">
                {profileData.relationInfo.relation.relationType === 'teacher' ? 'Giáo viên' : 'Học sinh'}
              </p>
            </div>
            <div>
              <span className="text-purple-700 font-medium">Địa chỉ:</span>
              <p className="text-purple-600">{profileData.relationInfo.school.address}</p>
            </div>
            <div>
              <span className="text-purple-700 font-medium">Liên hệ:</span>
              <p className="text-purple-600">{profileData.relationInfo.school.contactInfo}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileTab;