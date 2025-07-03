import React, { useState, useEffect } from 'react'
import { X, Users, DollarSign, UserPlus, MessageCircle, FileText, Store, UtensilsCrossed, File } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { groupMemberServices } from '../../services/groupMemberServices'
import { accountServices } from '../../services/accountServices'
import { GROUP_ROLE, GROUP_ROLE_LABELS, getRoleColor } from '../../utils/constants'
import Button from '../common/Button'
import MemberList from './MemberList'
import AddMemberModal from './AddMemberModal'
import InviteTeacherModal from './InviteTeacherModal'
import GroupInfo from '../groupDetail/GroupInfo'
import GroupBudget from '../groupDetail/GroupBudget'
import BoothInfo from '../groupDetail/BoothInfo'
import BoothMenu from '../groupDetail/BoothMenu'
import { ChatTab, DocumentsTab } from '../groupDetail/PlaceholderTabs'

const GroupDetailModal = ({ group, isOpen, onClose, onRefresh }) => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('info')
  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [showInviteTeacherModal, setShowInviteTeacherModal] = useState(false)

  const tabs = [
    { id: 'info', label: 'Thông tin', icon: <FileText size={16} /> },
    { id: 'members', label: 'Thành viên', icon: <Users size={16} /> },
    { id: 'budget', label: 'Ngân sách', icon: <DollarSign size={16} /> },
    { id: 'booth', label: 'Gian hàng', icon: <Store size={16} /> },
    { id: 'menu', label: 'Menu', icon: <UtensilsCrossed size={16} /> },
    { id: 'chat', label: 'Chat', icon: <MessageCircle size={16} /> },
    { id: 'documents', label: 'Tài liệu', icon: <File size={16} /> }
  ]

  const fetchMembers = async () => {
    setMembersLoading(true)
    try {
      const membersResponse = await groupMemberServices.get({ groupId: group.groupId })
      const membersData = membersResponse.data || []

      const membersWithDetails = await Promise.all(
        membersData.map(async (member) => {
          try {
            const accountResponse = await accountServices.get({ id: member.accountId })
            const accountData = accountResponse.data?.[0] || {}
            return {
              ...member,
              email: accountData.email,
              fullName: accountData.fullName,
              phoneNumber: accountData.phoneNumber
            }
          } catch (error) {
            console.error(`Error fetching account ${member.accountId}:`, error)
            return member
          }
        })
      )

      setMembers(membersWithDetails)

      const currentUserMember = membersData.find(m => m.accountId === user?.id)
      setUserRole(currentUserMember?.role || null)
    } catch (error) {
      toast.error('Không thể tải danh sách thành viên')
      console.error('Error fetching members:', error)
    } finally {
      setMembersLoading(false)
    }
  }

  const handleAddMember = async (memberData) => {
    try {
      await groupMemberServices.create({
        groupId: group.groupId,
        accountId: memberData.accountId,
        role: memberData.role
      })
      toast.success('Thêm thành viên thành công')
      setShowAddMemberModal(false)
      fetchMembers()
    } catch (error) {
      toast.error('Thêm thành viên thất bại')
      console.error('Error adding member:', error)
    }
  }

  const handleInviteTeacher = async (teacherData) => {
    try {
      await groupMemberServices.create({
        groupId: group.groupId,
        accountId: teacherData.accountId,
        role: GROUP_ROLE.HOMEROOM_TEACHER
      })
      toast.success('Mời giáo viên thành công')
      setShowInviteTeacherModal(false)
      fetchMembers()
    } catch (error) {
      toast.error('Mời giáo viên thất bại')
      console.error('Error inviting teacher:', error)
    }
  }

  const handleUpdateRole = async (dataInfo) => {
    try {
      await groupMemberServices.update(dataInfo)
      toast.success('Cập nhật vai trò thành công')
      fetchMembers()
    } catch (error) {
      toast.error('Cập nhật vai trò thất bại')
      console.error('Error updating role:', error)
    }
  }

  const handleRemoveMember = async (memberId) => {
    try {
      await groupMemberServices.delete({ memberId })
      fetchMembers()
    } catch (error) {
      toast.error('Xóa thành viên thất bại')
      console.error('Error removing member:', error)
    }
  }

  const isLeader = userRole === GROUP_ROLE.LEADER

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return <GroupInfo group={group} members={members} />
      
      case 'members':
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
              members={members}
              loading={membersLoading}
              isLeader={isLeader}
              currentUserId={user?.id}
              onUpdateRole={handleUpdateRole}
              onRemoveMember={handleRemoveMember}
            />
          </div>
        )
      
      case 'budget':
        return <GroupBudget group={group} />
      
      case 'booth':
        return <BoothInfo groupId={group.groupId} />
      
      case 'menu':
        return <BoothMenu groupId={group.groupId} />
      
      case 'chat':
        return <ChatTab />
      
      case 'documents':
        return <DocumentsTab />
      
      default:
        return <GroupInfo group={group} members={members} />
    }
  }

  useEffect(() => {
    if (group?.groupId && isOpen) {
      fetchMembers()
    }
  }, [group?.groupId, isOpen])

  if (!isOpen) return null

  return (
    <div className="mt-0-important fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{group.groupName}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {group.className}
                </span>
                {userRole && (
                  <span className={`px-2 py-1 text-xs rounded font-medium ${getRoleColor(userRole)}`}>
                    {GROUP_ROLE_LABELS[userRole]}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-3 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
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

        <div className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button icon={<MessageCircle size={16} />}>
            Nhắn tin nhóm
          </Button>
        </div>
      </div>

      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Thêm thành viên</h3>
            </div>
            <div className="p-6">
              <AddMemberModal
                onClose={() => setShowAddMemberModal(false)}
                onSubmit={handleAddMember}
              />
            </div>
          </div>
        </div>
      )}

      {showInviteTeacherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Mời giáo viên chủ nhiệm</h3>
            </div>
            <div className="p-6">
              <InviteTeacherModal
                onClose={() => setShowInviteTeacherModal(false)}
                onSubmit={handleInviteTeacher}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupDetailModal