import React, { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { accountServices } from '../../services/accountServices'
import { roleServices } from '../../services/roleServices'
import { ROLE_NAME } from '../../utils/constants'
import Button from '../common/Button'
import Input from '../common/Input'

const InviteTeacherModal = ({ onClose, onSubmit }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [teachers, setTeachers] = useState([])
  const [filteredTeachers, setFilteredTeachers] = useState([])
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [loading, setLoading] = useState(false)
  const [teachersLoading, setTeachersLoading] = useState(false)

  const fetchTeachers = async () => {
    setTeachersLoading(true)
    try {
      const roleResponse = await roleServices.get({ roleName: ROLE_NAME.TEACHER })
      const teacherRoleId = roleResponse.data?.[0]?.roleId

      if (teacherRoleId) {
        const teachersResponse = await accountServices.get({ role: teacherRoleId })
        setTeachers(teachersResponse.data || [])
      }
    } catch (error) {
      toast.error('Không thể tải danh sách giáo viên')
      console.error('Error fetching teachers:', error)
    } finally {
      setTeachersLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedTeacher) {
      toast.error('Vui lòng chọn giáo viên')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        accountId: selectedTeacher.id
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeachers()
  }, [])

  useEffect(() => {
    const filtered = teachers.filter(teacher =>
      teacher.fullNme?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredTeachers(filtered)
  }, [searchTerm, teachers])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tìm kiếm giáo viên <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="Tìm theo tên hoặc email..."
          leftIcon={<Search size={20} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn giáo viên chủ nhiệm
        </label>
        <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
          {teachersLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Đang tải...</p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              {searchTerm ? 'Không tìm thấy giáo viên nào' : 'Chưa có giáo viên nào'}
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredTeachers.map(teacher => (
                <div
                  key={teacher.id}
                  onClick={() => setSelectedTeacher(teacher)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedTeacher?.id === teacher.id
                      ? 'bg-blue-100 border-blue-500 border'
                      : 'hover:bg-gray-50 border border-transparent'
                    }`}
                >
                  <div className="font-medium text-gray-900">
                    {teacher.fullNme || 'Chưa có tên'}
                  </div>
                  <div className="text-sm text-gray-600">{teacher.email}</div>
                  {teacher.phoneNumber && (
                    <div className="text-sm text-gray-600">{teacher.phoneNumber}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          loading={loading}
          disabled={!selectedTeacher}
        >
          Mời giáo viên
        </Button>
      </div>
    </form>
  )
}

export default InviteTeacherModal