import React, { useState, useEffect } from "react";
import { User, Wallet, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Card from "../../components/common/Card";
import { getRoleDisplayName } from "../../utils/helpers";
import { ROLE_NAME } from "../../utils/constants";
import { accountServices } from "../../services/accountServices";
import { schoolServices } from "../../services/schoolServices";
import { supplierServices } from "../../services/supplierServices";
import { schoolAccountRelationServices } from "../../services/schoolAccountRelationServices";
import { convertToVietnamTimeWithFormat } from "../../utils/formatters";
import ProfileSidebar from "../../components/profile/ProfileSidebar";
import ProfileTab from "../../components/profile/ProfileTab";
import WalletTab from "../../components/profile/WalletTab";
import SecurityTab from "../../components/profile/SecurityTab";

const ProfilePage = () => {
  const { user } = useAuth();
  const { userId, tab } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone_number: "",
    address: "",
    bio: "",
    avatarUrl: "",
    className: "",
    schoolInfo: null,
    supplierInfo: null,
    relationInfo: null,
  });
  const [targetUser, setTargetUser] = useState(null);

  const activeTab = tab || "profile";

  const tabs = [
    { id: "profile", label: "Thông tin cá nhân", icon: <User size={16} /> },
    { id: "wallet", label: "Quản lý ví", icon: <Wallet size={16} /> },
    { id: "security", label: "Bảo mật", icon: <Shield size={16} /> },
  ];

  const isOwnProfile = !userId || userId === user?.id?.toString();

  useEffect(() => {
    if (!userId && user?.id) {
      navigate(`/app/profile/${user.id}`, { replace: true });
      return;
    }

    if (userId && user?.id) {
      fetchUserData();
    }
  }, [userId, user?.id]);

  useEffect(() => {
    const currentPath = location.pathname;
    const expectedPath = `/app/profile/${userId || user?.id}${
      activeTab !== "profile" ? `/${activeTab}` : ""
    }`;

    if (currentPath !== expectedPath && (userId || user?.id)) {
      navigate(expectedPath, { replace: true });
    }
  }, [activeTab, userId, user?.id, location.pathname]);

  const fetchUserData = async () => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    try {
      setLoading(true);

      const accountResponse = await accountServices.get({ id: targetUserId });
      const accountData = accountResponse.data[0];

      if (!accountData) {
        navigate("/app/profile", { replace: true });
        return;
      }

      setTargetUser(accountData);

      let additionalData = {
        schoolInfo: null,
        supplierInfo: null,
        relationInfo: null,
      };

      if (
        accountData.role === ROLE_NAME.SCHOOL_MANAGER &&
        accountData.schoolId
      ) {
        const schoolResponse = await schoolServices.get({
          id: accountData.schoolId,
        });
        additionalData.schoolInfo = schoolResponse.data[0];
        accountData.avatarUrl =
          schoolResponse.data[0]?.logoUrl || accountData.avatarUrl;
      } else if (
        accountData.role === ROLE_NAME.SUPPLIER &&
        accountData.supplierId
      ) {
        const supplierResponse = await supplierServices.get({
          supplierId: accountData.supplierId,
        });
        additionalData.supplierInfo = supplierResponse.data[0];
      } else if (
        accountData.role === ROLE_NAME.STUDENT ||
        accountData.role === ROLE_NAME.TEACHER
      ) {
        const relationResponse = await schoolAccountRelationServices.get({
          accountId: targetUserId,
        });
        if (relationResponse.data[0]?.schoolId) {
          const schoolResponse = await schoolServices.get({
            id: relationResponse.data[0].schoolId,
          });
          additionalData.relationInfo = {
            relation: relationResponse.data[0],
            school: schoolResponse.data[0],
          };
        }
      }

      setProfileData((prev) => ({
        ...prev,
        fullName: accountData.fullName || "",
        email: accountData.email || "",
        phone_number: accountData.phoneNumber || "",
        avatarUrl: accountData.avatarUrl || "",
        className: accountData.className || "",
        createdAt: accountData.createdAt,
        ...additionalData,
      }));
    } catch (error) {
      console.error("Error fetching user data:", error);
      navigate("/app/profile", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    const newPath =
      tabId === "profile"
        ? `/app/profile/${userId || user?.id}`
        : `/app/profile/${userId || user?.id}/${tabId}`;
    navigate(newPath);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Người dùng không tồn tại</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isOwnProfile
              ? "Thông tin cá nhân"
              : `Hồ sơ của ${profileData.fullName}`}
          </h1>
          <p className="text-gray-600 mt-1">
            {isOwnProfile
              ? "Quản lý thông tin tài khoản và cài đặt bảo mật."
              : "Xem thông tin hồ sơ người dùng."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ProfileSidebar profileData={profileData} user={targetUser} />
        </div>

        <div className="lg:col-span-3">
          <Card>
            <div className="border-b border-gray-200 mb-10">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  if (
                    !isOwnProfile &&
                    (tab.id === "wallet" || tab.id === "security")
                  ) {
                    return null;
                  }

                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.icon}
                      <span className="ml-2">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <Card.Content>
              {activeTab === "profile" && (
                <ProfileTab
                  profileData={profileData}
                  isEditing={isEditing && isOwnProfile}
                  onEdit={() => isOwnProfile && setIsEditing(true)}
                  onSave={handleSave}
                  onCancel={() => setIsEditing(false)}
                  onChange={handleChange}
                  user={user}
                  isOwnProfile={isOwnProfile}
                />
              )}
              {activeTab === "wallet" && isOwnProfile && (
                <WalletTab user={targetUser} />
              )}
              {activeTab === "security" && isOwnProfile && <SecurityTab />}
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
