import React, { useState, useMemo } from 'react'
import { Table, Button, Popconfirm, Tag, Modal, Dropdown } from 'antd'
import { EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons'
import { toast } from 'react-hot-toast'
import { accountServices } from '../../services/accountServices'
import { ROLE_NAME } from '../../utils/constants'
import AccountDetailModal from './AccountDetailModal'
import AccountEditModal from './AccountEditModal'

const AccountList = ({ accounts, loading, roles, roleIds, onRefresh }) => {
    const [deletingIds, setDeletingIds] = useState(new Set())
    const [selectedAccount, setSelectedAccount] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const handleDelete = async (accountId) => {
        setDeletingIds(prev => new Set([...prev, accountId]))
        try {
            await accountServices.delete({ id: accountId })
            toast.success('Xóa tài khoản thành công')
            onRefresh()
        } catch (error) {
            toast.error('Xóa tài khoản thất bại')
            toast.error(error?.response?.data?.message)
            toast.error(error?.response?.data?.detail)
            console.error('Error deleting account:', error)
        } finally {
            setDeletingIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(accountId)
                return newSet
            })
        }
    }

    const handleViewDetail = (account) => {
        setSelectedAccount(account)
        setShowDetailModal(true)
    }

    const handleEdit = (account) => {
        setSelectedAccount(account)
        setShowEditModal(true)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        })
    }

    const getRoleInfo = (roleId) => {
        const role = roles.find(r => r.roleId === roleId)

        if (!role) {
            return {
                name: 'Không xác định',
                color: 'default'
            }
        }

        let color = 'default'
        const roleName = role.roleName.toLowerCase()
        switch (roleName) {
            case 'admin':
                color = 'red'
                break
            case 'schoolmanager':
                color = 'purple'
                break
            case 'teacher':
                color = 'blue'
                break
            case 'student':
                color = 'green'
                break
            case 'supplier':
                color = 'orange'
                break
            case 'user':
                color = 'cyan'
                break
            default:
                color = 'default'
        }

        return {
            name: role.roleName,
            color: color
        }
    }

    const filteredAccounts = useMemo(() => {
        return accounts.filter(account => {
            const role = roles.find(r => r.roleId === account.roleId)
            return role && role.roleName.toLowerCase() !== 'admin'
        })
    }, [accounts, roles])

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        const endIndex = startIndex + pageSize
        return filteredAccounts.slice(startIndex, endIndex)
    }, [filteredAccounts, currentPage, pageSize])

    const handlePageChange = (page, size) => {
        setCurrentPage(page)
        setPageSize(size)
    }

    const roleFilterOptions = roles
        .filter(role => role.roleName.toLowerCase() !== 'admin')
        .map(role => ({
            text: role.roleName,
            value: role.roleId,
        }))

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Họ tên',
            dataIndex: 'fullName',
            key: 'fullName',
            sorter: (a, b) => a.fullName.localeCompare(b.fullName),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: (a, b) => a.email.localeCompare(b.email),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
        },
        {
            title: 'Vai trò',
            dataIndex: 'roleId',
            key: 'roleId',
            render: (roleId) => {
                const roleInfo = getRoleInfo(roleId)
                return <Tag color={roleInfo.color}>{roleInfo.name}</Tag>
            },
            filters: roleFilterOptions,
            onFilter: (value, record) => record.roleId === value,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => formatDate(date),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 80,
            render: (_, record) => {
                const menuItems = [
                    {
                        key: 'view',
                        label: 'Xem chi tiết',
                        icon: <EyeOutlined />,
                        onClick: () => handleViewDetail(record)
                    },
                    {
                        key: 'edit',
                        label: 'Chỉnh sửa',
                        icon: <EditOutlined />,
                        onClick: () => handleEdit(record)
                    },
                    {
                        key: 'delete',
                        label: (
                            <Popconfirm
                                title="Xóa tài khoản"
                                description="Bạn có chắc chắn muốn xóa tài khoản này?"
                                onConfirm={() => handleDelete(record.id)}
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span>
                                    <DeleteOutlined /> Xóa
                                </span>
                            </Popconfirm>
                        ),
                        danger: true
                    }
                ];

                return (
                    <Dropdown
                        menu={{
                            items: menuItems.map(item => ({
                                ...item,
                                disabled: item.key === 'delete' && deletingIds.has(record.id)
                            }))
                        }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Button
                            type="text"
                            icon={<MoreOutlined />}
                            loading={deletingIds.has(record.id)}
                        />
                    </Dropdown>
                );
            },
        }
    ]

    return (
        <>
            <Table
                columns={columns}
                dataSource={paginatedData}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: filteredAccounts.length,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} tài khoản`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    onChange: handlePageChange,
                    onShowSizeChange: handlePageChange,
                }}
                scroll={{ x: 800 }}
                locale={{
                    emptyText: 'Không có tài khoản nào',
                    filterConfirm: 'Lọc',
                    filterReset: 'Đặt lại',
                    selectAll: 'Chọn tất cả',
                    selectInvert: 'Chọn ngược lại',
                }}
            />

            <AccountDetailModal
                account={selectedAccount}
                roles={roles}
                visible={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false)
                    setSelectedAccount(null)
                }}
            />

            <AccountEditModal
                account={selectedAccount}
                roles={roles}
                visible={showEditModal}
                onClose={() => {
                    setShowEditModal(false)
                    setSelectedAccount(null)
                }}
                onSuccess={() => {
                    setShowEditModal(false)
                    setSelectedAccount(null)
                    onRefresh()
                }}
            />
        </>
    )
}

export default AccountList