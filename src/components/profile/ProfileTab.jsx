import React, { useState } from "react";
import { User, Mail, Phone, Shield, Edit, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { getRoleDisplayName } from "../../utils/helpers";
import { ROLE_NAME } from "../../utils/constants";
import { accountServices } from "../../services/accountServices";
import { schoolServices } from "../../services/schoolServices";
import { uploadService } from "../../services/uploadServices";

const ProfileTab = ({
  profileData,
  originalData,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onChange,
  user,
  isOwnProfile = true,
  selectedAvatar,
  onDataUpdate
}) => {
  const [saving, setSaving] = useState(false);

  const hasAccountChanges = () => {
    const changes = {};
    
    if (profileData.fullName !== originalData.fullName) {
      changes.fullName = profileData.fullName;
    }
    
    if (profileData.phone_number !== originalData.phone_number) {
      changes.phoneNumber = profileData.phone_number;
    }
    
    if (user.role === ROLE_NAME.STUDENT && profileData.className !== originalData.className) {
      changes.className = profileData.className;
    }

    return Object.keys(changes).length > 0 ? changes : null;
  };

  const hasSchoolChanges = () => {
    if (user.role !== ROLE_NAME.SCHOOL_MANAGER || !profileData.schoolInfo) {
      return null;
    }

    const changes = {};
    
    if (profileData.schoolInfo.contactInfo !== profileData.schoolInfo.originalContactInfo) {
      changes.contactInfo = profileData.schoolInfo.contactInfo;
    }
    
    if (profileData.schoolInfo.description !== profileData.schoolInfo.originalDescription) {
      changes.description = profileData.schoolInfo.description;
    }

    return Object.keys(changes).length > 0 ? changes : null;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let avatarUrl = profileData.avatarUrl;

      if (selectedAvatar) {
        avatarUrl = await uploadService.uploadAvatarImage(selectedAvatar);
      }

      const accountChanges = hasAccountChanges();
      const hasAvatarChange = avatarUrl !== originalData.avatarUrl;

      if (accountChanges || hasAvatarChange) {
        const updateData = { ...accountChanges };
        
        if (hasAvatarChange) {
          updateData.avatarUrl = avatarUrl;
        }
        
        updateData.status = true;
        updateData.updatedAt = new Date().toISOString();
        
        await accountServices.update({ id: user.id }, updateData);
      }

      const schoolChanges = hasSchoolChanges();
      if (schoolChanges || (user.role === ROLE_NAME.SCHOOL_MANAGER && hasAvatarChange)) {
        const updateParams = { id: user.schoolId };
        
        if (schoolChanges) {
          Object.assign(updateParams, schoolChanges);
        }
        
        if (hasAvatarChange) {
          updateParams.logoUrl = avatarUrl;
        }
        
        await schoolServices.update(updateParams);
      }

      toast.success('Cập nhật thông tin thành công!');
      
      if (onDataUpdate) {
        onDataUpdate();
      }
      
      onSave();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Thông tin cá nhân
        </h3>
        {isOwnProfile && !isEditing ? (
          <Button size="sm" onClick={onEdit} icon={<Edit size={16} />}>
            Chỉnh sửa
          </Button>
        ) : isOwnProfile && isEditing ? (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onCancel} disabled={saving}>
              Hủy
            </Button>
            <Button size="sm" onClick={handleSave} loading={saving} icon={<Save size={16} />}>
              Lưu
            </Button>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Họ và tên"
          leftIcon={<User size={20} />}
          value={profileData.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          disabled={!isEditing || !isOwnProfile}
        />

        <Input
          label="Email"
          type="email"
          leftIcon={<Mail size={20} />}
          value={profileData.email}
          disabled={true}
        />

        <Input
          label="Số điện thoại"
          leftIcon={<Phone size={20} />}
          value={profileData.phone_number}
          onChange={(e) => onChange("phone_number", e.target.value)}
          disabled={!isEditing || !isOwnProfile}
        />

        {user?.role === ROLE_NAME.STUDENT && (
          <Input
            label="Lớp học"
            value={profileData.className || ""}
            onChange={(e) => onChange("className", e.target.value)}
            disabled={!isEditing || !isOwnProfile}
          />
        )}

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

      {user?.role === ROLE_NAME.SCHOOL_MANAGER && profileData.schoolInfo && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">
            Thông tin trường học
          </h4>
          <div className="space-y-4">
            <div>
              <span className="text-blue-700 font-medium block">Tên trường:</span>
              <p className="text-blue-600">{profileData.schoolInfo.schoolName}</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium block">Địa chỉ:</span>
              <p className="text-blue-600">{profileData.schoolInfo.address}</p>
            </div>
            <div>
              <label className="text-blue-700 font-medium block mb-1">Liên hệ:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.schoolInfo.contactInfo || ''}
                  onChange={(e) => onChange("schoolInfo", { 
                    ...profileData.schoolInfo, 
                    contactInfo: e.target.value 
                  })}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              ) : (
                <p className="text-blue-600">{profileData.schoolInfo.contactInfo}</p>
              )}
            </div>
            <div>
              <label className="text-blue-700 font-medium block mb-1">Mô tả:</label>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={profileData.schoolInfo.description || ''}
                  onChange={(e) => onChange("schoolInfo", { 
                    ...profileData.schoolInfo, 
                    description: e.target.value 
                  })}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              ) : (
                <p className="text-blue-600">{profileData.schoolInfo.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {profileData.supplierInfo && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900 mb-3">
            Thông tin nhà cung cấp
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-700 font-medium">Tên công ty:</span>
              <p className="text-green-600">
                {profileData.supplierInfo.companyName}
              </p>
            </div>
            <div>
              <span className="text-green-700 font-medium">
                Giấy phép kinh doanh:
              </span>
              <p className="text-green-600">
                {profileData.supplierInfo.businessLicense}
              </p>
            </div>
            <div>
              <span className="text-green-700 font-medium">Danh mục:</span>
              <p className="text-green-600">
                {profileData.supplierInfo.category}
              </p>
            </div>
            <div>
              <span className="text-green-700 font-medium">Địa chỉ:</span>
              <p className="text-green-600">
                {profileData.supplierInfo.address}
              </p>
            </div>
          </div>
        </div>
      )}

      {profileData.relationInfo && (
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <h4 className="font-medium text-purple-900 mb-3">
            Thông tin trường học
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-purple-700 font-medium">Tên trường:</span>
              <p className="text-purple-600">
                {profileData.relationInfo.school.schoolName}
              </p>
            </div>
            <div>
              <span className="text-purple-700 font-medium">Vai trò:</span>
              <p className="text-purple-600">
                {profileData.relationInfo.relation.relationType === "teacher"
                  ? "Giáo viên"
                  : "Học sinh"}
              </p>
            </div>
            <div>
              <span className="text-purple-700 font-medium">Địa chỉ:</span>
              <p className="text-purple-600">
                {profileData.relationInfo.school.address}
              </p>
            </div>
            <div>
              <span className="text-purple-700 font-medium">Liên hệ:</span>
              <p className="text-purple-600">
                {profileData.relationInfo.school.contactInfo}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileTab;