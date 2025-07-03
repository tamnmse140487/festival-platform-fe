import React, { useState } from 'react'
import { Users, DollarSign, BookOpen } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Button from '../common/Button'
import Input from '../common/Input'

const CreateGroupModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    groupName: '',
    className: '',
    groupBudget: 0
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.groupName.trim()) {
      newErrors.groupName = 'Tên nhóm không được để trống'
    } else if (formData.groupName.trim().length < 3) {
      newErrors.groupName = 'Tên nhóm phải có ít nhất 3 ký tự'
    }

    if (!formData.className.trim()) {
      newErrors.className = 'Tên lớp không được để trống'
    }

    if (formData.groupBudget < 0) {
      newErrors.groupBudget = 'Ngân sách không được âm'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin')
      return
    }

    setLoading(true)
    try {
      const groupData = {
        groupName: formData.groupName.trim(),
        className: formData.className.trim(),
        groupBudget: Number(formData.groupBudget)
      }

      await onSubmit(groupData)
    } catch (error) {
      console.error('Error creating group:', error)
      toast.error('Có lỗi xảy ra khi tạo nhóm')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      groupName: '',
      className: '',
      groupBudget: 0
    })
    setErrors({})
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center pb-4 border-b border-gray-200">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-3">
          <Users className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Tạo nhóm học sinh mới</h3>
        <p className="text-sm text-gray-600 mt-1">
          Điền thông tin để tạo nhóm học sinh mới
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên nhóm <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Nhập tên nhóm học sinh..."
            leftIcon={<Users size={20} />}
            value={formData.groupName}
            onChange={(e) => handleInputChange('groupName', e.target.value)}
            error={errors.groupName}
            maxLength={100}
          />
          {errors.groupName && (
            <p className="mt-1 text-sm text-red-600">{errors.groupName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên lớp <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Nhập tên lớp..."
            leftIcon={<BookOpen size={20} />}
            value={formData.className}
            onChange={(e) => handleInputChange('className', e.target.value)}
            error={errors.className}
            maxLength={50}
          />
          {errors.className && (
            <p className="mt-1 text-sm text-red-600">{errors.className}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngân sách nhóm (VNĐ)
          </label>
          <Input
            type="number"
            placeholder="Nhập ngân sách..."
            leftIcon={<DollarSign size={20} />}
            value={formData.groupBudget}
            onChange={(e) => handleInputChange('groupBudget', e.target.value)}
            error={errors.groupBudget}
            min="0"
            step="1000"
          />
          {errors.groupBudget && (
            <p className="mt-1 text-sm text-red-600">{errors.groupBudget}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Có thể để trống hoặc nhập 0 nếu chưa có ngân sách
          </p>
        </div>
      </div>

     

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Hủy
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={loading}
        >
          Làm mới
        </Button>
        <Button
          type="submit"
          loading={loading}
          disabled={!formData.groupName.trim() || !formData.className.trim()}
          icon={<Users size={16} />}
        >
          Tạo nhóm
        </Button>
      </div>
    </form>
  )
}

export default CreateGroupModal