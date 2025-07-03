import React, { useState, useEffect } from 'react';
import { Modal, Button, Radio, Space } from 'antd';
import { toast } from 'react-hot-toast';
import { festivalIngredientServices } from '../../services/festivalIngredientServices';
import { ingredientServices } from '../../services/ingredientServices';
import { FESTIVAL_INGREDIENT_STATUS, ROLE_NAME } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';

const StatusUpdateModal = ({ isOpen, onClose, supplyData, onUpdate }) => {
  const { user, hasRole } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState(supplyData?.status);
  const [loading, setLoading] = useState(false);
  const [ingredient, setIngredient] = useState(null);
  const [loadingIngredient, setLoadingIngredient] = useState(false);

  useEffect(() => {
    if (isOpen && supplyData?.ingredientId) {
      loadIngredient();
    }
  }, [isOpen, supplyData]);

  useEffect(() => {
    setSelectedStatus(supplyData?.status);
  }, [supplyData]);

  const loadIngredient = async () => {
    try {
      setLoadingIngredient(true);
      const response = await ingredientServices.get({ ingredientId: supplyData.ingredientId });
      if (response.data && response.data.length > 0) {
        setIngredient(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading ingredient:', error);
    } finally {
      setLoadingIngredient(false);
    }
  };

  const getAvailableStatuses = () => {
    if (hasRole([ROLE_NAME.SCHOOL_MANAGER])) {
      if (supplyData?.status === FESTIVAL_INGREDIENT_STATUS.PENDING) {
        return [
          { value: FESTIVAL_INGREDIENT_STATUS.APPROVED, label: 'Duyệt' },
          { value: FESTIVAL_INGREDIENT_STATUS.REJECTED, label: 'Từ chối' }
        ];
      }
    }

    if (hasRole([ROLE_NAME.SUPPLIER]) && ingredient?.supplierId === user?.supplierId) {
      return [
        { value: FESTIVAL_INGREDIENT_STATUS.AVAILABLE, label: 'Có sẵn' },
        { value: FESTIVAL_INGREDIENT_STATUS.LIMITED, label: 'Hạn chế' },
        { value: FESTIVAL_INGREDIENT_STATUS.OUT_OF_STOCK, label: 'Hết hàng' }
      ];
    }

    return [];
  };

  const handleUpdate = async () => {
    if (!selectedStatus || selectedStatus === supplyData?.status) {
      toast.error('Vui lòng chọn trạng thái mới');
      return;
    }

    try {
      setLoading(true);
      await festivalIngredientServices.update({
        id: supplyData.festivalIngredientId,
        status: selectedStatus
      });

      toast.success('Cập nhật trạng thái thành công!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Không thể cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  const availableStatuses = getAvailableStatuses();

  if (loadingIngredient) {
    return (
      <Modal
        title="Cập nhật trạng thái"
        open={isOpen}
        onCancel={onClose}
        footer={null}
      >
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải thông tin...</p>
        </div>
      </Modal>
    );
  }

  if (availableStatuses.length === 0) {
    return null;
  }

  return (
    <Modal
      title="Cập nhật trạng thái"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading}>
          Hủy
        </Button>,
        <Button key="update" type="primary" loading={loading} onClick={handleUpdate}>
          Cập nhật
        </Button>
      ]}
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          Chọn trạng thái mới cho nguyên liệu này:
        </p>
        
        <Radio.Group
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <Space direction="vertical">
            {availableStatuses.map(status => (
              <Radio key={status.value} value={status.value}>
                {status.label}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </div>
    </Modal>
  );
};

export default StatusUpdateModal;