import React, { useRef } from 'react';
import { User, Camera } from 'lucide-react';
import Card from '../../components/common/Card';
import { getRoleDisplayName } from '../../utils/helpers';
import { convertToVietnamTimeWithFormat } from '../../utils/formatters';

const ProfileSidebar = ({ 
  profileData, 
  user, 
  isEditing, 
  onAvatarChange, 
  previewAvatar 
}) => {
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e) => {
    if (onAvatarChange) {
      onAvatarChange(e);
    }
  };

  return (
    <Card>
      <Card.Content>
        <div className="text-center">
          <div className="relative inline-block mb-4">
            {previewAvatar || profileData.avatarUrl ? (
              <img
                src={previewAvatar || profileData.avatarUrl}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover mx-auto"
              />
            ) : (
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <User className="w-12 h-12 text-blue-600" />
              </div>
            )}
            {isEditing && (
              <button
                type="button"
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
              >
                <Camera size={16} />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {profileData.fullName}
          </h3>
          <p className="text-gray-600 text-sm mb-2">
            {getRoleDisplayName(user?.role)}
          </p>

          {profileData.schoolInfo && (
            <p className="text-gray-500 text-xs">
              {profileData.schoolInfo.schoolName}
            </p>
          )}
          {profileData.supplierInfo && (
            <p className="text-gray-500 text-xs">
              {profileData.supplierInfo.companyName}
            </p>
          )}
          {profileData.relationInfo && (
            <p className="text-gray-500 text-xs">
              {profileData.relationInfo.school.schoolName}
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500">Tham gia từ</p>
              <p className="text-sm font-medium text-gray-900">
                {convertToVietnamTimeWithFormat(profileData?.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};

export default ProfileSidebar;