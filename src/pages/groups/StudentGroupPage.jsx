import React, { useState, useEffect } from 'react'
import { Plus, Search, Users, DollarSign, Calendar, Eye, Edit, Filter, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { studentGroupServices } from '../../services/studentGroupServices'
import { groupMemberServices } from '../../services/groupMemberServices'
import { ROLE_NAME, GROUP_ROLE, GROUP_ROLE_LABELS, getRoleColor } from '../../utils/constants'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Card from '../../components/common/Card'
import Modal from '../../components/common/Modal'
import GroupDetailModal from '../../components/groups/GroupDetailModal'

const StudentGroupPage = () => {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const fetchGroups = async () => {
    setLoading(true)
    try {
      const memberResponse = await groupMemberServices.get({
        accountId: user?.id
      })

      console.log("Member response: ", memberResponse)

      const groupIds = memberResponse.data || []

      if (groupIds.length === 0) {
        setGroups([])
        return
      }

      const groupPromises = groupIds.map(async (member) => {
        try {
          const response = await studentGroupServices.get({
            groupId: member.groupId,
            schoolId: user?.schoolId
          })
          return response.data
        } catch (error) {
          console.error(`Error fetching group ${member.groupId}:`, error)
          return null 
        }
      })

      const groupResponses = await Promise.all(groupPromises)

      const groupsData = groupResponses
        .filter(group => group !== null)
        .flatMap(group => {
          return Array.isArray(group) ? group : [group]
        })

      console.log("Groups data: ", groupsData)
      setGroups(groupsData)

      const failedCount = groupResponses.filter(group => group === null).length
      if (failedCount > 0) {
        toast.warning(`Không thể tải ${failedCount} nhóm`)
      }

    } catch (error) {
      toast.error('Không thể tải danh sách nhóm')
      console.error('Error fetching groups:', error)
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (group) => {
    setSelectedGroup(group)
    setShowDetailModal(true)
  }

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.groupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.className?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || group.status === statusFilter
    return matchesSearch && matchesStatus
  })


  useEffect(() => {
    if (user?.id) {
      fetchGroups()
    }
  }, [user?.id])

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Nhóm học sinh</h1>
          <p className="text-gray-600 mt-1">
            Quản lý tất cả nhóm mà bạn tham gia
          </p>
        </div>

       
      </div>

      <Card>
        <Card.Content>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Tìm kiếm nhóm..."
                  leftIcon={<Search size={20} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Tạm dừng</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Đang tải dữ liệu...</p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy nhóm nào</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                  : 'Chưa có nhóm học sinh nào được tạo.'
                }
              </p>
              
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredGroups.map(group => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </Card.Content>
      </Card>

      <GroupDetailModal
        group={selectedGroup}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onRefresh={fetchGroups}
      />

    </div>
  )
}

const GroupCard = ({ group, onViewDetails }) => {
  const getStatusBadge = (status) => {
    return status === 'active' ? (
      <div className="flex items-center space-x-1">
        <CheckCircle size={14} className="text-green-600" />
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          Hoạt động
        </span>
      </div>
    ) : (
      <div className="flex items-center space-x-1">
        <Clock size={14} className="text-gray-600" />
        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
          Tạm dừng
        </span>
      </div>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  return (
    <Card hover className="h-full transition-all duration-200 hover:shadow-lg">
      <Card.Content>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
              <Users className="w-7 h-7 text-purple-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {group.groupName}
                </h3>
                {getStatusBadge(group.status)}
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Lớp:</span> {group.className}</p>
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>Tạo: {formatDate(group.creationDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-blue-200 rounded">
                  <DollarSign size={14} className="text-blue-700" />
                </div>
                <span className="text-xs font-medium text-blue-800">Ngân sách</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-700">
                  {group.groupBudget?.toLocaleString() || 0}đ
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={() => onViewDetails(group)}
          icon={<Eye size={16} />}
          className="flex-1"
        >
          Chi tiết
        </Button>

      </Card.Content>
    </Card>
  )
}

export default StudentGroupPage