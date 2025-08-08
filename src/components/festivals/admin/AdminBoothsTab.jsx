import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Store, Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { boothServices } from '../../../services/boothServices';
import { studentGroupServices } from '../../../services/studentGroupServices';
import { convertToVietnamTimeWithFormat } from '../../../utils/formatters';
import { getStatusBadge } from '../../../utils/helpers';

const AdminBoothsTab = ({ festival }) => {
  const [booths, setBooths] = useState([]);
  const [groups, setGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    loadBooths();
  }, [festival.festivalId]);

  const loadBooths = async () => {
    try {
      setLoading(true);
      const response = await boothServices.get({ festivalId: festival.festivalId });
      const boothsData = response.data || [];
      setBooths(boothsData);

      const groupIds = [...new Set(boothsData.map(booth => booth.groupId).filter(Boolean))];
      const groupsData = {};

      await Promise.all(
        groupIds.map(async (groupId) => {
          try {
            const groupResponse = await studentGroupServices.get({ groupId });
            if (groupResponse.data && groupResponse.data.length > 0) {
              groupsData[groupId] = groupResponse.data[0];
            }
          } catch (error) {
            console.error(`Error loading group ${groupId}:`, error);
          }
        })
      );

      setGroups(groupsData);
    } catch (error) {
      console.error('Error loading booths:', error);
      toast.error('Không thể tải danh sách gian hàng');
    } finally {
      setLoading(false);
    }
  };

  const getBoothStats = () => {
    const total = booths.length;
    const pending = booths.filter(booth => booth.status === 'pending').length;
    const approved = booths.filter(booth => booth.status === 'approved').length;
    const rejected = booths.filter(booth => booth.status === 'rejected').length;

    return { total, pending, approved, rejected };
  };

  const filteredBooths = booths.filter(booth => {
    const group = groups[booth.groupId];
    const matchesSearch = booth.boothName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booth.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group?.groupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group?.className?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || booth.status === statusFilter;
    const matchesType = typeFilter === 'all' || booth.boothType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.boothName?.localeCompare(b.boothName) || 0;
      case 'status':
        return a.status?.localeCompare(b.status) || 0;
      case 'date':
        return new Date(a.registrationDate) - new Date(b.registrationDate);
      case 'group':
        const groupA = groups[a.groupId]?.groupName || '';
        const groupB = groups[b.groupId]?.groupName || '';
        return groupA.localeCompare(groupB);
      default:
        return 0;
    }
  });

  const stats = getBoothStats();

  const statsCards = [
    {
      title: 'Tổng gian hàng',
      value: stats.total,
      icon: Store,
      color: 'blue'
    },
    {
      title: 'Chờ duyệt',
      value: stats.pending,
      icon: Clock,
      color: 'yellow'
    },
    {
      title: 'Đã duyệt',
      value: stats.approved,
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Đã từ chối',
      value: stats.rejected,
      icon: AlertCircle,
      color: 'red'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Đang tải danh sách gian hàng...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600 border-blue-200',
            yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
            green: 'bg-green-50 text-green-600 border-green-200',
            red: 'bg-red-50 text-red-600 border-red-200'
          };

          return (
            <div key={index} className={`p-4 rounded-lg border ${colorClasses[stat.color]}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm gian hàng, nhóm sinh viên..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Đã từ chối</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Tất cả loại</option>
              <option value="food">Đồ ăn</option>
              <option value="beverage">Đồ uống</option>
              <option value="mixed">Hỗn hợp</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Tên A-Z</option>
              <option value="status">Trạng thái</option>
              <option value="date">Ngày đăng ký</option>
              <option value="group">Nhóm</option>
            </select>

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Plus size={16} />
              <span>Thêm gian hàng</span>
            </button>
          </div>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          Hiển thị <strong>{filteredBooths.length}</strong> trong tổng số <strong>{booths.length}</strong> gian hàng
        </div>

        {filteredBooths.length === 0 ? (
          <div className="text-center py-12">
            <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy gian hàng nào</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                : 'Chưa có gian hàng nào được đăng ký.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooths.map(booth => {
              const group = groups[booth.groupId];

              return (
                <div key={booth.boothId} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{booth.boothName}</h3>
                        <p className="text-sm text-gray-500">
                          {booth.boothType} • ID: {booth.boothId}
                        </p>
                      </div>
                      <div className="ml-2">
                        {getStatusBadge(booth.status, 'booth')}
                      </div>
                    </div>

                    {booth.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {booth.description}
                      </p>
                    )}
                  </div>

                  <div className="p-4">
                    {group ? (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Thông tin nhóm</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tên nhóm:</span>
                            <span className="font-medium">{group.groupName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Lớp:</span>
                            <span className="font-medium">{group.className}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Group ID:</span>
                            <span className="font-mono text-xs">{booth.groupId}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                          <AlertCircle size={16} className="text-yellow-600 mr-2" />
                          <span className="text-sm text-yellow-800">Không tìm thấy thông tin nhóm</span>
                        </div>
                      </div>
                    )}

                    <div className="mb-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày đăng ký:</span>
                        <span className="text-gray-900">
                          {convertToVietnamTimeWithFormat(booth.registrationDate)}
                        </span>
                      </div>

                      {booth.approvalDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ngày duyệt:</span>
                          <span className="text-gray-900">
                            {convertToVietnamTimeWithFormat(booth.approvalDate)}
                          </span>
                        </div>
                      )}

                      {booth.locationId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vị trí:</span>
                          <span className="font-mono text-xs">{booth.locationId}</span>
                        </div>
                      )}

                      {booth.pointsBalance !== null && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Điểm:</span>
                          <span className="font-medium text-blue-600">{booth.pointsBalance}</span>
                        </div>
                      )}
                    </div>

                    {booth.rejectionReason && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <h5 className="text-sm font-medium text-red-800 mb-1">Lý do từ chối:</h5>
                        <p className="text-sm text-red-700">{booth.rejectionReason}</p>
                      </div>
                    )}

                    {booth.note && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h5 className="text-sm font-medium text-blue-800 mb-1">Ghi chú:</h5>
                        <p className="text-sm text-blue-700">{booth.note}</p>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                        <Eye size={16} />
                        Chi tiết
                      </button>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="text-blue-500" size={20} />
            Thống kê theo trạng thái
          </h3>

          <div className="space-y-4">
            {[
              { status: 'pending', label: 'Chờ duyệt', count: stats.pending, color: 'bg-yellow-500' },
              { status: 'approved', label: 'Đã duyệt', count: stats.approved, color: 'bg-green-500' },
              { status: 'rejected', label: 'Đã từ chối', count: stats.rejected, color: 'bg-red-500' }
            ].map(item => {
              const percentage = stats.total > 0 ? (item.count / stats.total * 100) : 0;

              return (
                <div key={item.status} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-gray-700">
                    {item.label}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                    <div
                      className={`h-4 rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                      {item.count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {stats.total === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Chưa có dữ liệu để hiển thị</p>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="text-orange-500" size={20} />
            Cảnh báo & Thông báo
          </h3>

          <div className="space-y-3">
            {stats.pending > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock size={16} className="text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Có gian hàng chờ duyệt</p>
                  <p className="text-xs text-yellow-600">
                    {stats.pending} gian hàng đang chờ được duyệt
                  </p>
                </div>
              </div>
            )}

            {stats.rejected > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={16} className="text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Có gian hàng bị từ chối</p>
                  <p className="text-xs text-red-600">
                    {stats.rejected} gian hàng đã bị từ chối
                  </p>
                </div>
              </div>
            )}

            {stats.pending === 0 && stats.rejected === 0 && stats.total > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle size={16} className="text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">Tất cả đều ổn</p>
                  <p className="text-xs text-green-600">
                    Không có cảnh báo nào cần chú ý
                  </p>
                </div>
              </div>
            )}

            {stats.total === 0 && (
              <div className="flex items-start space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <Store size={16} className="text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Chưa có gian hàng</p>
                  <p className="text-xs text-gray-600">
                    Lễ hội này chưa có gian hàng nào đăng ký
                  </p>
                </div>
              </div>
            )}
          </div>

          {stats.total > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Thống kê nhanh</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng gian hàng:</span>
                  <span className="font-medium">{stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tỷ lệ duyệt:</span>
                  <span className="font-medium text-green-600">
                    {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tỷ lệ từ chối:</span>
                  <span className="font-medium text-red-600">
                    {stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBoothsTab;