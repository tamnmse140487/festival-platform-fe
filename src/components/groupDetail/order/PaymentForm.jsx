import React from 'react'
import { Form, Select, Input, Divider } from 'antd'
import { PAYMENT_METHOD, PAYMENT_METHOD_LABELS } from '../../../utils/constants'

const { Option } = Select

const PaymentForm = ({
    paymentMethod,
    setPaymentMethod,
    notes,
    setNotes,
    selectedCustomer,
    festivalId,
    totalAmount,
    mainWallet,
    festivalWallet,
    walletLoading
}) => {

    const getPaymentOptions = () => {
        const options = []

        Object.entries(PAYMENT_METHOD_LABELS).forEach(([key, label]) => {
            if (key === PAYMENT_METHOD.ACCOUNT_POINTS || key === PAYMENT_METHOD.CASH) {
                options.push(
                    <Option key={key} value={key} disabled>
                        {label} (Tạm thời không khả dụng)
                    </Option>
                )
            } else if (key === PAYMENT_METHOD.BANK) {
                options.push(
                    <Option key={key} value={key}>
                        {label}
                    </Option>
                )
            } else if (key === PAYMENT_METHOD.WALLET) {
                options.push(
                    <Option key={key} value={key}>
                        {label}
                    </Option>
                )
            }
        })

        if (mainWallet) {
            const hasEnoughBalance = mainWallet.balance >= totalAmount
            options.push(
                <Option key="WALLET_MAIN" value="WALLET_MAIN" disabled={!hasEnoughBalance}>
                    Ví chính
                    {!hasEnoughBalance && ' - Số dư không đủ'}
                </Option>
            )
        } else {
            options.push(
                <Option key="WALLET_MAIN" value="WALLET_MAIN" disabled>
                    Ví chính - Khách hàng chưa có ví chính
                </Option>
            )
        }

        if (festivalWallet) {
            const hasEnoughBalance = festivalWallet.balance >= totalAmount
            options.push(
                <Option key="WALLET_FESTIVAL" value="WALLET_FESTIVAL" disabled={!hasEnoughBalance}>
                    Ví phụ <span className='font-bold'>{festivalWallet.name}</span>
                    {!hasEnoughBalance && ' - Số dư không đủ'}
                </Option>
            )
        } else {
            options.push(
                <Option key="WALLET_FESTIVAL" value="WALLET_FESTIVAL" disabled>
                    Ví phụ lễ hội - Khách hàng chưa có ví phụ cho lễ hội này
                </Option>
            )
        }


        return options
    }

    const handlePaymentMethodChange = (value) => {
        setPaymentMethod(value)
    }
    return (
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
                        onChange={handlePaymentMethodChange}
                        size="large"
                        loading={walletLoading}
                    >
                        {getPaymentOptions()}
                    </Select>
                </Form.Item>

                {((paymentMethod === 'WALLET_MAIN' && mainWallet && mainWallet.balance < totalAmount) ||
                    (paymentMethod === 'WALLET_FESTIVAL' && festivalWallet && festivalWallet.balance < totalAmount)) && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="text-red-600 text-sm">
                                Số dư trong ví hiện tại không đủ để thanh toán
                            </div>
                        </div>
                    )}

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
    )
}

export default PaymentForm