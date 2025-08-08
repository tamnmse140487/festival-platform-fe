import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, UtensilsCrossed, Coffee, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { festivalMenuServices } from '../../../services/festivalMenuServices';
import { menuItemServices } from '../../../services/menuItemServices';
import { formatPrice, getItemTypeLabel, getItemTypeIcon, getStatusBadge } from '../../../utils/helpers';

const AdminMenuTab = ({ festival }) => {
  const [menus, setMenus] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    loadMenus();
  }, [festival.festivalId]);

  useEffect(() => {
    if (selectedMenu) {
      loadMenuItems(selectedMenu.menuId);
    }
  }, [selectedMenu]);

  const loadMenus = async () => {
    try {
      setLoading(true);
      const response = await festivalMenuServices.get({ festivalId: festival.festivalId });
      const menusData = response.data || [];
      setMenus(menusData);
      if (menusData.length > 0) {
        setSelectedMenu(menusData[0]);
      }
    } catch (error) {
      console.error('Error loading menus:', error);
      toast.error('Không thể tải danh sách thực đơn');
    } finally {
      setLoading(false);
    }
  };

  const loadMenuItems = async (menuId) => {
    try {
      const response = await menuItemServices.get({ menuId });
      setMenuItems(response.data || []);
    } catch (error) {
      console.error('Error loading menu items:', error);
      toast.error('Không thể tải danh sách món ăn');
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.itemType === typeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.itemName?.localeCompare(b.itemName) || 0;
      case 'price_asc':
        return (a.minPrice || 0) - (b.minPrice || 0);
      case 'price_desc':
        return (b.maxPrice || 0) - (a.maxPrice || 0);
      case 'type':
        return a.itemType?.localeCompare(b.itemType) || 0;
      default:
        return 0;
    }
  });

  const getMenuStats = () => {
    const totalItems = menuItems.length;
    const activeItems = menuItems.filter(item => item.status === 'active').length;
    const inactiveItems = totalItems - activeItems;
    return {
      totalItems,
      activeItems,
      inactiveItems,
    };
  };

  const getTypeStats = () => {
    const types = ['food', 'beverage', 'dessert', 'snack'];
    return types.map(type => ({
      type,
      count: menuItems.filter(item => item.itemType === type).length,
      activeCount: menuItems.filter(item => item.itemType === type && item.status === 'active').length
    }));
  };

  const stats = getMenuStats();
  const typeStats = getTypeStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Đang tải thực đơn...</span>
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="text-center py-12">
        <UtensilsCrossed className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có thực đơn</h3>
        <p className="text-gray-600 mb-6">Lễ hội này chưa có thực đơn nào được tạo.</p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Tạo thực đơn mới
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Tổng món</p>
              <p className="text-2xl font-bold">{stats.totalItems}</p>
            </div>
            <UtensilsCrossed size={24} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Đang hoạt động</p>
              <p className="text-2xl font-bold">{stats.activeItems}</p>
            </div>
            <TrendingUp size={24} className="text-green-200" />
          </div>
        </div>

       
      </div>

      {menus.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Chọn thực đơn:</label>
            <select
              value={selectedMenu?.menuId || ''}
              onChange={(e) => {
                const menu = menus.find(m => m.menuId === parseInt(e.target.value));
                setSelectedMenu(menu);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {menus.map(menu => (
                <option key={menu.menuId} value={menu.menuId}>
                  {menu.menuName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {selectedMenu && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedMenu.menuName}</h3>
              {selectedMenu.description && (
                <p className="text-sm text-gray-600">{selectedMenu.description}</p>
              )}
            </div>

          </div>

          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm món ăn..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Tất cả loại</option>
                <option value="food">🍽️ Đồ ăn</option>
                <option value="beverage">🥤 Đồ uống</option>
                <option value="dessert">🍰 Tráng miệng</option>
                <option value="snack">🍿 Đồ ăn vặt</option>
              </select>

              <select
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Ngừng hoạt động</option>
              </select>

              <select
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Tên A-Z</option>
                <option value="price_asc">Giá thấp → cao</option>
                <option value="price_desc">Giá cao → thấp</option>
                <option value="type">Loại món</option>
              </select>

              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
                <Plus size={20} />
                Thêm món
              </button>
            </div>
          </div>

          <div className="mb-6 text-sm text-gray-600">
            Hiển thị <strong>{filteredItems.length}</strong> trong tổng số <strong>{menuItems.length}</strong> món
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <UtensilsCrossed size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy món nào</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm'
                  : 'Thực đơn này chưa có món ăn nào'}
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
                Thêm món đầu tiên
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div key={item.itemId} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">
                            {getItemTypeIcon(item.itemType)}
                          </span>
                          <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
                            {item.itemName}
                          </h3>
                        </div>
                        {item.description && (
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="ml-3">
                        {getStatusBadge(item.status, 'menuItem')}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Loại:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {getItemTypeLabel(item.itemType)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 p-3 bg-white rounded-lg border">
                      <div className="text-sm text-gray-600 mb-1">Khoảng giá</div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">
                          {formatPrice(item.minPrice || 0)}
                        </span>
                        <span className="text-gray-400">-</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatPrice(item.maxPrice || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 text-xs text-gray-500">
                      ID: {item.itemId} • Menu ID: {item.menuId}
                    </div>


                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-500" size={20} />
            Phân tích theo loại món
          </h3>

          <div className="space-y-4">
            {typeStats.map((typeStat) => {
              const percentage = stats.totalItems > 0 ? (typeStat.count / stats.totalItems * 100) : 0;

              return (
                <div key={typeStat.type}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span>{getItemTypeIcon(typeStat.type)}</span>
                      <span className="font-medium text-gray-900">
                        {getItemTypeLabel(typeStat.type)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({typeStat.activeCount}/{typeStat.count})
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {stats.totalItems === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Chưa có dữ liệu để phân tích</p>
            </div>
          )}
        </div>

       
      </div>
    </div>
  );
};

export default AdminMenuTab;