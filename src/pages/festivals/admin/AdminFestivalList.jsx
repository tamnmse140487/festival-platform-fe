import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Search, Calendar, MapPin, Users, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { festivalServices } from '../../../services/festivalServices';
import { festivalSchoolServices } from '../../../services/festivalSchoolServices';
import { schoolServices } from '../../../services/schoolServices';
import { convertToVietnamTimeWithFormat } from '../../../utils/formatters';
import { getStatusBadge, calculateFestivalStats } from '../../../utils/helpers';

const AdminFestivalList = () => {
  const [festivals, setFestivals] = useState([]);
  const [festivalSchools, setFestivalSchools] = useState([]);
  const [schools, setSchools] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [festivalsResponse, festivalSchoolsResponse] = await Promise.all([
        festivalServices.get({pageSize: 50}),
        festivalSchoolServices.get({})
      ]);

      const festivalsData = festivalsResponse.data || [];
      const festivalSchoolsData = festivalSchoolsResponse.data || [];

      setFestivals(festivalsData);
      setFestivalSchools(festivalSchoolsData);

      const schoolIds = [...new Set(festivalSchoolsData.map(fs => fs.schoolId).filter(Boolean))];

      const schoolsData = {};
      await Promise.all(
        schoolIds.map(async (schoolId) => {
          try {
            const schoolResponse = await schoolServices.get({ id: schoolId });
            if (schoolResponse.data && schoolResponse.data.length > 0) {
              schoolsData[schoolId] = schoolResponse.data[0];
            }
          } catch (error) {
            console.error(`Error loading school ${schoolId}:`, error);
          }
        })
      );

      setSchools(schoolsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Không thể tải danh sách lễ hội');
    } finally {
      setLoading(false);
    }
  };

  const getEnhancedFestivals = () => {
    return festivals.map(festival => {
      const festivalSchool = festivalSchools.find(fs => fs.festivalId === festival.festivalId);
      const school = festivalSchool ? schools[festivalSchool.schoolId] : null;
      const stats = calculateFestivalStats(festival);

      return {
        ...festival,
        festivalSchool,
        school,
        approvalStatus: festivalSchool?.status || 'no_registration',
        stats
      };
    });
  };

  const filteredFestivals = getEnhancedFestivals().filter(festival => {
    const matchesSearch = festival.festivalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      festival.theme?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      festival.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      festival.school?.schoolName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || festival.status === statusFilter;
    const matchesApproval = approvalFilter === 'all' || festival.approvalStatus === approvalFilter;

    return matchesSearch && matchesStatus && matchesApproval;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'name':
        return a.festivalName?.localeCompare(b.festivalName) || 0;
      case 'date':
        return new Date(a.startDate) - new Date(b.startDate);
      case 'school':
        return a.school?.schoolName?.localeCompare(b.school?.schoolName) || 0;
      default:
        return 0;
    }
  });

  const getApprovalStats = () => {
    const enhanced = getEnhancedFestivals();
    return {
      pending: enhanced.filter(f => f.approvalStatus === 'pending').length,
      approved: enhanced.filter(f => f.approvalStatus === 'approved').length,
      rejected: enhanced.filter(f => f.approvalStatus === 'rejected').length,
      noRegistration: enhanced.filter(f => f.approvalStatus === 'no_registration').length
    };
  };

  const approvalStats = getApprovalStats();

  const totalPages = Math.ceil(filteredFestivals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFestivals = filteredFestivals.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Đang tải danh sách lễ hội...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Lễ hội</h1>
          <p className="text-gray-600 mt-1">
            Xem và quản lý tất cả lễ hội trong hệ thống
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex-1 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên lễ hội, chủ đề, địa điểm, trường..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <option value="draft">Nháp</option>
                <option value="published">Đã công bố</option>
                <option value="cancelled">Đã hủy</option>
              </select>

              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={approvalFilter}
                onChange={(e) => setApprovalFilter(e.target.value)}
              >
                <option value="all">Tất cả kiểm duyệt</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Đã từ chối</option>
                <option value="no_registration">Chưa đăng ký</option>
              </select>

              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="name">Tên A-Z</option>
                <option value="date">Ngày diễn ra</option>
                <option value="school">Trường A-Z</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Tổng: {filteredFestivals.length} lễ hội
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">
              {approvalStats.pending}
            </div>
            <div className="text-sm text-yellow-800">Chờ duyệt</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {approvalStats.approved}
            </div>
            <div className="text-sm text-green-800">Đã duyệt</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600">
              {approvalStats.rejected}
            </div>
            <div className="text-sm text-red-800">Đã từ chối</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-600">
              {approvalStats.noRegistration}
            </div>
            <div className="text-sm text-gray-800">Chưa đăng ký</div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lễ hội
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trường
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Địa điểm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gian hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kiểm duyệt
                </th>

              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedFestivals.map((festival) => (
                <tr key={festival.festivalId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/app/festivals/admin/${festival.festivalId}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg inline-flex items-center space-x-1 transition-colors"
                    >
                      <Eye size={14} />
                      <span>Chi tiết</span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {festival.festivalName}
                    </div>
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {festival.theme}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      ID: {festival.festivalId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {festival.school ? (
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={festival.school.logoUrl || "/api/placeholder/40/40"}
                            alt={festival.school.schoolName}
                          />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {festival.school.schoolName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {festival.festivalSchool?.schoolId}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">Chưa có trường đăng ký</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center mb-1">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        {convertToVietnamTimeWithFormat(festival.startDate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        đến {convertToVietnamTimeWithFormat(festival.endDate)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin size={14} className="mr-1 text-gray-400" />
                      <span className="max-w-xs truncate">{festival.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center space-x-2 mb-1">
                        <Store size={14} className="text-gray-400" />
                        <span className="text-blue-600">{festival.maxFoodBooths || 0} ăn</span>
                        <span className="text-green-600">{festival.maxBeverageBooths || 0} uống</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Đã đăng ký: {festival.stats.registeredBooths}/{festival.stats.totalBooths}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(festival.status, 'festival')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {festival.approvalStatus === 'no_registration' ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Chưa đăng ký
                      </span>
                    ) : (
                      getStatusBadge(festival.approvalStatus, 'approval')
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Hiển thị {startIndex + 1} đến {Math.min(startIndex + itemsPerPage, filteredFestivals.length)} trong {filteredFestivals.length} kết quả
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex space-x-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded-lg ${currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {filteredFestivals.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy lễ hội nào</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || approvalFilter !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                : 'Chưa có lễ hội nào trong hệ thống.'
              }
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê tổng quan</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {festivals.length}
            </div>
            <div className="text-sm text-gray-600">Tổng số lễ hội</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {festivals.filter(f => f.status === 'published').length}
            </div>
            <div className="text-sm text-gray-600">Đã công bố</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              {festivals.filter(f => f.status === 'draft').length}
            </div>
            <div className="text-sm text-gray-600">Đang soạn thảo</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {Object.keys(schools).length}
            </div>
            <div className="text-sm text-gray-600">Trường tham gia</div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-4">Trạng thái kiểm duyệt</h4>
          <div className="space-y-3">
            {[
              { label: 'Chờ duyệt', value: approvalStats.pending, color: 'bg-yellow-500' },
              { label: 'Đã duyệt', value: approvalStats.approved, color: 'bg-green-500' },
              { label: 'Đã từ chối', value: approvalStats.rejected, color: 'bg-red-500' },
              { label: 'Chưa đăng ký', value: approvalStats.noRegistration, color: 'bg-gray-500' }
            ].map(item => {
              const total = festivals.length;
              const percentage = total > 0 ? (item.value / total * 100) : 0;

              return (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-gray-700">
                    {item.label}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                    <div
                      className={`h-4 rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                      {item.value} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFestivalList;