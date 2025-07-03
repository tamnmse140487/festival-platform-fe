import React, { useState } from 'react'
import { Search, UserCheck } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { accountServices } from '../../services/accountServices'
import Button from '../common/Button'
import Input from '../common/Input'

const InviteTeacherModal = ({ onClose, onSubmit }) => {
  const [accountId, setAccountId] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  const searchAccount = async (id) => {
    if (!id.trim()) {
      setSuggestions([])
      return
    }

    setSearchLoading(true)
    try {
      const response = await accountServices.get({ id: id })
      setSuggestions(response.data || [])
    } catch (error) {
      setSuggestions([])
      console.error('Error searching account:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleAccountIdChange = (e) => {
    const value = e.target.value
    setAccountId(value)

    if (value.trim()) {
      const timeoutId = setTimeout(() => {
        searchAccount(value)
      }, 500)
      return () => clearTimeout(timeoutId)
    } else {
      setSuggestions([])
    }
  }

  const selectTeacher = (account) => {
    setSelectedTeacher(account)
    setAccountId('')
    setSuggestions([])
    toast.success('Đã chọn giáo viên')
  }

  const clearSelection = () => {
    setSelectedTeacher(null)
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tìm kiếm theo ID <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Input
            placeholder="Nhập ID giáo viên..."
            leftIcon={<Search size={20} />}
            value={accountId}
            onChange={handleAccountIdChange}
            disabled={selectedTeacher}
          />
          {searchLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {suggestions.length > 0 && !selectedTeacher && (
          <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 mb-2">Gợi ý:</div>
              <div className="space-y-1">
                {suggestions.map(account => (
                  <div
                    key={account.id}
                    onClick={() => selectTeacher(account)}
                    className="p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 border border-transparent hover:border-gray-200"
                  >
                    <div className="font-medium text-gray-900">
                      {account.fullNme || 'Chưa có tên'}
                    </div>
                    <div className="text-sm text-gray-600">{account.email}</div>
                    {account.phoneNumber && (
                      <div className="text-sm text-gray-600">{account.phoneNumber}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedTeacher && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giáo viên được chọn
          </label>
          <div className="border border-green-200 bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <UserCheck size={20} className="text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {selectedTeacher.fullNme || 'Chưa có tên'}
                  </div>
                  <div className="text-sm text-gray-600">{selectedTeacher.email}</div>
                  {selectedTeacher.phoneNumber && (
                    <div className="text-sm text-gray-600">{selectedTeacher.phoneNumber}</div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={clearSelection}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-sm">Thay đổi</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
          icon={<UserCheck size={16} />}
        >
          Mời giáo viên
        </Button>
      </div>
    </form>
  )
}

export default InviteTeacherModal