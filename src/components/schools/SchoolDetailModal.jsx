import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Calendar, Users, Mail, Info } from 'lucide-react';
import Button from '../common/Button';
import { accountServices } from '../../services/accountServices';
import EditSchoolForm from './EditSchoolForm';
import toast from 'react-hot-toast';

const SchoolDetailModal = ({ school, onClose, onSchoolUpdated }) => {
  const [accountInfo, setAccountInfo] = useState(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (!school.accountId) return;

      setIsLoadingAccount(true);

      try {
        const response = await accountServices.get({ id: school.accountId });
        if (Array.isArray(response.data) && response.data.length > 0) {
          setAccountInfo(response.data[0]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin tài khoản:', error);
        toast.error(error?.response?.data?.message);
      } finally {
        setIsLoadingAccount(false);
      }
    };

    fetchAccountInfo();
  }, [school.accountId]);

  const handleEditSuccess = () => {
    setShowEditForm(false);
    onSchoolUpdated();
  };

  if (showEditForm) {
    return (
      <EditSchoolForm
        school={school}
        accountInfo={accountInfo}
        onClose={() => setShowEditForm(false)}
        onEditSuccess={handleEditSuccess}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <img 
          src={school.logoUrl || '/api/placeholder/80/80'} 
          alt={school.schoolName}
          className="w-20 h-20 rounded-lg object-cover border border-gray-200"
        />
        <div>
          <h3 className="text-xl font-bold text-gray-900">{school.schoolName}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm text-gray-500">
              Tham gia từ {formatDate(school.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-medium text-gray-900 mb-3">Thông tin liên hệ</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                            <MapPin size={16} className="mr-2 text-gray-400" />
                            <span>{school.address}</span>
                        </div>
                        <div className="flex items-center">
                            <Info size={16} className="mr-2 text-gray-400" />
                            <span>{school.contactInfo}</span>
                        </div>
                        {isLoadingAccount ? (
                            <>
                                <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded w-52 animate-pulse" />
                            </>
                        ) : (
                            <>
                                {accountInfo?.phoneNumber && (
                                    <div className="flex items-center">
                                        <Phone size={16} className="mr-2 text-gray-400" />
                                        <span>{accountInfo.phoneNumber}</span>
                                    </div>
                                )}
                                {accountInfo?.email && (
                                    <div className="flex items-center">
                                        <Mail size={16} className="mr-2 text-gray-400" />
                                        <span>{accountInfo.email}</span>
                                    </div>
                                )}
                            </>
                        )}

                        {!isLoadingAccount && !accountInfo && (
                            <div className="text-sm text-gray-400">Không có thông tin tài khoản</div>
                        )}
                    </div>
                </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
          <div className="space-y-2 text-sm">
            <div><strong>ID tài khoản:</strong> {school.accountId}</div>
            <div><strong>Ngày tạo:</strong> {formatDate(school.createdAt)}</div>
            {school.updatedAt && (
              <div><strong>Cập nhật lần cuối:</strong> {formatDate(school.updatedAt)}</div>
            )}
          </div>
        </div>
      </div>

      {school.description && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Mô tả</h4>
          <p className="text-sm text-gray-600">{school.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="text-center p-6 bg-blue-50 rounded-lg">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {school.festivals?.length || 0}
          </div>
          <div className="text-blue-800 font-medium">Lễ hội đã tổ chức</div>
        </div>
        
        <div className="text-center p-6 bg-green-50 rounded-lg">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {school.festivalSchools?.length || 0}
          </div>
          <div className="text-green-800 font-medium">Lượt tham gia</div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Đóng
        </Button>
        <Button onClick={() => setShowEditForm(true)}>
          Chỉnh sửa thông tin
        </Button>
      </div>
    </div>
  );
};

export default SchoolDetailModal;