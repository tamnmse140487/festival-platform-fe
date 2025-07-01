import React, { useState } from 'react';
import { Plus, Search, Eye, Store, Star, Package, TrendingUp, Phone, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mockSuppliers, mockIngredients } from '../../data/mockData';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';

const SupplierListPage = () => {
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const categories = [
    { value: 'all', label: 'Tất cả danh mục' },
    { value: 'Rau củ quả tươi', label: 'Rau củ quả tươi' },
    { value: 'Gia vị và đồ ướp', label: 'Gia vị và đồ ướp' },
    { value: 'Thịt tươi sống', label: 'Thịt tươi sống' },
    { value: 'Đồ khô', label: 'Đồ khô' },
    { value: 'Gia công', label: 'Thực phẩm gia công' }
  ];

  const filteredSuppliers = mockSuppliers
    .filter(supplier => {
      const matchesSearch = supplier.company_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'name': return a.company_name.localeCompare(b.company_name);
        case 'orders': return b.total_orders - a.total_orders;
        case 'ingredients': return b.total_ingredients - a.total_ingredients;
        default: return 0;
      }
    });

  const handleViewDetails = (supplier) => {
    setSelectedSupplier(supplier);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Nhà cung cấp</h1>
          <p className="text-gray-600">
            {hasRole(['admin', 'school_manager'])
              ? 'Quản lý và theo dõi các nhà cung cấp nguyên liệu.'
              : 'Xem thông tin các nhà cung cấp trong hệ thống.'
            }
          </p>
        </div>
        {hasRole(['admin', 'school_manager']) && (
          <Button icon={<Plus size={20} />}>Thêm nhà cung cấp</Button>
        )}
      </div>

      {/* Bộ lọc */}
      <Card>
        <Card.Content>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Tìm kiếm..."
              leftIcon={<Search size={20} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="border rounded px-3 py-2"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <select
              className="border rounded px-3 py-2"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="rating">Đánh giá cao</option>
              <option value="name">Tên A-Z</option>
              <option value="orders">Nhiều đơn hàng</option>
              <option value="ingredients">Nhiều nguyên liệu</option>
            </select>
          </div>

          {/* Kết quả */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map(supplier => (
                <SupplierCard
                  key={supplier.id}
                  supplier={supplier}
                  onViewDetails={() => handleViewDetails(supplier)}
                  canManage={hasRole(['admin', 'school_manager'])}
                />
              ))
            ) : (
              <div className="text-center col-span-full py-10 text-gray-500">
                Không tìm thấy nhà cung cấp phù hợp.
              </div>
            )}
          </div>
        </Card.Content>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Chi tiết nhà cung cấp"
        size="lg"
      >
        {selectedSupplier && (
          <SupplierDetailModal
            supplier={selectedSupplier}
            onClose={() => setShowModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

const SupplierCard = ({ supplier, onViewDetails, canManage }) => {
  const ingredients = mockIngredients.filter(ing => ing.supplier_id === supplier.id);

  return (
    <Card hover>
      <Card.Content>
        <div className="flex space-x-4 mb-4">
          <div className="w-14 h-14 bg-blue-100 rounded flex items-center justify-center">
            <Store className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{supplier.company_name}</h3>
            <p className="text-sm text-gray-500">{supplier.category}</p>
            <div className="flex text-xs text-gray-500 mt-2 space-x-4">
              <span><Star className="inline h-3 w-3 text-yellow-400 mr-1" />{supplier.rating}</span>
              <span><Package className="inline h-3 w-3 mr-1" />{supplier.total_ingredients} nguyên liệu</span>
              <span><TrendingUp className="inline h-3 w-3 mr-1" />{supplier.total_orders} đơn hàng</span>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 space-y-1 mb-4">
          <div><Phone className="inline h-4 w-4 mr-1 text-gray-400" />{supplier.account?.phone_number}</div>
          <div><Mail className="inline h-4 w-4 mr-1 text-gray-400" />{supplier.account?.email}</div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" fullWidth onClick={onViewDetails} icon={<Eye size={16} />}>
            Chi tiết
          </Button>
          {canManage && <Button size="sm" fullWidth>Quản lý</Button>}
        </div>
      </Card.Content>
    </Card>
  );
};

const SupplierDetailModal = ({ supplier, onClose }) => {
  const ingredients = mockIngredients.filter(ing => ing.supplier_id === supplier.id);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{supplier.company_name}</h3>
      <div className="text-sm space-y-1">
        <p><strong>Danh mục:</strong> {supplier.category}</p>
        <p><strong>Đánh giá:</strong> {supplier.rating}/5</p>
        <p><strong>Địa chỉ:</strong> {supplier.address}</p>
      </div>
      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-800 mb-2">Nguyên liệu</h4>
        {ingredients.length === 0 ? (
          <p className="text-sm text-gray-500">Không có nguyên liệu.</p>
        ) : (
          <ul className="space-y-2">
            {ingredients.map(ing => (
              <li key={ing.id} className="flex justify-between">
                <span>{ing.ingredient_name}</span>
                <span>{ing.price_per_unit.toLocaleString()}đ/{ing.unit}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex justify-end pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Đóng</Button>
      </div>
    </div>
  );
};

export default SupplierListPage;
