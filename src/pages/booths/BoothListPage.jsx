import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ShoppingCart, MapPin, Star, Calendar, Eye, Edit, CheckCircle, Clock, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mockBooths, mockMenuItems } from '../../data/mockData';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import { ROLE_NAME } from '../../utils/constants';

const BoothListPage = () => {
  const { user, hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredBooths = mockBooths.filter(booth => {
    const matchesSearch = booth.booth_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booth.group.group_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booth.status === statusFilter;
    const matchesType = typeFilter === 'all' || booth.booth_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewDetails = (booth) => {
    setSelectedBooth(booth);
    setShowDetailModal(true);
  };

  const getStatusStats = () => {
    const total = mockBooths.length;
    const approved = mockBooths.filter(b => b.status === 'approved').length;
    const pending = mockBooths.filter(b => b.status === 'pending').length;
    const rejected = mockBooths.filter(b => b.status === 'rejected').length;

    return { total, approved, pending, rejected };
  };

  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Gian hàng</h1>
          <p className="text-gray-600 mt-1">
            {hasRole([ROLE_NAME.SCHOOL_MANAGER])
              ? 'Quản lý và phê duyệt các gian hàng trong lễ hội.'
              : hasRole([ROLE_NAME.TEACHER])
                ? 'Theo dõi gian hàng của các nhóm được phân công.'
                : 'Quản lý gian hàng của nhóm bạn.'
            }
          </p>
        </div>

        {hasRole([ROLE_NAME.STUDENT]) && (
          <Button icon={<Plus size={20} />}>
            Đăng ký gian hàng
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <Card.Content>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng gian hàng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Từ chối</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      <Card>
        <Card.Content>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Tìm kiếm gian hàng..."
                  leftIcon={<Search size={20} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="rejected">Từ chối</option>
                </select>

                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">Tất cả loại</option>
                  <option value="food">Đồ ăn</option>
                  <option value="beverage">Đồ uống</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>
          </div>

          {filteredBooths.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy gian hàng nào</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                  : 'Chưa có gian hàng nào được đăng ký.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredBooths.map(booth => (
                <BoothCard
                  key={booth.id}
                  booth={booth}
                  onViewDetails={handleViewDetails}
                  hasManagePermission={hasRole([ROLE_NAME.SCHOOL_MANAGER, ROLE_NAME.TEACHER])}
                />
              ))}
            </div>
          )}
        </Card.Content>
      </Card>

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Chi tiết gian hàng"
        size="lg"
      >
        {selectedBooth && (
          <BoothDetailModal
            booth={selectedBooth}
            onClose={() => setShowDetailModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

const BoothCard = ({ booth, onViewDetails, hasManagePermission }) => {
  const getStatusBadge = (status) => {
    const badges = {
      'approved': {
        label: 'Đã duyệt',
        class: 'bg-green-100 text-green-800',
        icon: <CheckCircle size={14} />
      },
      'pending': {
        label: 'Chờ duyệt',
        class: 'bg-yellow-100 text-yellow-800',
        icon: <Clock size={14} />
      },
      'rejected': {
        label: 'Từ chối',
        class: 'bg-red-100 text-red-800',
        icon: <X size={14} />
      },
      'closed': {
        label: 'Đã đóng',
        class: 'bg-gray-100 text-gray-800',
        icon: <X size={14} />
      }
    };

    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.class}`}>
        {badge.icon}
        <span className="ml-1">{badge.label}</span>
      </span>
    );
  };

  const getTypeLabel = (type) => {
    const types = {
      'food': 'Đồ ăn',
      'beverage': 'Đồ uống',
      'other': 'Khác'
    };
    return types[type] || type;
  };

  return (
    <Card hover className="h-full">
      <Card.Content>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {booth.booth_name}
                </h3>
                {getStatusBadge(booth.status)}
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Nhóm:</strong> {booth.group.group_name}</p>
                <p><strong>Loại:</strong> {getTypeLabel(booth.booth_type)}</p>
                <div className="flex items-center">
                  <MapPin size={14} className="mr-1" />
                  <span>{booth.location.location_name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{booth.description}</p>

        {booth.status === 'approved' && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{booth.points_balance}</div>
              <div className="text-xs text-blue-800">Điểm tích lũy</div>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{booth.total_orders}</div>
              <div className="text-xs text-green-800">Đơn hàng</div>
            </div>

            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{booth.menu_items_count}</div>
              <div className="text-xs text-purple-800">Món ăn</div>
            </div>
          </div>
        )}

        {booth.status === 'approved' && booth.revenue > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Doanh thu</span>
              <span className="text-lg font-bold text-green-600">
                {booth.revenue.toLocaleString()}đ
              </span>
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => onViewDetails(booth)}
            icon={<Eye size={16} />}
          >
            Chi tiết
          </Button>
          {hasManagePermission && booth.status === 'pending' && (
            <Button
              size="sm"
              fullWidth
              icon={<CheckCircle size={16} />}
            >
              Duyệt
            </Button>
          )}
        </div>
      </Card.Content>
    </Card>
  );
};

const BoothDetailModal = ({ booth, onClose }) => {
  const [activeTab, setActiveTab] = useState('info');
  const boothMenuItems = mockMenuItems.filter(item => item.booth_id === booth.id);

  const tabs = [
    { id: 'info', label: 'Thông tin' },
    { id: 'menu', label: 'Thực đơn' },
    // { id: 'orders', label: 'Đơn hàng' },
    { id: 'stats', label: 'Thống kê' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
          <ShoppingCart className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{booth.booth_name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {booth.booth_type}
            </span>
            <span className={`px-2 py-1 text-xs rounded font-medium ${booth.status === 'approved' ? 'bg-green-100 text-green-800' :
                booth.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
              }`}>
              {booth.status === 'approved' ? 'Đã duyệt' :
                booth.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
            </span>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'info' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Tên gian hàng</label>
              <p className="text-gray-900">{booth.booth_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Loại gian hàng</label>
              <p className="text-gray-900">{booth.booth_type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Nhóm quản lý</label>
              <p className="text-gray-900">{booth.group.group_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Vị trí</label>
              <p className="text-gray-900">{booth.location.location_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Ngày đăng ký</label>
              <p className="text-gray-900">
                {new Date(booth.registration_date).toLocaleDateString('vi-VN')}
              </p>
            </div>
            {booth.approval_date && (
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày duyệt</label>
                <p className="text-gray-900">
                  {new Date(booth.approval_date).toLocaleDateString('vi-VN')}
                </p>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <label className="text-sm font-medium text-gray-500">Mô tả</label>
            <p className="text-gray-900 mt-1">{booth.description}</p>
          </div>
        </div>
      )}

      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-900">
              Thực đơn ({boothMenuItems.length} món)
            </h4>
            <Button size="sm">Thêm món</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boothMenuItems.map(item => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <img
                    src={item.image_url}
                    alt={item.item_name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{item.item_name}</h5>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-blue-600">
                        {item.price.toLocaleString()}đ
                      </span>
                      {item.rating > 0 && (
                        <div className="flex items-center">
                          <Star size={14} className="text-yellow-400 fill-current mr-1" />
                          <span className="text-sm">{item.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Đơn hàng gần đây</h4>
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Chưa có đơn hàng nào</p>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {booth.points_balance}
              </div>
              <div className="text-blue-800 font-medium">Điểm tích lũy</div>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {booth.total_orders}
              </div>
              <div className="text-green-800 font-medium">Tổng đơn hàng</div>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {booth.revenue.toLocaleString()}đ
              </div>
              <div className="text-purple-800 font-medium">Doanh thu</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Đóng
        </Button>
        <Button>
          Chỉnh sửa
        </Button>
      </div>
    </div>
  );
};

export default BoothListPage;