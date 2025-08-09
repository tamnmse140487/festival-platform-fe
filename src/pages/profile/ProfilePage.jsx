import React, { useState, useEffect } from 'react';
import { User, Wallet, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import { getRoleDisplayName } from '../../utils/helpers';
import { ROLE_NAME } from '../../utils/constants';
import { accountServices } from '../../services/accountServices';
import { schoolServices } from '../../services/schoolServices';
import { supplierServices } from '../../services/supplierServices';
import { schoolAccountRelationServices } from '../../services/schoolAccountRelationServices';
import { convertToVietnamTimeWithFormat } from '../../utils/formatters';
import ProfileSidebar from '../../components/profile/ProfileSidebar'; 
import ProfileTab from '../../components/profile/ProfileTab';
import WalletTab from '../../components/profile/WalletTab';
import SecurityTab from '../../components/profile/SecurityTab';

const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    address: '',
    bio: '',
    avatarUrl: '',
    schoolInfo: null,
    supplierInfo: null,
    relationInfo: null
  });

  const tabs = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: <User size={16} /> },
    { id: 'wallet', label: 'Quản lý ví', icon: <Wallet size={16} /> },
    { id: 'security', label: 'Bảo mật', icon: <Shield size={16} /> },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        const accountResponse = await accountServices.get({ id: user.id });
        const accountData = accountResponse.data[0];

        let additionalData = {
          schoolInfo: null,
          supplierInfo: null,
          relationInfo: null
        };

        if (user.role === ROLE_NAME.SCHOOL_MANAGER && user.schoolId) {
          const schoolResponse = await schoolServices.get({ id: user.schoolId });
          additionalData.schoolInfo = schoolResponse.data[0];
          accountData.avatarUrl = schoolResponse.data[0]?.logoUrl || accountData.avatarUrl;
        }

        else if (user.role === ROLE_NAME.SUPPLIER && user.supplierId) {
          const supplierResponse = await supplierServices.get({ supplierId: user.supplierId });
          additionalData.supplierInfo = supplierResponse.data[0];
        }

        else if (user.role === ROLE_NAME.STUDENT || user.role === ROLE_NAME.TEACHER) {
          const relationResponse = await schoolAccountRelationServices.get({ accountId: user.id });
          if (relationResponse.data[0]?.schoolId) {
            const schoolResponse = await schoolServices.get({ id: relationResponse.data[0].schoolId });
            additionalData.relationInfo = {
              relation: relationResponse.data[0],
              school: schoolResponse.data[0]
            };
          }
        }

        setProfileData(prev => ({
          ...prev,
          fullName: accountData.fullName || '',
          email: accountData.email || '',
          phone_number: accountData.phoneNumber || '',
          avatarUrl: accountData.avatarUrl || '',
          createdAt: accountData.createdAt,
          ...additionalData
        }));

      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

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
          <ProfileSidebar
            profileData={profileData}
            user={user}
          />
        </div>

        <div className="lg:col-span-3">
          <Card>
            <div className="border-b border-gray-200 mb-10">
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
              {activeTab === 'wallet' && <WalletTab user={user} />}
              {activeTab === 'security' && <SecurityTab />}
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;