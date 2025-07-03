import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Checkbox, Image as AntImage } from 'antd';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { boothServices } from '../../services/boothServices';
import { boothMenuItemServices } from '../../services/boothMenuItemServices';
import { studentGroupServices } from '../../services/studentGroupServices';
import { ImageIcon } from 'lucide-react';

const { Option } = Select;
const { TextArea } = Input;

const BoothRegistrationModal = ({ isOpen, onClose, mapLocations = [], festivalId, menuItems = [], menuItemImages = [] }) => {
    const { user } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedMenuItems, setSelectedMenuItems] = useState([]);
    const [menuItemQuantities, setMenuItemQuantities] = useState({});

    useEffect(() => {
        if (isOpen && user?.id) {
            loadGroups();
        }
    }, [isOpen, user]);

    const loadGroups = async () => {
        try {
            setLoadingGroups(true);
            const response = await studentGroupServices.get({ accountId: user.id });
            setGroups(response.data || []);
        } catch (error) {
            console.error('Error loading groups:', error);
            toast.error('Không thể tải danh sách nhóm');
        } finally {
            setLoadingGroups(false);
        }
    };

    const getItemImage = (itemId) => {
        return menuItemImages?.find(img => img.menuItemId === itemId);
    };

    const handleMenuItemSelect = (itemId, checked) => {
        if (checked) {
            setSelectedMenuItems(prev => [...prev, itemId]);
        } else {
            setSelectedMenuItems(prev => prev.filter(id => id !== itemId));
            setMenuItemQuantities(prev => {
                const newQuantities = { ...prev };
                delete newQuantities[itemId];
                return newQuantities;
            });
        }
    };

    const handleQuantityChange = (itemId, value) => {
        setMenuItemQuantities(prev => ({
            ...prev,
            [itemId]: value
        }));
    };

    const handleFormSubmit = (values) => {
        if (selectedMenuItems.length === 0) {
            toast.error('Vui lòng chọn ít nhất một món ăn/đồ uống');
            return;
        }

        const invalidItems = selectedMenuItems.filter(id =>
            !menuItemQuantities[id] || menuItemQuantities[id] <= 0
        );

        if (invalidItems.length > 0) {
            toast.error('Vui lòng nhập số lượng cho tất cả món đã chọn');
            return;
        }

        const location = mapLocations.find(loc => loc.locationId === values.locationId);
        setSelectedLocation(location);
        setFormData(values);
        setShowConfirmModal(true);
    };

    const handleConfirmRegistration = async () => {
        try {
            setLoading(true);

            const boothResponse = await boothServices.create({
                ...formData,
                festivalId
            });

            const boothId = boothResponse.data.boothId;

            const menuItemPromises = selectedMenuItems.map(menuItemId =>
                boothMenuItemServices.create({
                    boothId,
                    menuItemId,
                    quantityLimit: menuItemQuantities[menuItemId]
                })
            );

            await Promise.all(menuItemPromises);

            toast.success('Đăng ký gian hàng thành công! Vui lòng chờ giáo viên duyệt');
            form.resetFields();
            setSelectedMenuItems([]);
            setMenuItemQuantities({});
            setShowConfirmModal(false);
            onClose();
        } catch (error) {
            console.error('Error registering booth:', error);
            toast.error('Không thể đăng ký gian hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (loading) return;

        form.resetFields();
        setSelectedMenuItems([]);
        setMenuItemQuantities({});
        setShowConfirmModal(false);
        setFormData(null);
        setSelectedLocation(null);
        onClose();
    };

    const availableLocations = mapLocations.filter(location => !location.isOccupied);
    const selectedBoothType = Form.useWatch('boothType', form);
    const filteredMenuItems = selectedBoothType
        ? menuItems.filter(item => item.itemType === selectedBoothType)
        : menuItems;

    return (
        <>
            <Modal
                title="Đăng ký gian hàng"
                open={isOpen}
                onCancel={handleCancel}
                footer={null}
                width={800}
                style={{ top: 10 }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    className="space-y-4"
                >
                    <Form.Item
                        name="groupId"
                        label="Nhóm sinh viên"
                        rules={[{ required: true, message: 'Vui lòng chọn nhóm' }]}
                    >
                        <Select
                            placeholder="Chọn nhóm"
                            loading={loadingGroups}
                            disabled={loadingGroups}
                        >
                            {groups.map(group => (
                                <Option key={group.groupId} value={group.groupId}>
                                    {group.groupName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="locationId"
                        label="Vị trí gian hàng"
                        rules={[{ required: true, message: 'Vui lòng chọn vị trí' }]}
                    >
                        <Select placeholder="Chọn vị trí">
                            {availableLocations.map(location => (
                                <Option key={location.locationId} value={location.locationId}>
                                    {location.coordinates ? `${location.coordinates} - ` : ''}{location.locationName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="boothName"
                        label="Tên gian hàng"
                        rules={[{ required: true, message: 'Vui lòng nhập tên gian hàng' }]}
                    >
                        <Input placeholder="Nhập tên gian hàng" />
                    </Form.Item>

                    <Form.Item
                        name="boothType"
                        label="Loại gian hàng"
                        rules={[{ required: true, message: 'Vui lòng chọn loại gian hàng' }]}
                    >
                        <Select placeholder="Chọn loại gian hàng">
                            <Option value="food">Đồ ăn</Option>
                            <Option value="beverage">Đồ uống</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Mô tả về gian hàng của bạn"
                        />
                    </Form.Item>

                    {selectedBoothType && (
                        <Form.Item
                            label="Chọn món ăn/đồ uống"
                            required
                        >
                            <div className="space-y-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                {filteredMenuItems.length > 0 ? (
                                    filteredMenuItems.map((item) => {
                                        const itemImage = getItemImage(item.itemId);
                                        const isSelected = selectedMenuItems.includes(item.itemId);

                                        return (
                                            <div key={item.itemId} className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={(e) => handleMenuItemSelect(item.itemId, e.target.checked)}
                                                />

                                                <div className="flex-shrink-0">
                                                    {itemImage && itemImage.imageUrl ? (
                                                        <AntImage
                                                            src={itemImage.imageUrl}
                                                            alt={item.itemName}
                                                            width={50}
                                                            height={50}
                                                            className="object-cover rounded-lg"
                                                            fallback={
                                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                                    <ImageIcon className="w-6 h-6 text-gray-400" />
                                                                </div>
                                                            }
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                            <ImageIcon className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900 text-sm">{item.itemName}</h4>
                                                    <p className="text-xs text-gray-600">{item.description}</p>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {item.basePrice.toLocaleString('vi-VN')} ₫
                                                    </p>
                                                </div>

                                                {isSelected && (
                                                    <div className="flex-shrink-0">
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            placeholder="Số lượng"
                                                            value={menuItemQuantities[item.itemId]}
                                                            onChange={(e) => handleQuantityChange(item.itemId, parseInt(e.target.value))}
                                                            style={{ width: 100 }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 text-center py-4">
                                        Không có món {selectedBoothType === 'food' ? 'ăn' : 'uống'} nào trong thực đơn
                                    </p>
                                )}
                            </div>

                            {selectedMenuItems.length > 0 && (
                                <div className="mt-2 text-sm text-blue-600">
                                    Đã chọn {selectedMenuItems.length} món
                                </div>
                            )}
                        </Form.Item>
                    )}

                    <Form.Item className="mb-0">
                        <div className="flex justify-end space-x-3">
                            <Button onClick={handleCancel}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Đăng ký
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Xác nhận đăng ký"
                open={showConfirmModal}
                onCancel={() => !loading && setShowConfirmModal(false)}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => setShowConfirmModal(false)}
                        disabled={loading}
                    >
                        Hủy
                    </Button>,
                    <Button
                        key="confirm"
                        type="primary"
                        loading={loading}
                        onClick={handleConfirmRegistration}
                    >
                        Xác nhận đăng ký
                    </Button>
                ]}
            >
                <div className="space-y-3">
                    <p className="text-gray-700">
                        Bạn có chắc muốn đăng ký gian hàng <strong>"{formData?.boothName}"</strong> tại vị trí{' '}
                        <strong>
                            {selectedLocation?.coordinates ? `${selectedLocation.coordinates} - ` : ''}
                            {selectedLocation?.locationName}
                        </strong>{' '}
                        trong lễ hội này không?
                    </p>

                    <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                        <div><strong>Tên gian hàng:</strong> {formData?.boothName}</div>
                        <div><strong>Loại:</strong> {formData?.boothType === 'food' ? 'Đồ ăn' : 'Đồ uống'}</div>
                        <div><strong>Vị trí:</strong> {selectedLocation?.coordinates ? `${selectedLocation.coordinates} - ` : ''}{selectedLocation?.locationName}</div>
                        <div><strong>Số món đã chọn:</strong> {selectedMenuItems.length}</div>

                        {selectedMenuItems.length > 0 && (
                            <div>
                                <strong>Danh sách món:</strong>
                                <ul className="mt-1 ml-4 text-xs">
                                    {selectedMenuItems.map(itemId => {
                                        const item = menuItems.find(m => m.itemId === itemId);
                                        return (
                                            <li key={itemId}>
                                                • {item?.itemName} (SL: {menuItemQuantities[itemId]})
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default BoothRegistrationModal;