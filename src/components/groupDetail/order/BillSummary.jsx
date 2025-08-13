import React from 'react'
import { Card, Avatar, Divider } from 'antd'
import { Receipt, User, ShoppingCart } from 'lucide-react'
import { PAYMENT_METHOD_LABELS } from '../../../utils/constants'

const BillSummary = ({ 
    selectedCustomer, 
    billData, 
    paymentMethod, 
    notes, 
    totalAmount 
}) => {
    return (
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
                                {totalAmount.toLocaleString()}đ
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
    )
}

export default BillSummary