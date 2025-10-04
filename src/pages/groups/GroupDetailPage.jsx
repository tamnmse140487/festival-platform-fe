import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  DollarSign,
  UserPlus,
  MessageCircle,
  FileText,
  Store,
  UtensilsCrossed,
  File,
  Receipt,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Breadcrumb } from "antd";
import { useAuth } from "../../contexts/AuthContext";
import { groupMemberServices } from "../../services/groupMemberServices";
import { accountServices } from "../../services/accountServices";
import { studentGroupServices } from "../../services/studentGroupServices";
import { boothServices } from "../../services/boothServices";
import {
  GROUP_ROLE,
  GROUP_ROLE_LABELS,
  getRoleColor,
  BOOTH_STATUS,
  ROLE_NAME,
  NOTIFICATION_EVENT,
} from "../../utils/constants";
import Button from "../../components/common/Button";
import MemberList from "../../components/groups/MemberList";
import AddMemberModal from "../../components/groups/AddMemberModal";
import InviteTeacherModal from "../../components/groups/InviteTeacherModal";
import GroupInfo from "../../components/groupDetail/GroupInfo";
import GroupBudget from "../../components/groupDetail/GroupBudget";
import BoothInfo from "../../components/groupDetail/BoothInfo";
import OrdersManagement from "../../components/groupDetail/OrdersManagement";
import ChatTab from "../../components/groupDetail/ChatTab";
import DocumentsTab from "../../components/groupDetail/DocumentsTab";
import { notificationServices } from "../../services/notificationServices";

const GroupDetailPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasRole } = useAuth();

  const [group, setGroup] = useState(null);
  const [booth, setBooth] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [groupLoading, setGroupLoading] = useState(false);
  const [boothLoading, setBoothLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showInviteTeacherModal, setShowInviteTeacherModal] = useState(false);

  const breadcrumbItems = useMemo(
    () => [
      { title: <Link to="/app/groups">Danh sách nhóm </Link> },
      { title: `Chi tiết nhóm` },
    ],
    [groupId]
  );

  const getCurrentTab = () => {
    const pathname = location.pathname;
    if (pathname.endsWith("/members")) return "members";
    if (pathname.endsWith("/booth")) return "booth";
    if (pathname.endsWith("/orders")) return "orders";
    if (pathname.endsWith("/chat")) return "chat";
    if (pathname.endsWith("/documents")) return "documents";
    return "info";
  };

  const activeTab = getCurrentTab();

  const getAvailableTabs = () => {
    const baseTabs = [
      {
        id: "info",
        label: "Thông tin",
        icon: <FileText size={16} />,
        path: "",
      },
      {
        id: "members",
        label: "Thành viên",
        icon: <Users size={16} />,
        path: "/members",
      },
      {
        id: "booth",
        label: "Gian hàng",
        icon: <Store size={16} />,
        path: "/booth",
      },
    ];

    if (booth?.status === BOOTH_STATUS.ACTIVE ||booth?.status === BOOTH_STATUS.CLOSED ) {
      baseTabs.push({
        id: "orders",
        label: "Đơn hàng",
        icon: <Receipt size={16} />,
        path: "/orders",
      });
    }

    if (hasRole([ROLE_NAME.STUDENT, ROLE_NAME.TEACHER])) {
      baseTabs.push(
        {
          id: "chat",
          label: "Chat",
          icon: <MessageCircle size={16} />,
          path: "/chat",
        },
        {
          id: "documents",
          label: "Tài liệu",
          icon: <File size={16} />,
          path: "/documents",
        }
      );
    }

    return baseTabs;
  };

  const tabs = getAvailableTabs();

  const fetchGroup = async () => {
    setGroupLoading(true);
    try {
      const groupResponse = await studentGroupServices.get({ groupId });
      const groupData = groupResponse.data?.[0] || null;

      if (!groupData) {
        toast.error("Không tìm thấy nhóm");
        navigate("/app/groups");
        return;
      }

      setGroup(groupData);
    } catch (error) {
      toast.error("Không thể tải thông tin nhóm");
      console.error("Error fetching group:", error);
      navigate("/app/groups");
    } finally {
      setGroupLoading(false);
    }
  };

  const fetchBooth = async () => {
    setBoothLoading(true);
    try {
      const boothResponse = await boothServices.get({ groupId });
      const boothData = boothResponse.data?.[0] || null;
      setBooth(boothData);
    } catch (error) {
      console.error("Error fetching booth:", error);
      setBooth(null);
    } finally {
      setBoothLoading(false);
    }
  };

  const fetchMembers = async () => {
    setMembersLoading(true);
    try {
      const membersResponse = await groupMemberServices.get({ groupId });
      const membersData = membersResponse.data || [];

      const membersWithDetails = await Promise.all(
        membersData.map(async (member) => {
          try {
            const accountResponse = await accountServices.get({
              id: member.accountId,
            });
            const accountData = accountResponse.data?.[0] || {};
            return {
              ...member,
              email: accountData.email,
              fullName: accountData.fullName,
              phoneNumber: accountData.phoneNumber,
            };
          } catch (error) {
            console.error(`Error fetching account ${member.accountId}:`, error);
            return member;
          }
        })
      );

      setMembers(membersWithDetails);

      const currentUserMember = membersData.find(
        (m) => m.accountId === user?.id
      );
      setUserRole(currentUserMember?.role || null);
    } catch (error) {
      toast.error("Không thể tải danh sách thành viên");
      console.error("Error fetching members:", error);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleAddMember = async (memberData) => {
    try {
      await groupMemberServices.create({
        groupId,
        accountId: memberData.accountId,
        role: memberData.role,
      });
      toast.success("Thêm thành viên thành công");

      try {
        await notificationServices.createByType(
          NOTIFICATION_EVENT.GROUP_ADD_MEMBER,
          {
            data: {
              groupId: group.groupId,
              groupName: group.groupName,
            },
            list_user_id: [memberData.accountId],
          }
        );
      } catch (e) {
        console.warn("Send notification failed:", e?.message || e);
      }

      setShowAddMemberModal(false);
      fetchMembers();
    } catch (error) {
      toast.error("Thêm thành viên thất bại");
      console.error("Error adding member:", error);
    }
  };

  const handleInviteTeacher = async (teacherData) => {
    try {
      await groupMemberServices.create({
        groupId,
        accountId: teacherData.accountId,
        role: GROUP_ROLE.HOMEROOM_TEACHER,
      });

      try {
        await notificationServices.createByType(
          NOTIFICATION_EVENT.GROUP_ADD_MEMBER,
          {
            data: {
              groupId: group.groupId,
              groupName: group.groupName,
            },
            list_user_id: [teacherData.accountId],
          }
        );
      } catch (e) {
        console.warn("Send notification failed:", e?.message || e);
      }

      toast.success("Mời giáo viên thành công");
      setShowInviteTeacherModal(false);
      fetchMembers();
    } catch (error) {
      toast.error("Mời giáo viên thất bại");
      console.error("Error inviting teacher:", error);
    }
  };

  const handleUpdateRole = async (dataInfo) => {
    try {
      await groupMemberServices.update(dataInfo);

      try {
        if (!dataInfo.role === "member") {
          await notificationServices.createByType(
            NOTIFICATION_EVENT.GROUP_UP_ROLE,
            {
              data: {
                groupId: group.groupId,
                groupName: group.groupName,
              },
              list_user_id: [dataInfo.memberId],
            }
          );
        } else {
          await notificationServices.createByType(
            NOTIFICATION_EVENT.GROUP_DOWN_ROLE,
            {
              data: {
                groupId: group.groupId,
                groupName: group.groupName,
              },
              list_user_id: [dataInfo.memberId],
            }
          );
        }
      } catch (e) {
        console.warn("Send notification failed:", e?.message || e);
      }

      toast.success("Cập nhật vai trò thành công");
      fetchMembers();
    } catch (error) {
      toast.error("Cập nhật vai trò thất bại");
      console.error("Error updating role:", error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const response = await groupMemberServices.get({ memberId });

      const accountId =
        Array.isArray(response?.data) && response.data.length > 0
          ? response.data[0].accountId
          : null;

      await groupMemberServices.delete({ memberId });

      try {
        await notificationServices.createByType(
          NOTIFICATION_EVENT.GROUP_REMOVE_MEMBER,
          {
            data: {
              groupName: group.groupName,
            },
            list_user_id: [accountId],
          }
        );
      } catch (e) {
        console.warn("Send notification failed:", e?.message || e);
      }

      fetchMembers();
      toast.success('Xóa thành viên thành công')

    } catch (error) {
      toast.error("Xóa thành viên thất bại");
      toast.error(error?.response?.data?.message || error?.response?.data?.detail)
      console.error("Error removing member:", error);
    }
  };

  const handleTabChange = (tabId) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab) {
      navigate(`/app/groups/${groupId}${tab.path}`);
    }
  };

  const isLeader = userRole === GROUP_ROLE.LEADER;

  const renderTabContent = () => {
    switch (activeTab) {
      case "info":
        return <GroupInfo group={group} members={members} />;

      case "members":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-900">
                Danh sách thành viên ({members.length})
              </h4>
              {isLeader && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<UserPlus size={16} />}
                    onClick={() => setShowAddMemberModal(true)}
                  >
                    Thêm thành viên
                  </Button>
                  <Button
                    size="sm"
                    icon={<UserPlus size={16} />}
                    onClick={() => setShowInviteTeacherModal(true)}
                  >
                    Mời giáo viên
                  </Button>
                </div>
              )}
            </div>

            <MemberList
              group={group}
              members={members}
              loading={membersLoading}
              isLeader={isLeader}
              currentUserId={user?.id}
              onUpdateRole={handleUpdateRole}
              onRemoveMember={handleRemoveMember}
            />
          </div>
        );

      case "booth":
        return <BoothInfo groupId={groupId} group={group} members={members} />;

      case "orders":
        return booth ? (
          <OrdersManagement boothId={booth.boothId} />
        ) : (
          <div className="text-center py-8">
            <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không tìm thấy thông tin gian hàng
            </h3>
            <p className="text-gray-600">
              Vui lòng kiểm tra lại thông tin gian hàng của nhóm.
            </p>
          </div>
        );

      case "chat":
        return <ChatTab groupId={groupId} user={user} />;

      case "documents":
        return <DocumentsTab groupId={groupId} user={user} />;

      default:
        return <GroupInfo group={group} members={members} />;
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchGroup();
      fetchMembers();
    }
  }, [groupId]);

  useEffect(() => {
    if (group) {
      fetchBooth();
    }
  }, [group]);

  if (groupLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Đang tải thông tin nhóm...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không tìm thấy nhóm
        </h3>
        <p className="text-gray-600 mb-4">
          Nhóm không tồn tại hoặc bạn không có quyền truy cập.
        </p>
        <Button onClick={() => navigate("/app/groups")}>
          Về trang danh sách nhóm
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} className="mb-2 text-sm" />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {group.groupName}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {group.className}
                </span>
                {userRole && (
                  <span
                    className={`px-2 py-1 text-xs rounded font-medium ${getRoleColor(
                      userRole
                    )}`}
                  >
                    {GROUP_ROLE_LABELS[userRole]}
                  </span>
                )}
                {booth?.status === BOOTH_STATUS.ACTIVE && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">
                    Gian hàng hoạt động
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        {hasRole([ROLE_NAME.STUDENT, ROLE_NAME.TEACHER]) && (
          <Button
            onClick={() => navigate(`/app/groups/${groupId}/chat`)}
            icon={<MessageCircle size={16} />}
          >
            Nhắn tin nhóm
          </Button>
        )}
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {renderTabContent()}
      </div>

      {showAddMemberModal && (
        <div className="mt-0-important fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Thêm thành viên
              </h3>
            </div>
            <div className="p-6">
              <AddMemberModal
                onClose={() => setShowAddMemberModal(false)}
                onSubmit={handleAddMember}
                currentUserId={user?.id}
              />
            </div>
          </div>
        </div>
      )}

      {showInviteTeacherModal && (
        <div className="mt-0-important fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Mời giáo viên chủ nhiệm
              </h3>
            </div>
            <div className="p-6">
              <InviteTeacherModal
                onClose={() => setShowInviteTeacherModal(false)}
                onSubmit={handleInviteTeacher}
                currentUserId={user?.id}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetailPage;