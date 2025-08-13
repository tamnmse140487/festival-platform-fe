import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Modal, Row, Col, Button as AntButton } from 'antd'
import { DollarSign } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { ordersServices } from '../../../services/orderServices'
import { orderItemsServices } from '../../../services/orderItemServices'
import { paymentServices } from '../../../services/paymentServices'
import { walletServices } from '../../../services/walletServices'
import { HISTORY_TYPE, ORDER_STATUS, PAYMENT_METHOD, PAYMENT_TYPE } from '../../../utils/constants'
import CustomerSearch from './CustomerSearch'
import MenuItemForm from './MenuItemForm'
import BillSummary from './BillSummary'
import PaymentForm from './PaymentForm'
import { accountWalletHistoriesServices } from '../../../services/accountWalletHistoryServices'
import { accountFestivalWalletsServices } from '../../../services/accountFestivalWalletsServices'
import { boothWalletServices } from '../../../services/boothWalletServices'

const CreatePaymentModal = ({ visible, onCancel, onSuccess, boothId, menuItems, festivalId }) => {
    const isAddingRef = useRef(false)
    
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [createPaymentLoading, setCreatePaymentLoading] = useState(false)
    const [billData, setBillData] = useState([])
    const [paymentMethod, setPaymentMethod] = useState('')
    const [notes, setNotes] = useState('')
    
    const [mainWallet, setMainWallet] = useState(null)
    const [festivalWallet, setFestivalWallet] = useState(null)
    const [walletLoading, setWalletLoading] = useState(false)
    const [boothWallet, setBoothWallet] = useState(null)

    const fetchWalletInfo = async (customer) => {
        if (!customer) return

        setWalletLoading(true)
        try {
            const mainWalletResponse = await walletServices.get({ userId: customer.id })
            const mainWalletData = mainWalletResponse.data?.[0] || null
            setMainWallet(mainWalletData)

            if (festivalId) {
                const festivalWalletResponse = await accountFestivalWalletsServices.get({ 
                    accountId: customer.id, 
                    festivalId: festivalId 
                })
                const festivalWalletData = festivalWalletResponse.data?.[0] || null
                setFestivalWallet(festivalWalletData)
            }

            const boothWalletResponse = await boothWalletServices.get({ boothId: boothId })
            const boothWalletData = boothWalletResponse.data?.[0] || null
            setBoothWallet(boothWalletData)
        } catch (error) {
            console.error('Error fetching wallet info:', error)
            setMainWallet(null)
            setFestivalWallet(null)
            setBoothWallet(null)
        } finally {
            setWalletLoading(false)
        }
    }

    const handleCustomerSelected = (customer) => {
        setSelectedCustomer(customer)
        if (customer) {
            fetchWalletInfo(customer)
        } else {
            setMainWallet(null)
            setFestivalWallet(null)
            setBoothWallet(null)
        }
    }

    const addItemToBill = (values) => {
        if (isAddingRef.current) return
        isAddingRef.current = true
        
        try {
            const selectedMenuItem = menuItems.find(
                (item) => item.boothMenuItemId === values.menuItemId
            )

            const existingItemIndex = billData.findIndex(
                (item) => item.menuItem.boothMenuItemId === selectedMenuItem.boothMenuItemId
            )

            if (existingItemIndex !== -1) {
                setBillData((prev) => {
                    const newBillData = [...prev]
                    const newQuantity =
                        Number(newBillData[existingItemIndex].quantity) + Number(values.quantity)
                    newBillData[existingItemIndex] = {
                        ...newBillData[existingItemIndex],
                        quantity: newQuantity,
                        totalPrice: newQuantity * selectedMenuItem.customPrice,
                    }
                    return newBillData
                })
                toast.success('Đã cập nhật số lượng món trong hóa đơn')
            } else {
                const qty = Number(values.quantity)
                const newItem = {
                    id: selectedMenuItem.boothMenuItemId,
                    menuItem: selectedMenuItem,
                    quantity: qty,
                    unitPrice: selectedMenuItem.customPrice,
                    totalPrice: qty * selectedMenuItem.customPrice,
                }
                setBillData((prev) => [...prev, newItem])
                toast.success('Đã thêm món vào hóa đơn')
            }
        } finally {
            isAddingRef.current = false
        }
    }

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

            if (paymentMethod === 'WALLET_MAIN' || paymentMethod === 'WALLET_FESTIVAL') {
                orderData.status = ORDER_STATUS.COMPLETED
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

            if (paymentMethod === PAYMENT_METHOD.BANK) {
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
            } else if (paymentMethod === 'WALLET_MAIN') {
                if (!mainWallet) {
                    throw new Error('Không tìm thấy ví chính của khách hàng')
                }

                if (mainWallet.balance < totalAmount) {
                    throw new Error('Số dư ví chính không đủ để thanh toán')
                }

                if (!boothWallet) {
                    throw new Error('Không tìm thấy ví gian hàng')
                }

                const newCustomerBalance = mainWallet.balance - totalAmount
                await walletServices.update({ walletId: mainWallet.walletId, balance: newCustomerBalance })

                const newBoothBalance = boothWallet.totalBalance + totalAmount
                await boothWalletServices.update({ boothWalletId: boothWallet.boothWalletId, totalBalance: newBoothBalance })

                await accountWalletHistoriesServices.create({
                    accountId: selectedCustomer.id,
                    description: `Thanh toán cho đơn hàng có mã ${orderId} bằng ví chính`,
                    amount: totalAmount,
                    type: HISTORY_TYPE.PAYMENT
                })

                toast.success('Thanh toán bằng ví chính thành công')
            } else if (paymentMethod === 'WALLET_FESTIVAL') {
                if (!festivalWallet) {
                    throw new Error('Không tìm thấy ví phụ lễ hội của khách hàng')
                }

                if (festivalWallet.balance < totalAmount) {
                    throw new Error('Số dư ví phụ lễ hội không đủ để thanh toán')
                }

                if (!boothWallet) {
                    throw new Error('Không tìm thấy ví gian hàng')
                }

                const newCustomerBalance = festivalWallet.balance - totalAmount
                await accountFestivalWalletsServices.update({ 
                    id: festivalWallet.accountFestivalWalletId, 
                    newBalance: newCustomerBalance 
                })

                const newBoothBalance = boothWallet.totalBalance + totalAmount
                await boothWalletServices.update({ boothWalletId: boothWallet.boothWalletId, totalBalance: newBoothBalance })

                await accountWalletHistoriesServices.create({
                    accountId: selectedCustomer.id,
                    description: `Thanh toán cho đơn hàng có mã ${orderId} bằng ví phụ ${festivalWallet.name}`,
                    amount: totalAmount,
                    type: HISTORY_TYPE.PAYMENT
                })

                toast.success('Thanh toán bằng ví phụ lễ hội thành công')
            } else {
                throw new Error('Phương thức thanh toán không hợp lệ')
            }

            onSuccess()
            resetAllStates()

        } catch (error) {
            toast.error('Không thể tạo thanh toán')
            toast.error(error?.response?.data?.message || error?.message)
            console.error('Error creating payment:', error)
        } finally {
            setCreatePaymentLoading(false)
        }
    }

    const resetAllStates = () => {
        setSelectedCustomer(null)
        setBillData([])
        setPaymentMethod('')
        setNotes('')
        setMainWallet(null)
        setFestivalWallet(null)
        setBoothWallet(null)
    }

    const handleCancel = () => {
        resetAllStates()
        onCancel()
    }

    const isPaymentMethodValid = () => {
        if (!paymentMethod) return false
        
        if (paymentMethod === PAYMENT_METHOD.BANK) return true
        if (paymentMethod === 'WALLET_MAIN') {
            return mainWallet && mainWallet.balance >= getTotalAmount()
        }
        if (paymentMethod === 'WALLET_FESTIVAL') {
            return festivalWallet && festivalWallet.balance >= getTotalAmount()
        }
        
        return false
    }

    return (
        <Modal
            title="Tạo thanh toán mới"
            open={visible}
            onCancel={handleCancel}
            style={{ top: 20 }}
            footer={null}
            width={1200}
        >
            <Row gutter={24} className="min-h-[600px]">
                <Col span={14} className="border-r border-gray-200 pr-6">
                    <div className="space-y-6">
                        <CustomerSearch 
                            onCustomerSelected={handleCustomerSelected}
                            selectedCustomer={selectedCustomer}
                        />

                        {selectedCustomer && (
                            <>
                                <MenuItemForm
                                    menuItems={menuItems}
                                    onAddItem={addItemToBill}
                                    billData={billData}
                                    onRemoveItem={removeItemFromBill}
                                    onUpdateQuantity={updateItemQuantity}
                                />

                                {billData.length > 0 && (
                                    <PaymentForm
                                        paymentMethod={paymentMethod}
                                        setPaymentMethod={setPaymentMethod}
                                        notes={notes}
                                        setNotes={setNotes}
                                        selectedCustomer={selectedCustomer}
                                        festivalId={festivalId}
                                        totalAmount={getTotalAmount()}
                                        mainWallet={mainWallet}
                                        festivalWallet={festivalWallet}
                                        walletLoading={walletLoading}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </Col>

                <Col span={10} className="pl-6">
                    <BillSummary
                        selectedCustomer={selectedCustomer}
                        billData={billData}
                        paymentMethod={paymentMethod}
                        notes={notes}
                        totalAmount={getTotalAmount()}
                    />
                </Col>
            </Row>

            <div className="flex justify-end space-x-2 pt-6 border-t border-gray-200 mt-6">
                <AntButton onClick={handleCancel} size="large">
                    Hủy
                </AntButton>
                <AntButton
                    type="primary"
                    loading={createPaymentLoading}
                    onClick={handleConfirmPayment}
                    icon={<DollarSign size={16} />}
                    size="large"
                    disabled={!selectedCustomer || billData.length === 0 || !isPaymentMethodValid()}
                >
                    Xác nhận tạo thanh toán
                </AntButton>
            </div>
        </Modal>
    )
}

export default CreatePaymentModal