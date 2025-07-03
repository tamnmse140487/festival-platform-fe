import React, { useState, useEffect } from 'react';
import { Modal, Table, InputNumber, Button, Space, Checkbox } from 'antd';
import { toast } from 'react-hot-toast';
import { ingredientServices } from '../../services/ingredientServices';
import { festivalIngredientServices } from '../../services/festivalIngredientServices';

const IngredientRegistrationModal = ({ 
  isOpen, 
  onClose, 
  festivalId, 
  supplierId 
}) => {
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [specialPrices, setSpecialPrices] = useState({});

  useEffect(() => {
    if (isOpen && supplierId) {
      loadIngredients();
    }
  }, [isOpen, supplierId]);

  const loadIngredients = async () => {
    try {
      setLoading(true);
      const response = await ingredientServices.get({ supplierId });
      setIngredients(response.data || []);
    } catch (error) {
      console.error('Error loading ingredients:', error);
      toast.error('Không thể tải danh sách nguyên liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleIngredientSelect = (ingredientId, checked) => {
    if (checked) {
      setSelectedIngredients(prev => [...prev, ingredientId]);
    } else {
      setSelectedIngredients(prev => prev.filter(id => id !== ingredientId));
      setQuantities(prev => {
        const newQuantities = { ...prev };
        delete newQuantities[ingredientId];
        return newQuantities;
      });
      setSpecialPrices(prev => {
        const newPrices = { ...prev };
        delete newPrices[ingredientId];
        return newPrices;
      });
    }
  };

  const handleQuantityChange = (ingredientId, value) => {
    setQuantities(prev => ({
      ...prev,
      [ingredientId]: value
    }));
  };

  const handleSpecialPriceChange = (ingredientId, value) => {
    setSpecialPrices(prev => ({
      ...prev,
      [ingredientId]: value
    }));
  };

  const handleSubmit = async () => {
    if (selectedIngredients.length === 0) {
      toast.error('Vui lòng chọn ít nhất một nguyên liệu');
      return;
    }

    const invalidItems = selectedIngredients.filter(id => 
      !quantities[id] || quantities[id] <= 0 || !specialPrices[id] || specialPrices[id] <= 0
    );

    if (invalidItems.length > 0) {
      toast.error('Vui lòng nhập đầy đủ số lượng và giá cho tất cả nguyên liệu đã chọn');
      return;
    }

    try {
      setSubmitting(true);
      
      const promises = selectedIngredients.map(ingredientId => 
        festivalIngredientServices.create({
          festivalId,
          ingredientId,
          quantityAvailable: quantities[ingredientId],
          specialPrice: specialPrices[ingredientId]
        })
      );

      await Promise.all(promises);
      
      toast.success('Đăng ký cung cấp nguyên liệu thành công!');
      onClose();
      
      setSelectedIngredients([]);
      setQuantities({});
      setSpecialPrices({});
    } catch (error) {
      console.error('Error registering ingredients:', error);
      toast.error('Không thể đăng ký cung cấp nguyên liệu');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Chọn',
      key: 'select',
      width: 60,
      render: (_, record) => (
        <Checkbox
          checked={selectedIngredients.includes(record.ingredientId)}
          onChange={(e) => handleIngredientSelect(record.ingredientId, e.target.checked)}
        />
      )
    },
    {
      title: 'Tên nguyên liệu',
      dataIndex: 'ingredientName',
      key: 'ingredientName',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
    {
      title: 'Giá gốc',
      dataIndex: 'pricePerUnit',
      key: 'pricePerUnit',
      width: 120,
      render: (price) => `${price?.toLocaleString()} VNĐ`
    },
    {
      title: 'Số lượng có thể cung cấp',
      key: 'quantity',
      width: 180,
      render: (_, record) => (
        <InputNumber
          min={1}
          placeholder="Nhập số lượng"
          value={quantities[record.ingredientId]}
          onChange={(value) => handleQuantityChange(record.ingredientId, value)}
          disabled={!selectedIngredients.includes(record.ingredientId)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Giá đặc biệt',
      key: 'specialPrice',
      width: 150,
      render: (_, record) => (
        <InputNumber
          min={1}
          placeholder="Nhập giá"
          value={specialPrices[record.ingredientId]}
          onChange={(value) => handleSpecialPriceChange(record.ingredientId, value)}
          disabled={!selectedIngredients.includes(record.ingredientId)}
          style={{ width: '100%' }}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
        />
      )
    }
  ];

  return (
    <Modal
      title="Đăng ký cung cấp nguyên liệu"
      open={isOpen}
      onCancel={onClose}
      width={1200}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={submitting}>
          Hủy
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={submitting}
          onClick={handleSubmit}
        >
          Đăng ký cung cấp
        </Button>
      ]}
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          Chọn các nguyên liệu bạn muốn cung cấp cho lễ hội này:
        </p>
        
        <Table
          columns={columns}
          dataSource={ingredients}
          rowKey="ingredientId"
          loading={loading}
          pagination={false}
          scroll={{ y: 400 }}
          size="small"
        />
        
        {selectedIngredients.length > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              Đã chọn {selectedIngredients.length} nguyên liệu
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default IngredientRegistrationModal;