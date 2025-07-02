import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm } from 'antd';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { ingredientServices } from '../../services/ingredientServices';
import { useAuth } from '../../contexts/AuthContext';

const IngredientPage = () => {
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [form] = Form.useForm();

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const response = await ingredientServices.get({
        supplierId: user?.supplierId
      });
      setIngredients(response.data || []);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      toast.error('Không thể tải danh sách nguyên liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingIngredient(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingIngredient(record);
    form.setFieldsValue({
      ingredientName: record.ingredientName,
      description: record.description,
      unit: record.unit,
      pricePerUnit: record.pricePerUnit
    });
    setModalVisible(true);
  };

  const handleDelete = async (ingredientId) => {
    try {
      setDeleteLoading(prev => ({ ...prev, [ingredientId]: true }));
      await ingredientServices.delete({ id: ingredientId });
      toast.success('Xóa nguyên liệu thành công');
      fetchIngredients();
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      toast.error('Không thể xóa nguyên liệu');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [ingredientId]: false }));
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitLoading(true);
      const data = {
        ...values,
        supplierId: user?.supplierId
      };

      if (editingIngredient) {
        await ingredientServices.update({
          id: editingIngredient.ingredientId,
          ...data
        });
        toast.success('Cập nhật nguyên liệu thành công');
      } else {
        await ingredientServices.create(data);
        toast.success('Thêm nguyên liệu thành công');
      }

      setModalVisible(false);
      form.resetFields();
      fetchIngredients();
    } catch (error) {
      console.error('Error saving ingredient:', error);
      toast.error('Có lỗi xảy ra khi lưu nguyên liệu');
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.ingredientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ingredient.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: 'Tên nguyên liệu',
      dataIndex: 'ingredientName',
      key: 'ingredientName',
      render: (text, record) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
            <Package className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            {record.description && (
              <div className="text-sm text-gray-500 truncate max-w-xs">
                {record.description}
              </div>
            )}
          </div>
        </div>
      ),
      sorter: (a, b) => a.ingredientName.localeCompare(b.ingredientName),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
      render: (text) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          {text}
        </span>
      ),
    },
    {
      title: 'Giá/Đơn vị',
      dataIndex: 'pricePerUnit',
      key: 'pricePerUnit',
      width: 120,
      render: (price) => (
        <span className="font-medium text-gray-900">
          {price?.toLocaleString('vi-VN')}đ
        </span>
      ),
      sorter: (a, b) => a.pricePerUnit - b.pricePerUnit,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEdit(record)}
            className="text-blue-600 hover:text-blue-700"
          />
          <Popconfirm
            title="Xóa nguyên liệu"
            description="Bạn có chắc chắn muốn xóa nguyên liệu này?"
            onConfirm={() => handleDelete(record.ingredientId)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true, loading: deleteLoading[record.ingredientId] }}
          >
            <Button
              type="text"
              icon={<Trash2 className="w-4 h-4" />}
              className="text-red-600 hover:text-red-700"
              loading={deleteLoading[record.ingredientId]}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Nguyên liệu</h1>
          <p className="text-gray-600">
            Quản lý danh sách nguyên liệu mà bạn cung cấp
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm nguyên liệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Thêm nguyên liệu
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <Table
            columns={columns}
            dataSource={filteredIngredients}
            rowKey="ingredientId"
            loading={loading}
            pagination={{
              total: filteredIngredients.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} nguyên liệu`,
            }}
            locale={{
              emptyText: (
                <div className="py-8 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có nguyên liệu nào</p>
                  <Button
                    type="link"
                    onClick={handleCreate}
                    className="text-blue-600"
                  >
                    Thêm nguyên liệu đầu tiên
                  </Button>
                </div>
              ),
            }}
          />
        </div>

        <Modal
          title={editingIngredient ? 'Chỉnh sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="mt-4"
          >
            <Form.Item
              label="Tên nguyên liệu"
              name="ingredientName"
              rules={[
                { required: true, message: 'Vui lòng nhập tên nguyên liệu' },
                { min: 2, message: 'Tên nguyên liệu phải có ít nhất 2 ký tự' }
              ]}
            >
              <Input
                placeholder="Nhập tên nguyên liệu"
                prefix={<Package className="w-4 h-4 text-gray-400" />}
              />
            </Form.Item>

            <Form.Item
              label="Mô tả"
              name="description"
              rules={[
                { required: true, message: 'Vui lòng nhập mô tả' }
              ]}
            >
              <Input.TextArea
                placeholder="Nhập mô tả chi tiết về nguyên liệu"
                rows={3}
              />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="Đơn vị"
                name="unit"
                rules={[
                  { required: true, message: 'Vui lòng nhập đơn vị' }
                ]}
              >
                <Input placeholder="VD: kg, lít, gói..." />
              </Form.Item>

              <Form.Item
                label="Giá/Đơn vị (VNĐ)"
                name="pricePerUnit"
                rules={[
                  { required: true, message: 'Vui lòng nhập giá' },
                  { type: 'number', min: 0, message: 'Giá phải lớn hơn 0' }
                ]}
              >
                <InputNumber
                  placeholder="Nhập giá"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  className="w-full"
                  min={0}
                />
              </Form.Item>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
                disabled={submitLoading}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-blue-600 hover:bg-blue-700"
                loading={submitLoading}
              >
                {editingIngredient ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default IngredientPage;