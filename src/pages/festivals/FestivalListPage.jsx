import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, MapPin, Calendar, Users, Search, Filter, Grid, List } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mockFestivals } from '../../data/mockData';

const FestivalListPage = () => {
  const { user, hasRole } = useAuth();
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredFestivals = mockFestivals.filter(festival => {
    const matchesSearch = festival.festival_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         festival.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         festival.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || festival.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'name':
        return a.festival_name.localeCompare(b.festival_name);
      case 'date':
        return new Date(a.start_date) - new Date(b.start_date);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Lễ hội</h1>
          <p className="text-gray-600 mt-1">
            {hasRole(['school_manager']) 
              ? 'Tạo và quản lý các lễ hội của trường bạn.' 
              : 'Khám phá và tham gia các lễ hội thú vị.'
            }
          </p>
        </div>
        
        {hasRole(['school_manager']) && (
          <Link
            to="/festivals/create"
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
                <option value="draft">Bản nháp</option>
                <option value="published">Đã công bố</option>
                <option value="ongoing">Đang diễn ra</option>
                <option value="completed">Đã kết thúc</option>
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
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
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
            {hasRole(['school_manager']) && !searchTerm && statusFilter === 'all' && (
              <Link
                to="/festivals/create"
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
                <FestivalCard key={festival.id} festival={festival} user={user} />
              ) : (
                <FestivalListItem key={festival.id} festival={festival} user={user} />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const FestivalCard = ({ festival, user }) => {
  const hasRole = (roles) => roles.includes(user?.role);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img 
          src={festival.image_url} 
          alt={festival.festival_name} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4">
          {getStatusBadge(festival.status)}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {festival.festival_name}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{festival.theme}</p>
        
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <MapPin size={16} className="mr-2 flex-shrink-0" />
            <span className="truncate">{festival.location}</span>
          </div>
          <div className="flex items-center">
            <Calendar size={16} className="mr-2 flex-shrink-0" />
            <span>{formatDate(festival.start_date)} - {formatDate(festival.end_date)}</span>
          </div>
          <div className="flex items-center">
            <Users size={16} className="mr-2 flex-shrink-0" />
            <span>{festival.organizer_school.school_name}</span>
          </div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600 mb-4 pt-4 border-t border-gray-200">
          <span>{festival.stats.registered_booths}/{festival.max_booths} gian hàng</span>
          <span>{festival.stats.participating_schools} trường tham gia</span>
        </div>
        
        <div className="flex space-x-2">
          <Link
            to={`/festivals/${festival.id}`}
            className="flex-1 bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-center font-medium"
          >
            <Eye size={16} className="inline mr-1" />
            Xem chi tiết
          </Link>
          {hasRole(['school_manager']) && (
            <Link
              to={`/festivals/${festival.id}/edit`}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit size={16} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const FestivalListItem = ({ festival, user }) => {
  const hasRole = (roles) => roles.includes(user?.role);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-start space-x-4">
        <img 
          src={festival.image_url} 
          alt={festival.festival_name} 
          className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{festival.festival_name}</h3>
              <p className="text-gray-600 mb-2">{festival.theme}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <MapPin size={14} className="mr-1" />
                  {festival.location}
                </span>
                <span className="flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {formatDate(festival.start_date)}
                </span>
                <span className="flex items-center">
                  <Users size={14} className="mr-1" />
                  {festival.organizer_school.school_name}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 ml-4">
              {getStatusBadge(festival.status)}
              
              <div className="flex space-x-2">
                <Link
                  to={`/festivals/${festival.id}`}
                  className="bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  <Eye size={16} className="inline mr-1" />
                  Xem
                </Link>
                {hasRole(['school_manager']) && (
                  <Link
                    to={`/festivals/${festival.id}/edit`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit size={16} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default FestivalListPage;