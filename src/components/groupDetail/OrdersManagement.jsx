import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Table, Button as AntButton, Avatar, Modal, Form, Input, Select, InputNumber, Card, Divider, Spin, List, Row, Col } from 'antd'
import { Plus, User, DollarSign, Calendar, ShoppingCart, Receipt, Search, Trash2, Edit } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { ordersServices } from '../../services/orderServices'
import { orderItemsServices } from '../../services/orderItemServices'
import { paymentServices } from '../../services/paymentServices'
import { accountServices } from '../../services/accountServices'
import { boothMenuItemServices } from '../../services/boothMenuItemServices'
import { walletServices } from '../../services/walletServices'
import { ORDER_STATUS, ORDER_STATUS_LABELS, PAYMENT_METHOD, PAYMENT_METHOD_LABELS, PAYMENT_TYPE, ROLE_NAME } from '../../utils/constants'

import { convertToVietnamTimeWithFormat } from '../../utils/formatters'
import { getOrderStatusColor } from '../../utils/helpers'
import { useAuth } from '../../contexts/AuthContext'

const { Option } = Select

const OrdersManagement = ({ boothId }) => {

    const { user, hasRole } = useAuth();
    const isAddingRef = useRef(false);

    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [createModalVisible, setCreateModalVisible] = useState(false)
    const [createForm] = Form.useForm()
    const [itemForm] = Form.useForm()
    const [menuItems, setMenuItems] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [customerSearchLoading, setCustomerSearchLoading] = useState(false)
    const [customerSearchTimeout, setCustomerSearchTimeout] = useState(null)
    const [noCustomerFound, setNoCustomerFound] = useState(false)
    const [createPaymentLoading, setCreatePaymentLoading] = useState(false)
    const [billData, setBillData] = useState([])
    const [paymentMethod, setPaymentMethod] = useState('')
    const [notes, setNotes] = useState('')

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const ordersResponse = await ordersServices.get({ boothId })
            const ordersData = ordersResponse.data || []

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

    const searchCustomerByEmail = useCallback(async (email) => {
        if (!email?.trim()) {
            setSelectedCustomer(null)
            setNoCustomerFound(false)
            return
        }

        setCustomerSearchLoading(true)
        setNoCustomerFound(false)

        try {
            const customerResponse = await accountServices.get({ email: email.trim() })
            const customerData = customerResponse.data?.[0] || null

            if (customerData) {
                setSelectedCustomer(customerData)
                setNoCustomerFound(false)
            } else {
                setSelectedCustomer(null)
                setNoCustomerFound(true)
            }
        } catch (error) {
            setSelectedCustomer(null)
            setNoCustomerFound(true)
            console.error('Error searching customer:', error)
        } finally {
            setCustomerSearchLoading(false)
        }
    }, [])

    const handleEmailChange = (e) => {
        const email = e.target.value

        if (customerSearchTimeout) {
            clearTimeout(customerSearchTimeout)
        }

        setSelectedCustomer(null)
        setNoCustomerFound(false)

        if (email?.trim()) {
            setCustomerSearchLoading(true)
            const newTimeout = setTimeout(() => {
                searchCustomerByEmail(email)
            }, 1000)
            setCustomerSearchTimeout(newTimeout)
        } else {
            setCustomerSearchLoading(false)
        }
    }

    const addItemToBill = (values) => {
        if (isAddingRef.current) return;     
        isAddingRef.current = true;
        try {
            const selectedMenuItem = menuItems.find(
                (item) => item.boothMenuItemId === values.menuItemId
            );

            const existingItemIndex = billData.findIndex(
                (item) => item.menuItem.boothMenuItemId === selectedMenuItem.boothMenuItemId
            );

            if (existingItemIndex !== -1) {
                setBillData((prev) => {
                    const newBillData = [...prev];
                    const newQuantity =
                        Number(newBillData[existingItemIndex].quantity) + Number(values.quantity);
                    newBillData[existingItemIndex] = {
                        ...newBillData[existingItemIndex],
                        quantity: newQuantity,
                        totalPrice: newQuantity * selectedMenuItem.customPrice,
                    };
                    return newBillData;
                });
                toast.success('Đã cập nhật số lượng món trong hóa đơn');
            } else {
                const qty = Number(values.quantity);
                const newItem = {
                    id: selectedMenuItem.boothMenuItemId,
                    menuItem: selectedMenuItem,
                    quantity: qty,
                    unitPrice: selectedMenuItem.customPrice,
                    totalPrice: qty * selectedMenuItem.customPrice,
                };
                setBillData((prev) => [...prev, newItem]);
                toast.success('Đã thêm món vào hóa đơn');
            }

            itemForm.resetFields();
        } finally {
            isAddingRef.current = false;
        }
    };

    const removeItemFromBill = (itemId) => {
        setBillData(prev => prev.filter(item => item.id !== itemId))
        toast.success('Đã xóa món khỏi hóa đơn')
    }

    const updateItemQuantity = (itemId, newQuantity) => {
        if (newQuantity <= 0) {
            removeItemFromBill(itemId)
            return
        }

        setBillData(prev => prev.map(item => {
            if (item.id === itemId) {
                return {
                    ...item,
                    quantity: newQuantity,
                    totalPrice: item.unitPrice * newQuantity
                }
            }
            return item
        }))
    }

    const getTotalAmount = () => {
        return billData.reduce((total, item) => total + item.totalPrice, 0)
    }

    const handleConfirmPayment = async () => {
        if (!selectedCustomer) {
            toast.error('Vui lòng chọn khách hàng')
            return
        }

        if (billData.length === 0) {
            toast.error('Vui lòng thêm ít nhất một món vào hóa đơn')
            return
        }

        if (!paymentMethod) {
            toast.error('Vui lòng chọn phương thức thanh toán')
            return
        }

        setCreatePaymentLoading(true)
        try {
            const totalAmount = getTotalAmount()

            const orderData = {
                accountId: selectedCustomer.id,
                boothId: boothId,
                totalAmount: totalAmount,
                notes: notes
            }

            const orderResponse = await ordersServices.create(orderData)
            const orderId = orderResponse.data?.orderId

            if (!orderId) {
                throw new Error('Không thể tạo đơn hàng')
            }

            const orderItemPromises = billData.map(item => {
                const orderItemData = {
                    orderId: orderId,
                    menuItemId: item.menuItem.menuItemId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice
                }
                return orderItemsServices.create(orderItemData)
            })

            await Promise.all(orderItemPromises)

            const walletResponse = await walletServices.get({ userId: selectedCustomer.id })
            const walletData = walletResponse.data?.[0]

            if (!walletData) {
                throw new Error('Không tìm thấy ví của khách hàng')
            }

            const paymentData = {
                orderId: orderId,
                walletId: walletData.walletId,
                paymentMethod: paymentMethod,
                paymentType: PAYMENT_TYPE.ORDER,
                amountPaid: totalAmount,
                description: 'Hoa don'
            }

            const paymentResponse = await paymentServices.create(paymentData)
            const checkoutUrl = paymentResponse.data?.checkoutUrl

            if (checkoutUrl) {
                window.location.href = checkoutUrl
                toast.success('Tạo link thanh toán thành công')
            } else {
                toast.success('Tạo thanh toán thành công')
            }

            resetAllStates()
            fetchOrders()

        } catch (error) {
            toast.error('Không thể tạo thanh toán')
            toast.error(error?.response?.data?.message || error?.message)
            console.error('Error creating payment:', error)
        } finally {
            setCreatePaymentLoading(false)
        }
    }

    const resetAllStates = () => {
        setCreateModalVisible(false)
        createForm.resetFields()
        itemForm.resetFields()
        setSelectedCustomer(null)
        setBillData([])
        setPaymentMethod('')
        setNotes('')
        setNoCustomerFound(false)
        if (customerSearchTimeout) {
            clearTimeout(customerSearchTimeout)
        }
    }

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

    useEffect(() => {
        if (boothId) {
            fetchOrders()
            fetchMenuItems()
        }
    }, [boothId])

    useEffect(() => {
        return () => {
            if (customerSearchTimeout) {
                clearTimeout(customerSearchTimeout)
            }
        }
    }, [customerSearchTimeout])

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-900">Quản lý hóa đơn</h4>
                {hasRole([ROLE_NAME.STUDENT]) && (
                    <AntButton
                        type="primary"
                        icon={<Plus size={16} />}
                        onClick={() => setCreateModalVisible(true)}
                    >
                        Tạo thanh toán
                    </AntButton>
                )}
            </div>

            <Table
                columns={columns}
                dataSource={orders}
                loading={loading}
                rowKey="orderId"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} hóa đơn`,
                }}
                scroll={{ x: 800 }}
            />

            <Modal
                title="Tạo thanh toán mới"
                open={createModalVisible}
                onCancel={resetAllStates}
                style={{ top: 20 }}
                footer={null}
                width={1200}
            >
                <Row gutter={24} className="min-h-[600px]">
                    <Col span={14} className="border-r border-gray-200 pr-6">
                        <div className="space-y-6">
                            <Form layout="vertical">
                                <Form.Item
                                    label="Email khách hàng"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập email khách hàng' }
                                    ]}
                                >
                                    <Input
                                        placeholder="Nhập email để tìm khách hàng"
                                        onChange={handleEmailChange}
                                        suffix={customerSearchLoading ? <Spin size="small" /> : <Search size={16} />}
                                    />
                                </Form.Item>
                            </Form>

                            {customerSearchLoading && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center space-x-2 text-blue-600">
                                        <Spin size="small" />
                                        <span className="text-sm">Đang tìm kiếm khách hàng...</span>
                                    </div>
                                </div>
                            )}

                            {noCustomerFound && !customerSearchLoading && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="text-red-600 text-sm">
                                        Không tìm thấy khách hàng với email này
                                    </div>
                                </div>
                            )}

                            {selectedCustomer && !customerSearchLoading && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <Avatar
                                            src={selectedCustomer.avatarUrl}
                                            icon={<User />}
                                        />
                                        <div>
                                            <div className="font-medium text-green-800">{selectedCustomer.fullName}</div>
                                            <div className="text-sm text-green-600">{selectedCustomer.email}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedCustomer && (
                                <>
                                    <Divider
                                        orientation="left"
                                        style={{
                                            borderColor: '#d1d5db',
                                            color: '#374151',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Thêm món ăn
                                    </Divider>
                                    <Form
                                        form={itemForm}
                                        layout="vertical"
                                        onFinish={addItemToBill}
                                    >
                                        <Row gutter={16}>
                                            <Col span={14}>
                                                <Form.Item
                                                    label="Món ăn"
                                                    name="menuItemId"
                                                    rules={[{ required: true, message: 'Chọn món' }]}
                                                >
                                                    <Select placeholder="Chọn món ăn" size="large">
                                                        {menuItems.map(item => (
                                                            <Option key={item.boothMenuItemId} value={item.boothMenuItemId}>
                                                                <div className="flex justify-between">
                                                                    <span>{item.menuItem?.itemName || 'N/A'}</span>
                                                                    <span className="text-green-600 font-medium">
                                                                        {item.customPrice?.toLocaleString()}đ
                                                                    </span>
                                                                </div>
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col span={6}>
                                                <Form.Item
                                                    label="Số lượng"
                                                    name="quantity"
                                                    rules={[
                                                        { required: true, message: 'Nhập số lượng' },
                                                        { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' }
                                                    ]}
                                                >
                                                    <InputNumber
                                                        min={1}
                                                        placeholder="SL"
                                                        style={{ width: '100%' }}
                                                        size="large"
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={4}>
                                                <Form.Item label=" ">
                                                    <AntButton
                                                        type="primary"
                                                        onClick={() => itemForm.submit()}
                                                        icon={<Plus size={16} />}
                                                        size="large"
                                                        style={{ width: '100%' }}
                                                    >
                                                        Thêm
                                                    </AntButton>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Form>

                                    {billData.length > 0 && (
                                        <>
                                            <Divider
                                                orientation="left"
                                                style={{
                                                    borderColor: '#d1d5db',
                                                    color: '#374151',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                Danh sách món đã chọn
                                            </Divider>
                                            <List
                                                size="small"
                                                bordered
                                                dataSource={billData}
                                                renderItem={(item) => (
                                                    <List.Item className="hover:bg-gray-50">
                                                        <div className="flex justify-between items-center w-full">
                                                            <div className="flex-1">
                                                                <div className="font-medium">{item.menuItem.menuItem?.itemName}</div>
                                                                <div className="text-xs text-gray-500">
                                                                    {item.unitPrice.toLocaleString()}đ/món
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-3">
                                                                <InputNumber
                                                                    min={1}
                                                                    value={item.quantity}
                                                                    onChange={(value) => updateItemQuantity(item.id, value)}
                                                                    style={{ width: 70 }}
                                                                    size="small"
                                                                />
                                                                <div className="text-green-600 font-medium w-20 text-right">
                                                                    {item.totalPrice.toLocaleString()}đ
                                                                </div>
                                                                <AntButton
                                                                    type="text"
                                                                    danger
                                                                    icon={<Trash2 size={16} />}
                                                                    onClick={() => removeItemFromBill(item.id)}
                                                                    size="small"
                                                                />
                                                            </div>
                                                        </div>
                                                    </List.Item>
                                                )}
                                                style={{ maxHeight: '200px', overflow: 'auto' }}
                                            />
                                        </>
                                    )}

                                    {billData.length > 0 && (
                                        <>
                                            <Divider
                                                orientation="left"
                                                style={{
                                                    borderColor: '#d1d5db',
                                                    color: '#374151',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                Thông tin thanh toán
                                            </Divider>
                                            <Form layout="vertical">
                                                <Form.Item
                                                    label="Phương thức thanh toán"
                                                    required
                                                >
                                                    <Select
                                                        placeholder="Chọn phương thức thanh toán"
                                                        value={paymentMethod}
                                                        onChange={setPaymentMethod}
                                                        size="large"
                                                    >
                                                        {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                                                            <Option key={key} value={key}>
                                                                {label}
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>

                                                <Form.Item label="Ghi chú">
                                                    <Input.TextArea
                                                        rows={3}
                                                        placeholder="Nhập ghi chú (tùy chọn)"
                                                        value={notes}
                                                        onChange={(e) => setNotes(e.target.value)}
                                                    />
                                                </Form.Item>
                                            </Form>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </Col>

                    <Col span={10} className="pl-6">
                        <div className="sticky top-0">
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <h3 className="text-lg font-semibold mb-4 flex items-center">
                                    <Receipt className="mr-2" size={20} />
                                    Hóa đơn
                                </h3>

                                {selectedCustomer ? (
                                    <Card size="small" className="mb-4">
                                        <div className="flex items-center space-x-3">
                                            <Avatar
                                                src={selectedCustomer.avatarUrl}
                                                icon={<User />}
                                            />
                                            <div>
                                                <div className="font-medium">{selectedCustomer.fullName}</div>
                                                <div className="text-sm text-gray-600">{selectedCustomer.email}</div>
                                            </div>
                                        </div>
                                    </Card>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <User size={48} className="mx-auto mb-2 opacity-50" />
                                        <p>Chưa chọn khách hàng</p>
                                    </div>
                                )}

                                {billData.length > 0 ? (
                                    <div className="space-y-3">
                                        <Divider
                                            style={{
                                                borderColor: '#d1d5db',
                                                margin: '12px 0'
                                            }}
                                        />
                                        {billData.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                                <div>
                                                    <div className="font-medium text-sm">{item.menuItem.menuItem?.itemName}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {item.unitPrice.toLocaleString()}đ x {item.quantity}
                                                    </div>
                                                </div>
                                                <div className="font-medium text-green-600 text-sm">
                                                    {item.totalPrice.toLocaleString()}đ
                                                </div>
                                            </div>
                                        ))}

                                        <Divider
                                            style={{
                                                borderColor: '#d1d5db',
                                                margin: '12px 0'
                                            }}
                                        />

                                        {paymentMethod && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">Phương thức:</span>
                                                <span className="font-medium">{PAYMENT_METHOD_LABELS[paymentMethod]}</span>
                                            </div>
                                        )}

                                        {notes && (
                                            <div className="flex justify-between items-start text-sm">
                                                <span className="text-gray-600">Ghi chú:</span>
                                                <span className="font-medium text-right max-w-32">{notes}</span>
                                            </div>
                                        )}

                                        <Divider
                                            style={{
                                                borderColor: '#374151',
                                                margin: '16px 0'
                                            }}
                                        />

                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold">Tổng tiền:</span>
                                            <span className="text-xl font-bold text-green-600">
                                                {getTotalAmount().toLocaleString()}đ
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
                                        <p>Chưa có món nào</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>

                <div className="flex justify-end space-x-2 pt-6 border-t border-gray-200 mt-6">
                    <AntButton onClick={resetAllStates} size="large">
                        Hủy
                    </AntButton>
                    <AntButton
                        type="primary"
                        loading={createPaymentLoading}
                        onClick={handleConfirmPayment}
                        icon={<DollarSign size={16} />}
                        size="large"
                        disabled={!selectedCustomer || billData.length === 0 || !paymentMethod}
                    >
                        Xác nhận tạo thanh toán
                    </AntButton>
                </div>
            </Modal>
        </div>
    )
}

export default OrdersManagement