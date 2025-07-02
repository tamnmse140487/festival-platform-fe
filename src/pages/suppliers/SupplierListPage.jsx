import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Store, Star, Package, TrendingUp, Phone, Mail, Check, X, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supplierServices } from '../../services/supplierServices';
import { ingredientServices } from '../../services/ingredientServices';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { ROLE_NAME } from '../../utils/constants';
import { toast } from 'react-hot-toast';

const SupplierListPage = () => {
  const { hasRole } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingSupplier, setUpdatingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [supplierIngredients, setSupplierIngredients] = useState({});
  const [loadingIngredients, setLoadingIngredients] = useState(false);

  const categories = [
    { value: 'all', label: 'Tất cả danh mục' },
    { value: 'food', label: 'Thực phẩm & Đồ uống' },
    { value: 'decoration', label: 'Trang trí' },
    { value: 'sound', label: 'Âm thanh & Ánh sáng' },
    { value: 'entertainment', label: 'Giải trí' },
    { value: 'security', label: 'Bảo vệ' },
    { value: 'other', label: 'Khác' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ duyệt' },
    { value: 'approved', label: 'Đã duyệt' },
    { value: 'rejected', label: 'Từ chối' }
  ];

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierServices.get();
      setSuppliers(response.data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Không thể tải danh sách nhà cung cấp');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchIngredients = async (supplierId) => {
    if (supplierIngredients[supplierId]) {
      return supplierIngredients[supplierId];
    }

    try {
      setLoadingIngredients(true);
      const response = await ingredientServices.get({ supplierId });
      const ingredients = response.data || [];
      
      setSupplierIngredients(prev => ({
        ...prev,
        [supplierId]: ingredients
      }));
      
      return ingredients;
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      toast.error('Không thể tải danh sách nguyên liệu');
      return [];
    } finally {
      setLoadingIngredients(false);
    }
  };

  const handleStatusUpdate = async (supplierId, newStatus) => {
    try {
      setUpdatingSupplier(supplierId);
      await supplierServices.update({ 
        supplierId: supplierId, 
        status: newStatus 
      });
      
      setSuppliers(prev => prev.map(supplier => 
        supplier.supplierId === supplierId 
          ? { ...supplier, status: newStatus }
          : supplier
      ));
      
      toast.success(`Đã ${newStatus === 'approved' ? 'phê duyệt' : 'từ chối'} nhà cung cấp`);
    } catch (error) {
      console.error('Error updating supplier status:', error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setUpdatingSupplier(null);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'Chờ duyệt', 
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Clock size={14} />
        };
      case 'approved':
        return { 
          label: 'Đã duyệt', 
          color: 'bg-green-100 text-green-800',
          icon: <Check size={14} />
        };
      case 'rejected':
        return { 
          label: 'Từ chối', 
          color: 'bg-red-100 text-red-800',
          icon: <X size={14} />
        };
      default:
        return { 
          label: status, 
          color: 'bg-gray-100 text-gray-800',
          icon: null
        };
    }
  };

  const filteredSuppliers = suppliers
    .filter(supplier => {
      const matchesSearch = supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'companyName': 
          return a.companyName.localeCompare(b.companyName);
        case 'createdAt': 
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'rating': 
          return (b.rating || 0) - (a.rating || 0);
        case 'status':
          return a.status.localeCompare(b.status);
        default: 
          return 0;
      }
    });

  const handleViewDetails = async (supplier) => {
    setSelectedSupplier(supplier);
    setShowModal(true);
    await fetchIngredients(supplier.supplierId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Nhà cung cấp</h1>
          <p className="text-gray-600">
            {hasRole([ROLE_NAME.ADMIN, ROLE_NAME.SCHOOL_MANAGER])
              ? 'Quản lý và theo dõi các nhà cung cấp nguyên liệu.'
              : 'Xem thông tin các nhà cung cấp trong hệ thống.'
            }
          </p>
        </div>
      </div>

      <Card>
        <Card.Content>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Tìm kiếm tên công ty..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
            <select
              className="border rounded px-3 py-2"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="createdAt">Mới nhất</option>
              <option value="companyName">Tên A-Z</option>
              <option value="rating">Đánh giá cao</option>
              <option value="status">Trạng thái</option>
            </select>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map(supplier => (
                <SupplierCard
                  key={supplier.supplierId}
                  supplier={supplier}
                  onViewDetails={() => handleViewDetails(supplier)}
                  onStatusUpdate={handleStatusUpdate}
                  getStatusConfig={getStatusConfig}
                  updatingSupplier={updatingSupplier}
                  ingredients={supplierIngredients[supplier.supplierId] || []}
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

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Chi tiết nhà cung cấp"
        size="lg"
      >
        {selectedSupplier && (
          <SupplierDetailModal
            supplier={selectedSupplier}
            ingredients={supplierIngredients[selectedSupplier.supplierId] || []}
            loadingIngredients={loadingIngredients}
            onClose={() => setShowModal(false)}
            getStatusConfig={getStatusConfig}
          />
        )}
      </Modal>
    </div>
  );
};

const SupplierCard = ({ supplier, onViewDetails, onStatusUpdate, getStatusConfig, updatingSupplier, ingredients }) => {
  const { hasRole } = useAuth();
  const statusConfig = getStatusConfig(supplier.status);
  const isUpdating = updatingSupplier === supplier.supplierId;
  const ingredientCount = ingredients.length;

  return (
    <Card hover>
      <Card.Content>
        <div className="flex space-x-4 mb-4">
          <div className="w-14 h-14 bg-blue-100 rounded flex items-center justify-center">
            <Store className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{supplier.companyName}</h3>
            <p className="text-sm text-gray-500 capitalize">{supplier.category}</p>
            <div className="flex items-center mt-2 space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                {statusConfig.icon && <span className="mr-1">{statusConfig.icon}</span>}
                {statusConfig.label}
              </span>
              {ingredientCount > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Package className="w-3 h-3 mr-1" />
                  {ingredientCount} nguyên liệu
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 space-y-1 mb-4">
          <div><Phone className="inline h-4 w-4 mr-1 text-gray-400" />{supplier.contactInfo}</div>
          <div className="truncate"><Mail className="inline h-4 w-4 mr-1 text-gray-400" />{supplier.businessLicense}</div>
          <div className="text-xs text-gray-500">
            Đăng ký: {new Date(supplier.createdAt).toLocaleDateString('vi-VN')}
          </div>
        </div>

        <div className="space-y-2">
          <Button size="sm" variant="outline" fullWidth onClick={onViewDetails} icon={<Eye size={16} />}>
            Chi tiết
          </Button>
          
          {hasRole([ROLE_NAME.ADMIN]) && supplier.status === 'pending' && (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="success" 
                fullWidth 
                disabled={isUpdating}
                onClick={() => onStatusUpdate(supplier.supplierId, 'approved')}
                icon={isUpdating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Check size={16} />
                )}
              >
                {isUpdating ? 'Đang xử lý...' : 'Duyệt'}
              </Button>
              <Button 
                size="sm" 
                variant="danger" 
                fullWidth 
                disabled={isUpdating}
                onClick={() => onStatusUpdate(supplier.supplierId, 'rejected')}
                icon={isUpdating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <X size={16} />
                )}
              >
                {isUpdating ? 'Đang xử lý...' : 'Từ chối'}
              </Button>
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  );
};

const SupplierDetailModal = ({ supplier, ingredients, loadingIngredients, onClose, getStatusConfig }) => {
  const statusConfig = getStatusConfig(supplier.status);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900">{supplier.companyName}</h3>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
          {statusConfig.icon && <span className="mr-1">{statusConfig.icon}</span>}
          {statusConfig.label}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <p><strong>Danh mục:</strong> <span className="capitalize">{supplier.category}</span></p>
          <p><strong>Giấy phép KD:</strong> {supplier.businessLicense}</p>
          <p><strong>Địa chỉ:</strong> {supplier.address}</p>
          <p><strong>Liên hệ:</strong> {supplier.contactInfo}</p>
        </div>
        <div className="space-y-2">
          <p><strong>Đánh giá:</strong> {supplier.rating ? `${supplier.rating}/5` : 'Chưa có'}</p>
          <p><strong>Ngày đăng ký:</strong> {new Date(supplier.createdAt).toLocaleDateString('vi-VN')}</p>
          {supplier.updatedAt && (
            <p><strong>Cập nhật:</strong> {new Date(supplier.updatedAt).toLocaleDateString('vi-VN')}</p>
          )}
        </div>
      </div>

      {supplier.note && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-800 mb-2">Ghi chú</h4>
          <p className="text-sm text-gray-600">{supplier.note}</p>
        </div>
      )}

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-800">Danh sách nguyên liệu</h4>
          <span className="text-sm text-gray-500">
            {ingredients.length} nguyên liệu
          </span>
        </div>
        
        {loadingIngredients ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : ingredients.length > 0 ? (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {ingredients.map((ingredient) => (
              <div key={ingredient.ingredientId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{ingredient.ingredientName}</h5>
                  <p className="text-sm text-gray-600">{ingredient.description}</p>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-xs text-gray-500">
                      Đơn vị: {ingredient.unit}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      Ngày tạo: {new Date(ingredient.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">
                    {ingredient.pricePerUnit?.toLocaleString('vi-VN')}đ
                  </div>
                  <div className="text-sm text-gray-500">/{ingredient.unit}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>Nhà cung cấp chưa có nguyên liệu nào</p>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Đóng</Button>
      </div>
    </div>
  );
};

export default SupplierListPage;