import React, { useState, useCallback, useEffect } from 'react'
import { Form, Input, Spin, Avatar } from 'antd'
import { Search, User } from 'lucide-react'
import { accountServices } from '../../../services/accountServices'

const CustomerSearch = ({ onCustomerSelected, selectedCustomer }) => {
    const [customerSearchLoading, setCustomerSearchLoading] = useState(false)
    const [customerSearchTimeout, setCustomerSearchTimeout] = useState(null)
    const [noCustomerFound, setNoCustomerFound] = useState(false)

    const searchCustomerByEmail = useCallback(async (email) => {
        if (!email?.trim()) {
            onCustomerSelected(null)
            setNoCustomerFound(false)
            return
        }

        setCustomerSearchLoading(true)
        setNoCustomerFound(false)

        try {
            const customerResponse = await accountServices.get({ email: email.trim() })
            const customerData = customerResponse.data?.[0] || null

            if (customerData) {
                onCustomerSelected(customerData)
                setNoCustomerFound(false)
            } else {
                onCustomerSelected(null)
                setNoCustomerFound(true)
            }
        } catch (error) {
            onCustomerSelected(null)
            setNoCustomerFound(true)
            console.error('Error searching customer:', error)
        } finally {
            setCustomerSearchLoading(false)
        }
    }, [onCustomerSelected])

    const handleEmailChange = (e) => {
        const email = e.target.value

        if (customerSearchTimeout) {
            clearTimeout(customerSearchTimeout)
        }

        onCustomerSelected(null)
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

    useEffect(() => {
        return () => {
            if (customerSearchTimeout) {
                clearTimeout(customerSearchTimeout)
            }
        }
    }, [customerSearchTimeout])

    return (
        <>
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
        </>
    )
}

export default CustomerSearch