import React from 'react'
import { Table, Avatar } from 'antd'
import { User } from 'lucide-react'
import { ORDER_STATUS_LABELS } from '../../../utils/constants'
import { convertToVietnamTimeWithFormat } from '../../../utils/formatters'
import { getOrderStatusColor } from '../../../utils/helpers'

const OrdersTable = ({ orders, loading, pagination, onTableChange }) => {
    const columns = [
        {
            title: 'Mã đơn',
            dataIndex: 'orderId',
            key: 'orderId',
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            render: (_, record) => (
                <div className="flex items-center space-x-3">
                    <Avatar
                        src={record.customer?.avatarUrl}
                        icon={<User />}
                        size="small"
                    />
                    <div>
                        <div className="font-medium">{record.customer?.fullName || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{record.customer?.email || 'N/A'}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Ngày mua',
            dataIndex: 'orderDate',
            key: 'orderDate',
            render: (date) => convertToVietnamTimeWithFormat(date),
            sorter: (a, b) => new Date(b.orderDate) - new Date(a.orderDate),
            defaultSortOrder: 'ascend',
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (amount) => (
                <span className="font-medium text-green-600">
                    {amount?.toLocaleString()}đ
                </span>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span className={`px-2 py-1 text-xs font-medium rounded ${getOrderStatusColor(status)}`}>
                    {ORDER_STATUS_LABELS[status] || status}
                </span>
            ),
        },
        {
            title: 'Ghi chú',
            dataIndex: 'notes',
            key: 'notes',
            ellipsis: true,
        },
    ]

    return (
        <Table
            columns={columns}
            dataSource={orders}
            loading={loading}
            rowKey="orderId"
            pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} hóa đơn`,
                pageSizeOptions: ['10', '20', '50', '100'],
                onChange: (page, pageSize) => {
                    onTableChange({ current: page, pageSize })
                },
                onShowSizeChange: (current, size) => {
                    onTableChange({ current: 1, pageSize: size })
                }
            }}
            scroll={{ x: 800 }}
            onChange={(paginationInfo, filters, sorter) => {
                if (paginationInfo.current !== pagination.current || 
                    paginationInfo.pageSize !== pagination.pageSize) {
                    onTableChange(paginationInfo)
                }
            }}
        />
    )
}

export default OrdersTable