import React, { useState } from 'react'
import { Users, UserMinus, UserCheck, User } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { GROUP_ROLE, GROUP_ROLE_LABELS, getRoleColor } from '../../utils/constants'
import Button from '../common/Button'
import useModal from 'antd/es/modal/useModal'

const MemberList = ({
  members,
  loading,
  isLeader,
  currentUserId,
  onUpdateRole,
  onRemoveMember
}) => {
  const [modal, contextHolder] = useModal()
  const [updatingRoles, setUpdatingRoles] = useState(new Set())
  const [removingMembers, setRemovingMembers] = useState(new Set())

  const handleUpdateRole = async (dataInfo) => {
    const memberId = dataInfo.memberId
    setUpdatingRoles(prev => new Set([...prev, memberId]))
    try {
      await onUpdateRole(dataInfo)
    } finally {
      setUpdatingRoles(prev => {
        const newSet = new Set(prev)
        newSet.delete(memberId)
        return newSet
      })
    }
  }

  const handleRemoveMember = (memberId) => {
    modal.confirm({
      title: 'Xác nhận xóa thành viên',
      content: 'Bạn có chắc chắn muốn xóa thành viên này?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        setRemovingMembers(prev => new Set([...prev, memberId]))
        try {
          await onRemoveMember(memberId)
        } catch (error) {
          toast.error('Xóa thành viên thất bại')
        } finally {
          setRemovingMembers(prev => {
            const newSet = new Set(prev)
            newSet.delete(memberId)
            return newSet
          })
        }
      }
    })
  }

  const canManageRole = (member) => {
    return isLeader &&
      member.accountId !== currentUserId &&
      member.role !== GROUP_ROLE.HOMEROOM_TEACHER
  }

  const canRemoveMember = (member) => {
    return isLeader &&
      member.accountId !== currentUserId &&
      member.role !== GROUP_ROLE.HOMEROOM_TEACHER
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Đang tải thành viên...</p>
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-gray-600">Chưa có thành viên nào</p>
      </div>
    )
  }

  const Avatar = ({ src, alt, size = "w-10 h-10" }) => {
    const [imageError, setImageError] = useState(false)

    if (!src || imageError) {
      return (
        <div className={`${size} bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0`}>
          <User size={16} className="text-gray-500" />
        </div>
      )
    }

    return (
      <img
        src={src}
        alt={alt}
        className={`${size} rounded-full object-cover flex-shrink-0`}
        onError={() => setImageError(true)}
      />
    )
  }

  return (
    <>
      {contextHolder}
      <div className="space-y-3">
        {members.map(member => (
          <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Avatar
                src={member.avatarUrl}
                alt={member.fullName || member.email}
                size="w-8 h-8"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h5 className="font-medium text-gray-900">
                    {member.fullName || 'Chưa có tên'}
                  </h5>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getRoleColor(member.role)}`}>
                    {GROUP_ROLE_LABELS[member.role]}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{member.email}</p>
                {member.phoneNumber && (
                  <p className="text-sm text-gray-600">{member.phoneNumber}</p>
                )}
              </div>
            </div>

            {(canManageRole(member) || canRemoveMember(member)) && (
              <div className="flex items-center space-x-2">
                {canManageRole(member) && (
                  <div className="flex space-x-1">
                    {member.role === GROUP_ROLE.MEMBER && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateRole({
                          memberId: member.memberId,
                          groupId: member.groupId,
                          accountId: member.accountId,
                          role: GROUP_ROLE.TREASURER
                        })}
                        loading={updatingRoles.has(member.memberId)}
                        icon={<UserCheck size={14} />}
                      >
                        Lên thủ quỹ
                      </Button>
                    )}
                    {member.role === GROUP_ROLE.TREASURER && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateRole({
                          memberId: member.memberId,
                          groupId: member.groupId,
                          accountId: member.accountId,
                          role: GROUP_ROLE.MEMBER
                        })}
                        loading={updatingRoles.has(member.memberId)}
                        icon={<UserMinus size={14} />}
                      >
                        Hạ xuống thành viên
                      </Button>
                    )}
                  </div>
                )}

                {canRemoveMember(member) && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleRemoveMember(member.memberId)}
                    loading={removingMembers.has(member.memberId)}
                    icon={<UserMinus size={14} />}
                  >
                    Xóa
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

export default MemberList
