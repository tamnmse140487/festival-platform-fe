import React, { useState } from 'react'
import { Search, X, UserPlus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { accountServices } from '../../services/accountServices'
import { GROUP_ROLE, GROUP_ROLE_LABELS, ROLE_NAME } from '../../utils/constants'
import Button from '../common/Button'
import Input from '../common/Input'
import { roleServices } from '../../services/roleServices'

const AddMemberModal = ({ onClose, onSubmit }) => {
    const [accountId, setAccountId] = useState('')
    const [selectedRole, setSelectedRole] = useState(GROUP_ROLE.MEMBER)
    const [suggestions, setSuggestions] = useState([])
    const [pendingMembers, setPendingMembers] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchLoading, setSearchLoading] = useState(false)

    const searchAccount = async (id) => {
        if (!id.trim()) {
            setSuggestions([])
            return
        }

        setSearchLoading(true)
        try {
            const roleResponse = await roleServices.get({ roleName: ROLE_NAME.STUDENT })
            const studentRoleId = roleResponse.data?.[0]?.roleId

            const response = await accountServices.get({ id: id, role: studentRoleId })
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
        setSearchLoading(true)
        if (value.trim()) {
            const timeoutId = setTimeout(() => {
                searchAccount(value)
            }, 500)
            return () => clearTimeout(timeoutId)
        } else {
            setSearchLoading(false)
            setSuggestions([])
        }
    }

    const addToPending = (account) => {
        const isAlreadyAdded = pendingMembers.some(member => member.id === account.id)
        if (isAlreadyAdded) {
            toast.error('Học sinh này đã được thêm vào danh sách')
            return
        }

        setPendingMembers(prev => [...prev, { ...account, role: selectedRole }])
        setAccountId('')
        setSuggestions([])
        toast.success('Đã thêm vào danh sách chờ')
    }

    const removeFromPending = (accountId) => {
        setPendingMembers(prev => prev.filter(member => member.id !== accountId))
    }

    const updateMemberRole = (accountId, newRole) => {
        setPendingMembers(prev =>
            prev.map(member =>
                member.id === accountId ? { ...member, role: newRole } : member
            )
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (pendingMembers.length === 0) {
            toast.error('Vui lòng thêm ít nhất một thành viên')
            return
        }

        setLoading(true)
        try {
            for (const member of pendingMembers) {
                await onSubmit({
                    accountId: member.id,
                    role: member.role
                })
            }
            toast.success(`Đã thêm ${pendingMembers.length} thành viên thành công`)
            onClose()
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const availableRoles = [
        { value: GROUP_ROLE.MEMBER, label: GROUP_ROLE_LABELS[GROUP_ROLE.MEMBER] },
        { value: GROUP_ROLE.TREASURER, label: GROUP_ROLE_LABELS[GROUP_ROLE.TREASURER] }
    ]

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tìm kiếm theo ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <Input
                        placeholder="Nhập ID học sinh..."
                        leftIcon={<Search size={20} />}
                        value={accountId}
                        onChange={handleAccountIdChange}
                    />
                    {searchLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                </div>

                {accountId.trim() !== '' && !searchLoading && (
                    <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-sm">
                        <div className="p-2">
                            {suggestions.length === 0 ? (
                                <div className="text-sm text-gray-600 italic">Không tìm thấy học sinh phù hợp</div>
                            ) : (
                                <>
                                    <div className="text-xs font-medium text-gray-500 mb-2">Gợi ý:</div>
                                    <div className="space-y-1">
                                        {suggestions.map(account => (
                                            <div
                                                key={account.id}
                                                onClick={() => addToPending(account)}
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
                                </>
                            )}
                        </div>
                    </div>
                )}

            </div>

            {pendingMembers.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Danh sách chờ ({pendingMembers.length})
                    </label>
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                        <div className="space-y-2 p-3">
                            {pendingMembers.map(member => (
                                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">
                                            {member.fullNme || 'Chưa có tên'}
                                        </div>
                                        <div className="text-sm text-gray-600">{member.email}</div>
                                        {member.phoneNumber && (
                                            <div className="text-sm text-gray-600">{member.phoneNumber}</div>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <select
                                            value={member.role}
                                            onChange={(e) => updateMemberRole(member.id, e.target.value)}
                                            className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                        >
                                            {availableRoles.map(role => (
                                                <option key={role.value} value={role.value}>
                                                    {role.label}
                                                </option>
                                            ))}
                                        </select>

                                        <button
                                            type="button"
                                            onClick={() => removeFromPending(member.id)}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
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
                    disabled={pendingMembers.length === 0}
                    icon={<UserPlus size={16} />}
                >
                    Xác nhận thêm ({pendingMembers.length})
                </Button>
            </div>
        </form>
    )
}

export default AddMemberModal