import React, { useState, useEffect } from 'react'
import { Table, Button as AntButton, Card } from 'antd'
import { Plus, DollarSign } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { ordersServices } from '../../services/orderServices'
import { accountServices } from '../../services/accountServices'
import { boothMenuItemServices } from '../../services/boothMenuItemServices'
import { boothWalletServices } from '../../services/boothWalletServices'
import { boothServices } from '../../services/boothServices'
import { festivalServices } from '../../services/festivalServices'
import { ORDER_STATUS_LABELS, ROLE_NAME, FESTIVAL_STATUS } from '../../utils/constants'
import { useAuth } from '../../contexts/AuthContext'
import CreatePaymentModal from './order/CreatePaymentModal'
import OrdersTable from './order/OrdersTable'

const OrdersManagement = ({ boothId }) => {
    const { user, hasRole } = useAuth()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [createModalVisible, setCreateModalVisible] = useState(false)
    const [menuItems, setMenuItems] = useState([])
    const [boothBalance, setBoothBalance] = useState(0)
    const [festivalId, setFestivalId] = useState(null)
    const [festival, setFestival] = useState(null)
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    })

    const fetchOrders = async (page = 1, pageSize = 10) => {
        setLoading(true)
        try {
            const ordersResponse = await ordersServices.get({ 
                boothId, 
                page: page,
                pageSize: pageSize 
            })
            const ordersData = ordersResponse.data || []
            const totalCount = ordersResponse.totalCount || 0

            const ordersWithCustomers = await Promise.all(
                ordersData.map(async (order) => {
                    try {
                        const customerResponse = await accountServices.get({ id: order.accountId })
                        const customerData = customerResponse.data?.[0] || {}
                        return {
                            ...order,
                            customer: customerData
                        }
                    } catch (error) {
                        console.error(`Error fetching customer ${order.accountId}:`, error)
                        return {
                            ...order,
                            customer: { fullName: 'N/A', email: 'N/A' }
                        }
                    }
                })
            )

            const sortedOrders = ordersWithCustomers.sort((a, b) => {
                return new Date(b.orderDate) - new Date(a.orderDate)
            })

            setOrders(sortedOrders)
            setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize,
                total: totalCount
            }))
        } catch (error) {
            toast.error('Không thể tải danh sách hóa đơn')
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchMenuItems = async () => {
        try {
            const menuResponse = await boothMenuItemServices.get({ boothId })
            setMenuItems(menuResponse.data || [])
        } catch (error) {
            toast.error('Không thể tải danh sách món ăn')
            console.error('Error fetching menu items:', error)
        }
    }

    const fetchBoothWallet = async () => {
        try {
            const walletResponse = await boothWalletServices.get({ boothId: boothId })
            const walletData = walletResponse.data?.[0]
            setBoothBalance(walletData?.totalBalance || 0)
        } catch (error) {
            console.error('Error fetching booth wallet:', error)
        }
    }

    const fetchBoothInfo = async () => {
        try {
            const boothResponse = await boothServices.get({ boothId: boothId })
            const boothData = boothResponse.data?.[0]
            if (boothData?.festivalId) {
                setFestivalId(boothData.festivalId)
                await fetchFestivalInfo(boothData.festivalId)
            }
        } catch (error) {
            console.error('Error fetching booth info:', error)
        }
    }

    const fetchFestivalInfo = async (festivalId) => {
        try {
            const festivalResponse = await festivalServices.get({ festivalId: festivalId })
            const festivalData = festivalResponse.data?.[0]
            setFestival(festivalData)
        } catch (error) {
            console.error('Error fetching festival info:', error)
        }
    }

    const handleCreatePaymentSuccess = () => {
        fetchOrders(pagination.current, pagination.pageSize)
        fetchBoothWallet()
        setCreateModalVisible(false)
    }

    const handleTableChange = (paginationInfo) => {
        fetchOrders(paginationInfo.current, paginationInfo.pageSize)
    }

    const canCreatePayment = () => {
        return hasRole([ROLE_NAME.STUDENT]) && festival?.status === FESTIVAL_STATUS.ONGOING
    }

    useEffect(() => {
        if (boothId) {
            fetchOrders()
            fetchMenuItems()
            fetchBoothWallet()
            fetchBoothInfo()
        }
    }, [boothId])

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <h4 className="text-lg font-semibold text-gray-900">Quản lý hóa đơn</h4>
                    <Card size="small" className="bg-green-50 border-green-200">
                        <div className="flex items-center space-x-2">
                            <DollarSign size={16} className="text-green-600" />
                            <span className="text-sm text-gray-600">Số dư gian hàng:</span>
                            <span className="font-medium text-lg text-green-600">
                                {boothBalance.toLocaleString()}đ
                            </span>
                        </div>
                    </Card>
                </div>
                {canCreatePayment() && (
                    <AntButton
                        type="primary"
                        icon={<Plus size={16} />}
                        onClick={() => setCreateModalVisible(true)}
                    >
                        Tạo thanh toán
                    </AntButton>
                )}
            </div>

            <OrdersTable 
                orders={orders}
                loading={loading}
                pagination={pagination}
                onTableChange={handleTableChange}
            />

            {createModalVisible && (
                <CreatePaymentModal
                    visible={createModalVisible}
                    onCancel={() => setCreateModalVisible(false)}
                    onSuccess={handleCreatePaymentSuccess}
                    boothId={boothId}
                    menuItems={menuItems}
                    festivalId={festivalId}
                />
            )}
        </div>
    )
}

export default OrdersManagement