import React from 'react';
import { Calendar, MapPin, Users, TrendingUp, FileText, Clock, CheckCircle } from 'lucide-react';
import { convertToVietnamTimeWithFormat } from '../../../utils/formatters';
import { calculateFestivalStats, getStatusBadge } from '../../../utils/helpers';

const AdminOverviewTab = ({ festival, festivalSchool }) => {
  const stats = calculateFestivalStats(festival);

  const cardStats = [
    {
      title: 'Tổng gian hàng',
      value: stats.totalBooths,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Đã đăng ký',
      value: stats.registeredBooths,
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Còn trống',
      value: stats.availableBooths,
      icon: CheckCircle,
      color: 'yellow'
    },
    {
      title: 'Tỷ lệ lấp đầy',
      value: `${stats.occupancyRate}%`,
      icon: TrendingUp,
      color: 'purple'
    }
  ];

  const formatDateTime = (dateString) => {
    return convertToVietnamTimeWithFormat(dateString);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardStats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600 border-blue-200',
            green: 'bg-green-50 text-green-600 border-green-200',
            yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
            purple: 'bg-purple-50 text-purple-600 border-purple-200'
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText size={20} className="mr-2" />
            Chi tiết lễ hội
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Tên lễ hội</label>
              <p className="mt-1 text-sm text-gray-900 font-medium">{festival.festivalName}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Chủ đề</label>
              <p className="mt-1 text-sm text-gray-600">{festival.theme}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Trạng thái</label>
              <div className="mt-1">
                {getStatusBadge(festival.status, 'festival')}
              </div>
            </div>

            {festival.description && (
              <div>
                <label className="text-sm font-medium text-gray-700">Mô tả</label>
                <p className="mt-1 text-sm text-gray-600">{festival.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Thời gian diễn ra</label>
                <div className="mt-1 space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={14} className="mr-1" />
                    <span className="font-medium">Bắt đầu:</span>
                    <span className="ml-2">{formatDateTime(festival.startDate)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={14} className="mr-1" />
                    <span className="font-medium">Kết thúc:</span>
                    <span className="ml-2">{formatDateTime(festival.endDate)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Thời gian đăng ký</label>
                <div className="mt-1 space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock size={14} className="mr-1" />
                    <span className="font-medium">Mở:</span>
                    <span className="ml-2">{formatDateTime(festival.registrationStartDate)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock size={14} className="mr-1" />
                    <span className="font-medium">Đóng:</span>
                    <span className="ml-2">{formatDateTime(festival.registrationEndDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Địa điểm</label>
              <div className="mt-1 flex items-center text-sm text-gray-600">
                <MapPin size={14} className="mr-1" />
                {festival.location}
              </div>
            </div>

            {festival.cancellationReason && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <label className="text-sm font-medium text-red-800">Lý do hủy</label>
                <p className="mt-1 text-sm text-red-700">{festival.cancellationReason}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin kiểm duyệt</h3>
          {festivalSchool ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Trạng thái kiểm duyệt</label>
                <div className="mt-1">
                  {getStatusBadge(festivalSchool.status, 'approval')}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Ngày đăng ký</label>
                <p className="mt-1 text-sm text-gray-600">
                  {formatDateTime(festivalSchool.registrationDate)}
                </p>
              </div>

              {festivalSchool.approvalDate && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Ngày duyệt</label>
                  <p className="mt-1 text-sm text-gray-600">
                    {formatDateTime(festivalSchool.approvalDate)}
                  </p>
                </div>
              )}

              {festivalSchool.rejectReason && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <label className="text-sm font-medium text-red-800">Lý do từ chối</label>
                  <p className="mt-1 text-sm text-red-700">{festivalSchool.rejectReason}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">ID đăng ký</label>
                <p className="mt-1 text-sm text-gray-600 font-mono">
                  {festivalSchool.festivalSchoolId}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Chưa có thông tin đăng ký từ trường</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cấu hình gian hàng</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-orange-600 mb-2">{festival.maxFoodBooths || 0}</div>
            <div className="text-sm text-gray-600">Gian hàng đồ ăn (tối đa)</div>
            <div className="text-xs text-orange-600 mt-1">
              Đã đăng ký: {festival.registeredFoodBooths || 0}
            </div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-blue-600 mb-2">{festival.maxBeverageBooths || 0}</div>
            <div className="text-sm text-gray-600">Gian hàng đồ uống (tối đa)</div>
            <div className="text-xs text-blue-600 mt-1">
              Đã đăng ký: {festival.registeredBeverageBooths || 0}
            </div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-purple-600 mb-2">{stats.totalBooths}</div>
            <div className="text-sm text-gray-600">Tổng gian hàng</div>
            <div className="text-xs text-purple-600 mt-1">
              Đã đăng ký: {stats.registeredBooths}
            </div>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-green-600 mb-2">{stats.occupancyRate}%</div>
            <div className="text-sm text-gray-600">Tỷ lệ lấp đầy</div>
            <div className="text-xs text-green-600 mt-1">
              Còn trống: {stats.availableBooths}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
            <span>Tiến độ đăng ký gian hàng</span>
            <span>{stats.registeredBooths} / {stats.totalBooths}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${stats.occupancyRate}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Tỷ lệ lấp đầy: {stats.occupancyRate}%
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin hệ thống</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Festival ID:</span>
              <span className="font-mono text-gray-900">{festival.festivalId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ngày tạo:</span>
              <span className="text-gray-900">{formatDateTime(festival.createdAt)}</span>
            </div>
          </div>
          
          {festivalSchool && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">School ID:</span>
                <span className="font-mono text-gray-900">{festivalSchool.schoolId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Festival School ID:</span>
                <span className="font-mono text-gray-900">{festivalSchool.festivalSchoolId}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewTab;