import React, { useState, useEffect } from 'react';
import { Modal, Button, Descriptions, Tag, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { festivalServices } from '../../services/festivalServices';
import { ingredientServices } from '../../services/ingredientServices';
import { FESTIVAL_INGREDIENT_STATUS } from '../../utils/constants';

const SupplyDetailModal = ({ isOpen, onClose, supplyData }) => {
    const navigate = useNavigate();
    const [festival, setFestival] = useState(null);
    const [ingredient, setIngredient] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && supplyData) {
            loadDetails();
        }
    }, [isOpen, supplyData]);

    const loadDetails = async () => {
        try {
            setLoading(true);
            const [festivalResponse, ingredientResponse] = await Promise.all([
                festivalServices.get({ festivalId: supplyData.festivalId }),
                ingredientServices.get({ ingredientId: supplyData.ingredientId })
            ]);

            if (festivalResponse.data && festivalResponse.data.length > 0) {
                setFestival(festivalResponse.data[0]);
            }

            if (ingredientResponse.data && ingredientResponse.data.length > 0) {
                setIngredient(ingredientResponse.data[0]);
            }
        } catch (error) {
            console.error('Error loading details:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusTag = (status) => {
        const statusConfig = {
            [FESTIVAL_INGREDIENT_STATUS.AVAILABLE]: { color: 'green', text: 'Có sẵn' },
            [FESTIVAL_INGREDIENT_STATUS.LIMITED]: { color: 'orange', text: 'Hạn chế' },
            [FESTIVAL_INGREDIENT_STATUS.OUT_OF_STOCK]: { color: 'red', text: 'Hết hàng' },
            [FESTIVAL_INGREDIENT_STATUS.PENDING]: { color: 'blue', text: 'Chờ duyệt' },
            [FESTIVAL_INGREDIENT_STATUS.APPROVED]: { color: 'green', text: 'Đã duyệt' },
            [FESTIVAL_INGREDIENT_STATUS.REJECTED]: { color: 'red', text: 'Từ chối' }
        };

        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const handleViewFestival = () => {
        navigate(`/app/festivals/${supplyData.festivalId}`);
        onClose();
    };

    if (!supplyData) return null;

    return (
        <Modal
            title="Chi tiết cung cấp nguyên liệu"
            open={isOpen}
            onCancel={onClose}
            width={800}
            style={{ top: 10 }}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Đóng
                </Button>,
                <Button key="view-festival" type="primary" onClick={handleViewFestival}>
                    Xem chi tiết lễ hội
                </Button>
            ]}
        >
            <div className="space-y-6">
                <Descriptions title="Thông tin nguyên liệu" bordered column={2}>
                    <Descriptions.Item label="Tên nguyên liệu" span={2}>
                        {ingredient?.ingredientName || 'Đang tải...'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mô tả" span={2}>
                        {ingredient?.description || 'Đang tải...'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Đơn vị">
                        {ingredient?.unit || 'Đang tải...'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giá gốc">
                        {ingredient?.pricePerUnit ? `${ingredient.pricePerUnit.toLocaleString()} VNĐ` : 'Đang tải...'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số lượng cung cấp">
                        {supplyData.quantityAvailable}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giá đặc biệt">
                        {supplyData.specialPrice.toLocaleString()} VNĐ
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái" span={2}>
                        {getStatusTag(supplyData.status)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày đăng ký" span={2}>
                        {formatDate(supplyData.createdAt)}
                    </Descriptions.Item>
                </Descriptions>

                <Descriptions title="Thông tin lễ hội" bordered column={2}>
                    <Descriptions.Item label="Tên lễ hội" span={2}>
                        {festival?.festivalName || 'Đang tải...'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Chủ đề" span={2}>
                        {festival?.theme || 'Đang tải...'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa điểm" span={2}>
                        {festival?.location || 'Đang tải...'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian bắt đầu">
                        {festival?.startDate ? formatDate(festival.startDate) : 'Đang tải...'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian kết thúc">
                        {festival?.endDate ? formatDate(festival.endDate) : 'Đang tải...'}
                    </Descriptions.Item>
                </Descriptions>
            </div>
        </Modal>
    );
};

export default SupplyDetailModal;