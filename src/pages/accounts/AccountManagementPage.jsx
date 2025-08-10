import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { ROLE_NAME } from '../../utils/constants'
import { useAuth } from '../../contexts/AuthContext'
import { accountServices } from '../../services/accountServices'
import { schoolAccountRelationServices } from '../../services/schoolAccountRelationServices'
import { roleServices } from '../../services/roleServices'
import AccountList from '../../components/accounts/AccountList'
import CreateAccountModal from '../../components/accounts/CreateAccountModal'
import ImportListAccountsModal from '../../components/accounts/ImportListAccountsModal'
import { walletServices } from '../../services/walletServices'

const AccountManagementPage = () => {
    const { user, hasRole } = useAuth()
    const [accounts, setAccounts] = useState([])
    const [roles, setRoles] = useState([]) 
    const [roleIds, setRoleIds] = useState({ teacher: null, student: null })
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showImportModal, setShowImportModal] = useState(false)

    const roleDescription = hasRole([ROLE_NAME.SCHOOL_MANAGER])
        ? 'Quản lý tất cả học sinh, giáo viên trong trường.'
        : hasRole([ROLE_NAME.ADMIN])
            ? 'Quản lý tất cả học sinh, giáo viên trong hệ thống.'
            : ''

    const fetchRoles = async () => {
        try {
            const roleResponse = await roleServices.get()
            setRoles(roleResponse.data || [])
            
            const teacherRole = roleResponse.data?.find(role => role.roleName === 'Teacher')
            const studentRole = roleResponse.data?.find(role => role.roleName === 'Student')
            
            setRoleIds({
                teacher: teacherRole?.roleId || null,
                student: studentRole?.roleId || null
            })
        } catch (error) {
            console.error('Error fetching roles:', error)
        }
    }

    const fetchAccounts = async () => {
        setLoading(true)
        try {

            if (user?.role === ROLE_NAME.SCHOOL_MANAGER) {
                if (!user?.schoolId) {
                    console.error('User không có schoolId')
                    setAccounts([])
                    return
                }

                const schoolAccountRelations = await schoolAccountRelationServices.get({
                    schoolId: user.schoolId
                })

                if (!schoolAccountRelations?.data || schoolAccountRelations.data.length === 0) {
                    setAccounts([])
                    return
                }

                const accountPromises = schoolAccountRelations.data.map(relation =>
                    accountServices.get({ id: relation.accountId })
                )

                const accountResults = await Promise.all(accountPromises)

                const combinedAccounts = accountResults
                    .map((result, index) => {
                        const accountData = result?.data?.[0]
                        if (accountData) {
                            return {
                                ...accountData,
                            }
                        }
                        return null
                    })
                    .filter(account => account !== null)

                setAccounts(combinedAccounts)

            } else if (user?.role === ROLE_NAME.ADMIN) {
                const accountResponse = await accountServices.get()
                console.log("Account response:", accountResponse)
                setAccounts(accountResponse.data || [])
            }

        } catch (error) {
            toast.error('Không thể lấy danh sách tài khoản')
            console.error('Error fetching accounts:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAccounts()
        fetchRoles()
    }, [])

    const handleCreateAccount = async (accountData) => {
        try {
            const accountResult = await accountServices.create(accountData)

            if (accountResult.success || accountResult.data) {
                const accountId = accountResult.data?.id || accountResult.id;

                const walletData = {
                    accountId: accountId,
                    balance: 0
                };
                await walletServices.create(walletData);

                if (user?.schoolId) {
                    const relationType = accountData.roleId === roleIds.student
                        ? ROLE_NAME.STUDENT
                        : ROLE_NAME.TEACHER;

                    const schoolAccountRelationData = {
                        schoolId: user.schoolId,
                        accountId: accountId,
                        relationType: relationType
                    };

                    await schoolAccountRelationServices.create(schoolAccountRelationData);
                }
            }

            toast.success('Tạo tài khoản thành công')
            setShowCreateModal(false)
            fetchAccounts()
        } catch (error) {
            toast.error('Tạo tài khoản thất bại')
            toast.error(error?.response?.data)
            console.error('Error creating account:', error)
        }
    }

    const handleImportAccounts = async (formData) => {
        try {
            const response = await accountServices.importAccounts(formData)
            console.log("response: ", response)
            if (response.data) {
                toast.success(`Tạo tài khoản hàng loạt thành công! Đã tạo ${response.data.createdAccounts?.length || 0} tài khoản`)
                
                if (response.data.errors && response.data.errors.length > 0) {
                    console.warn('Import warnings:', response.data.errors)
                    toast.warning(`Có ${response.data.errors.length} lỗi trong quá trình import`)
                }
                
                setShowImportModal(false)
                fetchAccounts()
            } else {
                toast.success('Tạo tài khoản hàng loạt thành công!')
                setShowImportModal(false)
                fetchAccounts()
            }
        } catch (error) {
            console.error('Error importing accounts:', error)
            
            // Xử lý các loại lỗi khác nhau
            if (error.response?.status === 400) {
                const errorMessage = error.response?.data?.message || error.response?.data || 'Dữ liệu file không hợp lệ'
                toast.error(`Lỗi: ${errorMessage}`)
            } else if (error.response?.status === 413) {
                toast.error('File quá lớn. Vui lòng chọn file nhỏ hơn')
            } else if (error.response?.status === 500) {
                toast.error('Lỗi server. Vui lòng thử lại sau')
            } else {
                toast.error('Tạo tài khoản hàng loạt thất bại. Vui lòng kiểm tra lại dữ liệu')
            }
        }
    }

    const handleRefresh = () => {
        fetchAccounts()
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Quản lý tài khoản học sinh, giáo viên
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {roleDescription}
                    </p>
                </div>

                {hasRole([ROLE_NAME.SCHOOL_MANAGER]) && (
                    <div className="flex gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            {loading ? 'Đang tải...' : 'Làm mới'}
                        </button>
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                            Tạo hàng loạt
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Tạo tài khoản mới
                        </button>
                    </div>
                )}
            </div>

            <AccountList
                accounts={accounts}
                loading={loading}
                roles={roles} 
                roleIds={roleIds}
                onRefresh={handleRefresh}
            />

            {showCreateModal && (
                <CreateAccountModal
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateAccount}
                    roleIds={roleIds}
                />
            )}

            {showImportModal && (
                <ImportListAccountsModal
                    onClose={() => setShowImportModal(false)}
                    onSubmit={handleImportAccounts}
                    schoolId={user?.schoolId}
                />
            )}
        </div>
    )
}

export default AccountManagementPage