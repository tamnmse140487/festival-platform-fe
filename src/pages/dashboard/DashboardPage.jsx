import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, ShoppingCart, School, Store, Users, TrendingUp, Clock, Star } from 'lucide-react';
import { mockFestivals, mockBooths, mockStudentGroups, mockSuppliers } from '../../data/mockData';
import { ROLE_NAME } from '../../utils/constants';

const DashboardPage = () => {
  const { user } = useAuth();

  const getStatsForRole = () => {
    switch (user?.role) {
      case ROLE_NAME.ADMIN:
        return [
          { label: 'Tổng số trường', value: '156', icon: School, color: 'bg-blue-500', trend: '+12 tháng này' },
          { label: 'Lễ hội tổng', value: '234', icon: Calendar, color: 'bg-green-500', trend: '+18 mới' },
          { label: 'Người dùng hoạt động', value: '12.5K', icon: Users, color: 'bg-purple-500', trend: '+8.5%' },
          { label: 'Doanh thu hệ thống', value: '2.8B', icon: TrendingUp, color: 'bg-orange-500', trend: '+23%' }
        ];
      case ROLE_NAME.SCHOOL_MANAGER:
        return [
          { label: 'Lễ hội đang tổ chức', value: '2', icon: Calendar, color: 'bg-blue-500', trend: '+1 tuần này' },
          { label: 'Gian hàng hoạt động', value: '18', icon: ShoppingCart, color: 'bg-green-500', trend: '+3 mới' },
          { label: 'Nhóm học sinh', value: '12', icon: Users, color: 'bg-purple-500', trend: '+2 nhóm' },
          { label: 'Doanh thu', value: '25.6M', icon: TrendingUp, color: 'bg-orange-500', trend: '+15%' }
        ];
      case ROLE_NAME.TEACHER:
        return [
          { label: 'Nhóm đang quản lý', value: '3', icon: Users, color: 'bg-blue-500', trend: 'Hoạt động tốt' },
          { label: 'Gian hàng cần duyệt', value: '2', icon: Clock, color: 'bg-yellow-500', trend: 'Chờ xử lý' },
          { label: 'Lễ hội tham gia', value: '1', icon: Calendar, color: 'bg-green-500', trend: 'Đang diễn ra' },
          { label: 'Học sinh tham gia', value: '18', icon: School, color: 'bg-purple-500', trend: '+6 mới' }
        ];
      case ROLE_NAME.STUDENT:
        return [
          { label: 'Điểm tích lũy', value: '1,250', icon: Star, color: 'bg-yellow-500', trend: '+50 hôm nay' },
          { label: 'Đơn hàng đã mua', value: '8', icon: ShoppingCart, color: 'bg-green-500', trend: '+2 mới' },
          { label: 'Game đã chơi', value: '15', icon: Calendar, color: 'bg-blue-500', trend: '+3 game' },
          { label: 'Gian hàng yêu thích', value: '5', icon: Store, color: 'bg-purple-500', trend: 'Theo dõi' }
        ];
      case ROLE_NAME.SUPPLIER:
        return [
          { label: 'Đơn hàng mới', value: '12', icon: ShoppingCart, color: 'bg-blue-500', trend: '+4 hôm nay' },
          { label: 'Nguyên liệu cung cấp', value: '45', icon: Store, color: 'bg-green-500', trend: '+3 mới' },
          { label: 'Lễ hội tham gia', value: '3', icon: Calendar, color: 'bg-purple-500', trend: '1 sắp diễn ra' },
          { label: 'Đánh giá trung bình', value: '4.8', icon: Star, color: 'bg-orange-500', trend: '+0.2' }
        ];
      default:
        return [];
    }
  };

  const getRecentActivities = () => {
    switch (user?.role) {
      case ROLE_NAME.ADMIN:
        return [
          {
            action: 'Trường THPT DEF đã đăng ký tham gia hệ thống',
            time: '1 giờ trước',
            type: 'success',
            icon: <School size={16} />
          },
          {
            action: 'Lễ hội "Ngày Hội Khoa Học" được tạo tại TP.HCM',
            time: '3 giờ trước',
            type: 'info',
            icon: <Calendar size={16} />
          },
          {
            action: 'Nhà cung cấp "Thực Phẩm An Toàn" được phê duyệt',
            time: '5 giờ trước',
            type: 'success',
            icon: <Store size={16} />
          },
          {
            action: 'Cập nhật bảo mật hệ thống thành công',
            time: '1 ngày trước',
            type: 'info',
            icon: <Users size={16} />
          }
        ];
      case ROLE_NAME.SCHOOL_MANAGER:
        return [
          {
            action: 'Gian hàng "Bánh Mì Sài Gòn" đã được phê duyệt',
            time: '2 giờ trước',
            type: 'success',
            icon: <ShoppingCart size={16} />
          },
          {
            action: 'Nhóm Coffee Lovers đã đăng ký tham gia lễ hội',
            time: '4 giờ trước',
            type: 'info',
            icon: <Users size={16} />
          },
          {
            action: 'Nhà cung cấp mới đã được duyệt tham gia',
            time: '1 ngày trước',
            type: 'info',
            icon: <Store size={16} />
          },
          {
            action: 'Lễ hội Ẩm Thực Xuân đã bắt đầu nhận đăng ký',
            time: '2 ngày trước',
            type: 'success',
            icon: <Calendar size={16} />
          }
        ];
      case ROLE_NAME.TEACHER:
        return [
          {
            action: 'Nhóm 12A1 đã nộp kế hoạch gian hàng',
            time: '1 giờ trước',
            type: 'info',
            icon: <Users size={16} />
          },
          {
            action: 'Cần duyệt gian hàng "Trà Sữa Teen"',
            time: '3 giờ trước',
            type: 'warning',
            icon: <Clock size={16} />
          },
          {
            action: 'Học sinh Nguyễn Văn A đã tham gia nhóm',
            time: '5 giờ trước',
            type: 'info',
            icon: <School size={16} />
          }
        ];
      case ROLE_NAME.STUDENT:
        return [
          {
            action: 'Nhận được 50 điểm từ game "Đố vui ẩm thực"',
            time: '30 phút trước',
            type: 'success',
            icon: <Star size={16} />
          },
          {
            action: 'Mua bánh mì thịt nướng tại gian hàng ABC',
            time: '2 giờ trước',
            type: 'info',
            icon: <ShoppingCart size={16} />
          },
          {
            action: 'Tham gia nhóm "Coffee Lovers"',
            time: '1 ngày trước',
            type: 'info',
            icon: <Users size={16} />
          }
        ];
      case ROLE_NAME.SUPPLIER:
        return [
          {
            action: 'Nhận đơn hàng 50kg thịt bò từ gian hàng XYZ',
            time: '1 giờ trước',
            type: 'success',
            icon: <ShoppingCart size={16} />
          },
          {
            action: 'Cập nhật giá nguyên liệu tháng 3',
            time: '4 giờ trước',
            type: 'info',
            icon: <Store size={16} />
          },
          {
            action: 'Đăng ký tham gia lễ hội mới',
            time: '2 ngày trước',
            type: 'info',
            icon: <Calendar size={16} />
          }
        ];
      default:
        return [];
    }
  };

  const stats = getStatsForRole();
  const activities = getRecentActivities();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Chào mừng, {user?.full_name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Đây là tổng quan hoạt động của bạn hôm nay.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('vi-VN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.trend}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg flex-shrink-0`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${activity.type === 'success' ? 'bg-green-100 text-green-600' :
                      activity.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                    }`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {user?.role === 'SchoolManager' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lễ hội đang diễn ra</h3>
              <div className="space-y-4">
                {mockFestivals.filter(f => f.status === 'published').slice(0, 2).map(festival => (
                  <div key={festival.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={festival.image_url}
                      alt={festival.festival_name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{festival.festival_name}</h4>
                      <p className="text-sm text-gray-600">{festival.location}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{festival.stats.registered_booths}/{festival.max_booths} gian hàng</span>
                        <span>{festival.stats.participating_schools} trường</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Đang diễn ra
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {user?.role === 'SchoolManager' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê nhanh</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Gian hàng chờ duyệt</span>
                  <span className="font-semibold text-orange-600">3</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Nhóm mới tạo tuần này</span>
                  <span className="font-semibold text-green-600">5</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Nhà cung cấp hoạt động</span>
                  <span className="font-semibold text-blue-600">12</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t pt-2">
                  <span className="text-sm font-medium text-gray-900">Tổng doanh thu tháng</span>
                  <span className="font-bold text-gray-900">128.5M VNĐ</span>
                </div>
              </div>
            </div>
          )}

          {user?.role === 'Student' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mini Games yêu thích</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Đố vui ẩm thực</span>
                  <span className="text-xs text-blue-600">+50 điểm</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Khám phá văn hóa</span>
                  <span className="text-xs text-green-600">+30 điểm</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">Tìm hiểu lịch sử</span>
                  <span className="text-xs text-purple-600">+25 điểm</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Mẹo hữu ích</h3>
            <p className="text-sm opacity-90 mb-4">
              {user?.role === 'SchoolManager' && "Thường xuyên kiểm tra và phê duyệt các gian hàng để tăng sự hài lòng của học sinh."}
              {user?.role === 'Teacher' && "Động viên học sinh tham gia tích cực vào các hoạt động lễ hội để tăng trải nghiệm học tập."}
              {user?.role === 'Student' && "Tham gia mini games để tích lũy điểm và đổi lấy những phần quà hấp dẫn!"}
              {user?.role === 'Supplier' && "Cập nhật thường xuyên giá cả và chất lượng nguyên liệu để thu hút nhiều đối tác hơn."}
            </p>
            <button className="text-sm bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors">
              Tìm hiểu thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;