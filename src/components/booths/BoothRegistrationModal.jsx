import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Checkbox, Image as AntImage, Upload } from 'antd';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { boothServices } from '../../services/boothServices';
import { boothMenuItemServices } from '../../services/boothMenuItemServices';
import { studentGroupServices } from '../../services/studentGroupServices';
import { uploadService } from '../../services/uploadServices'; 
import { ImageIcon, UploadIcon } from 'lucide-react';

const { Option } = Select;
const { TextArea } = Input;

const BoothRegistrationModal = ({ isOpen, onClose, mapLocations = [], festivalId, menuItems = [] }) => {
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
    const [menuItemPrices, setMenuItemPrices] = useState({});
    const [menuItemImages, setMenuItemImages] = useState({});

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
            setMenuItemPrices(prev => {
                const newPrices = { ...prev };
                delete newPrices[itemId];
                return newPrices;
            });
            setMenuItemImages(prev => {
                const newImages = { ...prev };
                delete newImages[itemId];
                return newImages;
            });
        }
    };

    const handleQuantityChange = (itemId, value) => {
        setMenuItemQuantities(prev => ({
            ...prev,
            [itemId]: value
        }));
    };

    const handlePriceChange = (itemId, value) => {
        const numericValue = value.replace(/[^\d]/g, '');
        const numberValue = parseInt(numericValue) || 0;

        setMenuItemPrices(prev => ({
            ...prev,
            [itemId]: numberValue
        }));
    };

    const formatPrice = (price) => {
        if (!price) return '';
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const parsePrice = (formattedPrice) => {
        if (!formattedPrice) return 0;
        return parseInt(formattedPrice.replace(/\./g, '')) || 0;
    };

    const handleImageUpload = (itemId, fileList) => {
        setMenuItemImages(prev => ({
            ...prev,
            [itemId]: fileList
        }));
    };

    const getImagePreview = (fileList) => {
        if (!fileList || fileList.length === 0) return null;

        const file = fileList[0];
        if (file.url) return file.url;
        if (file.originFileObj) {
            return URL.createObjectURL(file.originFileObj);
        }
        if (file instanceof File) {
            return URL.createObjectURL(file);
        }
        return null;
    };

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            toast.error('Chỉ được upload file ảnh!');
            return false;
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            toast.error('Ảnh phải nhỏ hơn 5MB!');
            return false;
        }
        return false; 
    };

    const handleFormSubmit = (values) => {
        if (selectedMenuItems.length === 0) {
            toast.error('Vui lòng chọn ít nhất một món ăn/đồ uống');
            return;
        }

        const invalidQuantityItems = selectedMenuItems.filter(id =>
            !menuItemQuantities[id] || menuItemQuantities[id] <= 0
        );

        if (invalidQuantityItems.length > 0) {
            toast.error('Vui lòng nhập số lượng cho tất cả món đã chọn');
            return;
        }

        const invalidPriceItems = selectedMenuItems.filter(id =>
            !menuItemPrices[id] || menuItemPrices[id] <= 0
        );

        if (invalidPriceItems.length > 0) {
            toast.error('Vui lòng nhập giá cho tất cả món đã chọn');
            return;
        }

        const invalidPriceRangeItems = selectedMenuItems.filter(id => {
            const item = menuItems.find(m => m.itemId === id);
            const customPrice = menuItemPrices[id];
            return customPrice < item.minPrice || customPrice > item.maxPrice;
        });

        if (invalidPriceRangeItems.length > 0) {
            const invalidItems = invalidPriceRangeItems.map(id => {
                const item = menuItems.find(m => m.itemId === id);
                return `${item.itemName} (${item.minPrice.toLocaleString('vi-VN')} - ${item.maxPrice.toLocaleString('vi-VN')} ₫)`;
            }).join(', ');
            toast.error(`Giá không hợp lệ cho: ${invalidItems}`);
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
                    quantityLimit: menuItemQuantities[menuItemId],
                    customPrice: menuItemPrices[menuItemId]
                })
            );

            const boothMenuItemResponses = await Promise.all(menuItemPromises);

            const imageUploadPromises = boothMenuItemResponses.map(async (response, index) => {
                const menuItemId = selectedMenuItems[index];
                const imageFileList = menuItemImages[menuItemId];

                if (imageFileList && imageFileList.length > 0) {
                    const file = imageFileList[0].originFileObj || imageFileList[0];
                    const boothMenuItemId = response.data.boothMenuItemId;

                    try {
                        await uploadService.uploadBoothImage(file, boothMenuItemId);
                    } catch (uploadError) {
                        console.error(`Error uploading image for item ${menuItemId}:`, uploadError);
                        toast.warning(`Không thể upload ảnh cho món ${menuItems.find(m => m.itemId === menuItemId)?.itemName}`);
                    }
                }
            });

            await Promise.all(imageUploadPromises);

            toast.success('Đăng ký gian hàng thành công! Vui lòng chờ giáo viên duyệt');
            form.resetFields();
            setSelectedMenuItems([]);
            setMenuItemQuantities({});
            setMenuItemPrices({});
            setMenuItemImages({});
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
        setMenuItemPrices({});
        setMenuItemImages({});
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
                width={900}
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
                            <div className="space-y-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                {filteredMenuItems.length > 0 ? (
                                    filteredMenuItems.map((item) => {
                                        const isSelected = selectedMenuItems.includes(item.itemId);

                                        return (
                                            <div key={item.itemId} className="flex flex-col space-y-3 p-4 border border-gray-100 rounded-lg">
                                                <div className="flex items-start space-x-3">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onChange={(e) => handleMenuItemSelect(item.itemId, e.target.checked)}
                                                    />

                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900 text-sm">{item.itemName}</h4>
                                                        <p className="text-xs text-gray-600 mb-1">{item.description}</p>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            Khoảng giá: {item.minPrice?.toLocaleString('vi-VN')} - {item.maxPrice?.toLocaleString('vi-VN')} ₫
                                                        </p>
                                                    </div>
                                                </div>

                                                {isSelected && (
                                                    <div className="ml-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                Số lượng *
                                                            </label>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                placeholder="Số lượng"
                                                                value={menuItemQuantities[item.itemId]}
                                                                onChange={(e) => handleQuantityChange(item.itemId, parseInt(e.target.value))}
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                Giá bán (₫) *
                                                            </label>
                                                            <Input
                                                                placeholder={`${item.minPrice?.toLocaleString('vi-VN')} - ${item.maxPrice?.toLocaleString('vi-VN')}`}
                                                                value={formatPrice(menuItemPrices[item.itemId])}
                                                                onChange={(e) => handlePriceChange(item.itemId, e.target.value)}
                                                                suffix="₫"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                Hình ảnh
                                                            </label>
                                                            <Upload
                                                                accept="image/*"
                                                                beforeUpload={beforeUpload}
                                                                fileList={menuItemImages[item.itemId] || []}
                                                                onChange={({ fileList }) => handleImageUpload(item.itemId, fileList)}
                                                                maxCount={1}
                                                                listType="picture-card"
                                                                className="menu-item-upload"
                                                            >
                                                                {(!menuItemImages[item.itemId] || menuItemImages[item.itemId].length === 0) && (
                                                                    <div className="flex flex-col items-center justify-center text-xs">
                                                                        <UploadIcon size={16} />
                                                                        <span>Upload</span>
                                                                    </div>
                                                                )}
                                                            </Upload>
                                                        </div>
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
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-medium text-blue-900 mb-3">
                                        Tóm tắt các món đã chọn ({selectedMenuItems.length} món)
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedMenuItems.map(itemId => {
                                            const item = menuItems.find(m => m.itemId === itemId);
                                            const quantity = menuItemQuantities[itemId];
                                            const price = menuItemPrices[itemId];
                                            const imageFileList = menuItemImages[itemId];
                                            const imagePreview = getImagePreview(imageFileList);

                                            return (
                                                <div key={itemId} className="flex items-center justify-between p-3 bg-white rounded border">
                                                    <div className="flex items-center space-x-3 flex-1">
                                                        {imagePreview && (
                                                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                                                <img
                                                                    src={imagePreview}
                                                                    alt={item?.itemName}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="flex-1">
                                                            <div className="font-medium text-sm">{item?.itemName}</div>
                                                            {!imagePreview && (
                                                                <div className="text-xs text-gray-500">Chưa có ảnh</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right text-sm">
                                                        <div className="text-gray-600">
                                                            SL: {quantity || 'Chưa nhập'}
                                                        </div>
                                                        <div className="font-medium text-blue-700">
                                                            {price ? `${formatPrice(price)} ₫` : 'Chưa nhập giá'}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-blue-200">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-blue-900">Tổng doanh thu ước tính:</span>
                                            <span className="font-bold text-blue-900">
                                                {selectedMenuItems.reduce((total, itemId) => {
                                                    const quantity = menuItemQuantities[itemId] || 0;
                                                    const price = menuItemPrices[itemId] || 0;
                                                    return total + (quantity * price);
                                                }, 0).toLocaleString('vi-VN')} ₫
                                            </span>
                                        </div>
                                    </div>
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
                                <ul className="mt-1 ml-4 text-xs space-y-1">
                                    {selectedMenuItems.map(itemId => {
                                        const item = menuItems.find(m => m.itemId === itemId);
                                        const imageFileList = menuItemImages[itemId];
                                        const imagePreview = getImagePreview(imageFileList);
                                        return (
                                            <li key={itemId} className="flex items-center justify-between py-2">
                                                <div className="flex items-center space-x-3">
                                                    {imagePreview && (
                                                        <div className="w-8 h-8 rounded overflow-hidden border border-gray-200 flex-shrink-0">
                                                            <img
                                                                src={imagePreview}
                                                                alt={item?.itemName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <span>• {item?.itemName}</span>
                                                    {!imagePreview && (
                                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                            Chưa có ảnh
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-gray-600">
                                                    SL: {menuItemQuantities[itemId]} |
                                                    Giá: {formatPrice(menuItemPrices[itemId])} ₫
                                                </span>
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