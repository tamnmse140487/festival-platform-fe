import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { ROLE_NAME } from '../../utils/constants'
import { useAuth } from '../../contexts/AuthContext'
import { accountServices } from '../../services/accountServices'
import { schoolAccountRelationServices } from '../../services/schoolAccountRelationServices'
import { roleServices } from '../../services/roleServices'
import AccountList from '../../components/accounts/AccountList'
import CreateAccountModal from '../../components/accounts/CreateAccountModal'
import { walletServices } from '../../services/walletServices'

const AccountManagementPage = () => {
    const { user, hasRole } = useAuth()
    const [accounts, setAccounts] = useState([])
    const [roleIds, setRoleIds] = useState({ teacher: null, student: null })
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)

    const roleDescription = hasRole([ROLE_NAME.SCHOOL_MANAGER])
        ? 'Quản lý tất cả học sinh, giáo viên trong trường.'
        : hasRole([ROLE_NAME.ADMIN])
            ? 'Quản lý tất cả học sinh, giáo viên trong hệ thống.'
            : ''

    const fetchRoleIds = async () => {
        try {
            const [teacherResponse, studentResponse] = await Promise.all([
                roleServices.get({ roleName: ROLE_NAME.TEACHER }),
                roleServices.get({ roleName: ROLE_NAME.STUDENT })
            ])

            const teacherRoleId = teacherResponse.data?.[0]?.roleId
            const studentRoleId = studentResponse.data?.[0]?.roleId

            if (teacherRoleId && studentRoleId) {
                setRoleIds({ teacher: teacherRoleId, student: studentRoleId })
                return { teacher: teacherRoleId, student: studentRoleId }
            }
        } catch (error) {
            toast.error('Không thể lấy thông tin vai trò')
            console.error('Error fetching role IDs:', error)
        }
        return null
    }

    const fetchAccounts = async (roleIdsToUse = null) => {
        setLoading(true)
        try {
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
                            relationType: schoolAccountRelations.data[index].relationType,
                            relationId: schoolAccountRelations.data[index].id,
                            relationCreatedAt: schoolAccountRelations.data[index].createdAt
                        }
                    }
                    return null
                })
                .filter(account => account !== null)

            setAccounts(combinedAccounts)
        } catch (error) {
            toast.error('Không thể lấy danh sách tài khoản')
            console.error('Error fetching accounts:', error)
        } finally {
            setLoading(false)
        }
    }

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

    const handleRefresh = () => {
        fetchAccounts()
    }

    useEffect(() => {
        const initializeData = async () => {
            const fetchedRoleIds = await fetchRoleIds()
            if (fetchedRoleIds) {
                await fetchAccounts(fetchedRoleIds)
            }
        }
        initializeData()
    }, [])

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
        </div>
    )
}

export default AccountManagementPage