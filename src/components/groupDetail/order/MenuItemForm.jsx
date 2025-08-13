import React from 'react'
import { Form, Select, InputNumber, Button as AntButton, Divider, List, Row, Col } from 'antd'
import { Plus, Trash2 } from 'lucide-react'

const { Option } = Select

const MenuItemForm = ({ 
    menuItems, 
    onAddItem, 
    billData, 
    onRemoveItem, 
    onUpdateQuantity 
}) => {
    const [itemForm] = Form.useForm()

    const handleAddItem = (values) => {
        onAddItem(values)
        itemForm.resetFields()
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
                Thêm món ăn
            </Divider>
            
            <Form
                form={itemForm}
                layout="vertical"
                onFinish={handleAddItem}
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
                                            onChange={(value) => onUpdateQuantity(item.id, value)}
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
                                            onClick={() => onRemoveItem(item.id)}
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
        </>
    )
}

export default MenuItemForm