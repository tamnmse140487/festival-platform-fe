import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Card } from 'antd';
import { Eye, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { festivalIngredientServices } from '../../services/festivalIngredientServices';
import { ingredientServices } from '../../services/ingredientServices';
import { FESTIVAL_INGREDIENT_STATUS, ROLE_NAME } from '../../utils/constants';
import SupplyDetailModal from '../../components/supply/SupplyDetailModal';
import StatusUpdateModal from '../../components/supply/StatusUpdateModal';

const SupplyManagementPage = () => {
  const { user, hasRole } = useAuth();
  const [supplies, setSupplies] = useState([]);
  const [ingredients, setIngredients] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    loadSupplies();
  }, []);

  const loadSupplies = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (hasRole([ROLE_NAME.SUPPLIER])) {
        params.supplierId = user.supplierId;
      }

      const response = await festivalIngredientServices.get(params);
      const suppliesData = response.data || [];
      setSupplies(suppliesData);

      const uniqueIngredientIds = [...new Set(suppliesData.map(supply => supply.ingredientId))];
      const ingredientPromises = uniqueIngredientIds.map(id => 
        ingredientServices.get({ ingredientId: id })
      );
      
      const ingredientResponses = await Promise.all(ingredientPromises);
      const ingredientsMap = {};
      
      ingredientResponses.forEach((response, index) => {
        if (response.data && response.data.length > 0) {
          ingredientsMap[uniqueIngredientIds[index]] = response.data[0];
        }
      });
      
      setIngredients(ingredientsMap);
    } catch (error) {
      console.error('Error loading supplies:', error);
      toast.error('Không thể tải danh sách cung cấp nguyên liệu');
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
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const canUpdateStatus = (record) => {
    if (hasRole([ROLE_NAME.SCHOOL_MANAGER]) && record.status === FESTIVAL_INGREDIENT_STATUS.PENDING) {
      return true;
    }
    
    const ingredient = ingredients[record.ingredientId];
    if (hasRole([ROLE_NAME.SUPPLIER]) && ingredient?.supplierId === user?.supplierId) {
      return true;
    }
    
    return false;
  };

  const handleViewDetail = (record) => {
    setSelectedSupply(record);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = (record) => {
    setSelectedSupply(record);
    setShowStatusModal(true);
  };

  const handleStatusUpdated = () => {
    loadSupplies();
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'festivalIngredientId',
      key: 'festivalIngredientId',
      width: 80,
    },
    {
      title: 'Lễ hội',
      dataIndex: 'festivalId',
      key: 'festivalId',
      render: (festivalId) => `Festival #${festivalId}`,
    },
    {
      title: 'Nguyên liệu',
      dataIndex: 'ingredientId',
      key: 'ingredientId',
      render: (ingredientId) => {
        const ingredient = ingredients[ingredientId];
        return ingredient ? ingredient.ingredientName : `Ingredient #${ingredientId}`;
      },
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantityAvailable',
      key: 'quantityAvailable',
      width: 100,
    },
    {
      title: 'Giá đặc biệt',
      dataIndex: 'specialPrice',
      key: 'specialPrice',
      width: 150,
      render: (price) => `${price?.toLocaleString()} VNĐ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => formatDate(date),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<Eye size={16} />}
            onClick={() => handleViewDetail(record)}
            size="small"
          >
            Xem
          </Button>
          {canUpdateStatus(record) && (
            <Button
              type="link"
              icon={<Edit size={16} />}
              onClick={() => handleUpdateStatus(record)}
              size="small"
            >
              Cập nhật
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Quản lý cung cấp nguyên liệu
        </h1>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={supplies}
          rowKey="festivalIngredientId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} mục`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <SupplyDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        supplyData={selectedSupply}
      />

      <StatusUpdateModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        supplyData={selectedSupply}
        onUpdate={handleStatusUpdated}
      />
    </div>
  );
};

export default SupplyManagementPage;