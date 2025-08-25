import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, MapPin, Calendar, Users, Search, Grid, List, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { festivalServices } from '../../services/festivalServices';
import { festivalSchoolServices } from '../../services/festivalSchoolServices';
import { imageServices } from '../../services/imageServices';
import { FESTIVAL_APPROVAL_STATUS, FESTIVAL_STATUS, ROLE_NAME } from '../../utils/constants';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import AdminFestivalList from '../festivals/admin/AdminFestivalList';
import { convertToVietnamTimeWithFormat } from '../../utils/formatters';

const FestivalListPage = () => {
  const { user, hasRole } = useAuth();

  if (hasRole([ROLE_NAME.ADMIN])) {
    return <AdminFestivalList />;
  }

  return <UserFestivalList user={user} hasRole={hasRole} />;
};

const UserFestivalList = ({ user, hasRole }) => {
  const [festivals, setFestivals] = useState([]);
  const [festivalImages, setFestivalImages] = useState({});
  const [approvalStatuses, setApprovalStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, festival: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadFestivals();
  }, []);

  const loadFestivals = async () => {
    try {
      setLoading(true);
      const params = hasRole([ROLE_NAME.SCHOOL_MANAGER])
        ? { schoolId: user.schoolId }
        : {};

      const response = await festivalServices.get(params);
      const festivalsData = response.data || [];
      setFestivals(festivalsData);

      await Promise.all([
        loadFestivalImages(festivalsData),
        loadApprovalStatuses(festivalsData)
      ]);
    } catch (error) {
      console.error('Error loading festivals:', error);
      toast.error('Không thể tải danh sách lễ hội');
    } finally {
      setLoading(false);
    }
  };

  const loadFestivalImages = async (festivalsData) => {
    const imagePromises = festivalsData.map(async (festival) => {
      try {
        const response = await imageServices.get({ festivalId: festival.festivalId });
        return {
          festivalId: festival.festivalId,
          images: response.data || []
        };
      } catch (error) {
        console.error(`Error loading images for festival ${festival.festivalId}:`, error);
        return {
          festivalId: festival.festivalId,
          images: []
        };
      }
    });

    const imageResults = await Promise.all(imagePromises);
    const imagesMap = {};
    imageResults.forEach(result => {
      imagesMap[result.festivalId] = result.images;
    });
    setFestivalImages(imagesMap);
  };

  const loadApprovalStatuses = async (festivalsData) => {
    const statusPromises = festivalsData.map(async (festival) => {
      try {
        const response = await festivalSchoolServices.get({ festivalId: festival.festivalId });
        return {
          festivalId: festival.festivalId,
          approvalData: response.data && response.data.length > 0 ? response.data[0] : null
        };
      } catch (error) {
        console.error(`Error loading approval status for festival ${festival.festivalId}:`, error);
        return {
          festivalId: festival.festivalId,
          approvalData: null
        };
      }
    });

    const statusResults = await Promise.all(statusPromises);
    const statusMap = {};
    statusResults.forEach(result => {
      statusMap[result.festivalId] = result.approvalData;
    });
    setApprovalStatuses(statusMap);
  };

  const getFestivalImage = (festivalId) => {
    const images = festivalImages[festivalId] || [];
    return images.length > 0 ? images[0].imageUrl : '/api/placeholder/400/300';
  };

  const getApprovalStatus = (festivalId) => {
    return approvalStatuses[festivalId];
  };

  const handleDelete = async () => {
    if (!deleteModal.festival) return;

    try {
      setIsDeleting(true);
      await festivalServices.delete({ id: deleteModal.festival.festivalId });
      toast.success('Xóa lễ hội thành công');
      setDeleteModal({ isOpen: false, festival: null });
      loadFestivals();
    } catch (error) {
      console.error('Error deleting festival:', error);
      toast.error('Không thể xóa lễ hội');
    } finally {
      setIsDeleting(false);
    }
  };

  const shouldFilterApprovedOnly = hasRole([ROLE_NAME.USER, ROLE_NAME.STUDENT, ROLE_NAME.TEACHER]);

  const filteredFestivals = festivals.filter(festival => {
    const matchesSearch = festival.festivalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      festival.theme?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      festival.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || festival.status === statusFilter;

    if (shouldFilterApprovedOnly) {
      const approvalData = getApprovalStatus(festival.festivalId);

      const isApproved = approvalData && approvalData.status === FESTIVAL_APPROVAL_STATUS.APPROVED;

      const hasValidStatus = [
        FESTIVAL_STATUS.PUBLISHED,
        FESTIVAL_STATUS.ONGOING,
        FESTIVAL_STATUS.COMPLETED
      ].includes(festival.status);

      if (!isApproved || !hasValidStatus) {
        return false;
      }
    }

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'name':
        return a.festivalName?.localeCompare(b.festivalName);
      case 'date':
        return new Date(a.startDate) - new Date(b.startDate);
      default:
        return 0;
    }
  });

  const getStatusBadge = (status) => {
    const badges = {
      'draft': { label: 'Bản nháp', class: 'bg-gray-100 text-gray-800' },
      'published': { label: 'Đã công bố', class: 'bg-green-100 text-green-800' },
      'ongoing': { label: 'Đang diễn ra', class: 'bg-blue-100 text-blue-800' },
      'completed': { label: 'Đã kết thúc', class: 'bg-purple-100 text-purple-800' },
      'cancelled': { label: 'Đã hủy', class: 'bg-red-100 text-red-800' }
    };

    const badge = badges[status] || badges.draft;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.class}`}>
        {badge.label}
      </span>
    );
  };

  const getApprovalBadge = (approvalData) => {
    if (!approvalData) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Chưa đăng ký
        </span>
      );
    }

    const badges = {
      'pending': { label: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-800' },
      'approved': { label: 'Đã duyệt', class: 'bg-green-100 text-green-800' },
      'rejected': { label: 'Đã từ chối', class: 'bg-red-100 text-red-800' }
    };

    const badge = badges[approvalData.status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.class}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Lễ hội</h1>
          <p className="text-gray-600 mt-1">
            {hasRole([ROLE_NAME.SCHOOL_MANAGER])
              ? 'Tạo và quản lý các lễ hội của trường bạn.'
              : 'Khám phá và tham gia các lễ hội thú vị.'
            }
          </p>
        </div>

        {hasRole([ROLE_NAME.SCHOOL_MANAGER]) && (
          <Link
            to="/app/festivals/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors font-medium"
          >
            <Plus size={20} />
            <span>Tạo lễ hội mới</span>
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex-1 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm lễ hội..."
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
                {!shouldFilterApprovedOnly && <option value="draft">Bản nháp</option>}
                <option value="published">Đã công bố</option>
                <option value="ongoing">Đang diễn ra</option>
                <option value="completed">Đã kết thúc</option>
                {!shouldFilterApprovedOnly && <option value="cancelled">Đã hủy</option>}
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
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {filteredFestivals.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy lễ hội nào</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                : 'Chưa có lễ hội nào được tạo.'
              }
            </p>
            {hasRole([ROLE_NAME.SCHOOL_MANAGER]) && !searchTerm && statusFilter === 'all' && (
              <Link
                to="/app/festivals/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Tạo lễ hội đầu tiên
              </Link>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredFestivals.map(festival => (
              viewMode === 'grid' ? (
                <FestivalCard
                  key={festival.festivalId}
                  festival={festival}
                  user={user}
                  hasRole={hasRole}
                  onDelete={(festival) => setDeleteModal({ isOpen: true, festival })}
                  formatDate={convertToVietnamTimeWithFormat}
                  getStatusBadge={getStatusBadge}
                  getApprovalBadge={getApprovalBadge}
                  getFestivalImage={getFestivalImage}
                  getApprovalStatus={getApprovalStatus}
                />
              ) : (
                <FestivalListItem
                  key={festival.festivalId}
                  festival={festival}
                  user={user}
                  hasRole={hasRole}
                  onDelete={(festival) => setDeleteModal({ isOpen: true, festival })}
                  formatDate={convertToVietnamTimeWithFormat}
                  getStatusBadge={getStatusBadge}
                  getApprovalBadge={getApprovalBadge}
                  getFestivalImage={getFestivalImage}
                  getApprovalStatus={getApprovalStatus}
                />
              )
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, festival: null })}
        title="Xác nhận xóa lễ hội"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Bạn có chắc chắn muốn xóa lễ hội "{deleteModal.festival?.festivalName}" không?
            Hành động này không thể hoàn tác.
          </p>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setDeleteModal({ isOpen: false, festival: null })}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              fullWidth
              loading={isDeleting}
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa lễ hội
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const FestivalCard = ({ festival, user, hasRole, onDelete, formatDate, getStatusBadge, getApprovalBadge, getFestivalImage, getApprovalStatus }) => {
  const approvalData = getApprovalStatus(festival.festivalId);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={getFestivalImage(festival.festivalId)}
          alt={festival.festivalName}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = '/api/placeholder/400/300';
          }}
        />
        <div className="absolute top-4 left-4 ">
          {getStatusBadge(festival.status)}

        </div>
        <div className="absolute top-4 right-4 ">
          {getApprovalBadge(approvalData)}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {festival.festivalName}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{festival.theme}</p>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <MapPin size={16} className="mr-2 flex-shrink-0" />
            <span className="truncate">{festival.location}</span>
          </div>
          <div className="flex items-center">
            <Calendar size={16} className="mr-2 flex-shrink-0" />
            <span>{convertToVietnamTimeWithFormat(festival.startDate)} - {convertToVietnamTimeWithFormat(festival.endDate)}</span>
          </div>
        </div>

        <div className="flex justify-between text-sm text-gray-600 mb-4 pt-4 border-t border-gray-200">
          <span>{festival.maxFoodBooths || 0} gian ăn</span>
          <span>{festival.maxBeverageBooths || 0} gian uống</span>
        </div>

        {approvalData && approvalData.rejectReason && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800 mb-1">Lý do từ chối:</p>
            <p className="text-sm text-red-700">{approvalData.rejectReason}</p>
          </div>
        )}

        <div className="flex space-x-2">
          <Link
            to={`/app/festivals/${festival.festivalId}`}
            className="flex-1 bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-center font-medium"
          >
            <Eye size={16} className="inline mr-1" />
            Xem chi tiết
          </Link>
          {hasRole([ROLE_NAME.SCHOOL_MANAGER]) && festival.status === FESTIVAL_STATUS.DRAFT && (
            <>
              <Link
                to={`/app/festivals/${festival.festivalId}/edit`}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit size={16} />
              </Link>
              <button
                onClick={() => onDelete(festival)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const FestivalListItem = ({ festival, user, hasRole, onDelete, formatDate, getStatusBadge, getApprovalBadge, getFestivalImage, getApprovalStatus }) => {
  const approvalData = getApprovalStatus(festival.festivalId);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-start space-x-4">
        <img
          src={getFestivalImage(festival.festivalId)}
          alt={festival.festivalName}
          className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
          onError={(e) => {
            e.target.src = '/api/placeholder/400/300';
          }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{festival.festivalName}</h3>
              <p className="text-gray-600 mb-2">{festival.theme}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                <span className="flex items-center">
                  <MapPin size={14} className="mr-1" />
                  {festival.location}
                </span>
                <span className="flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {convertToVietnamTimeWithFormat(festival.startDate)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {getStatusBadge(festival.status)}
                {getApprovalBadge(approvalData)}
              </div>

              {approvalData && approvalData.rejectReason && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-xs font-medium text-red-800">Lý do từ chối:</p>
                  <p className="text-xs text-red-700">{approvalData.rejectReason}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-2 ml-4">
              <Link
                to={`/app/festivals/${festival.festivalId}`}
                className="bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >
                <Eye size={16} className="inline mr-1" />
                Xem
              </Link>
              {hasRole([ROLE_NAME.SCHOOL_MANAGER]) && festival.status === FESTIVAL_STATUS.DRAFT && (
                <>
                  <Link
                    to={`/app/festivals/${festival.festivalId}/edit`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={() => onDelete(festival)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FestivalListPage;