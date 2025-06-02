import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, Star, Clock, ChevronRight, Play, Heart, Share2, 
  Menu, X, Phone, Mail, Facebook, Instagram, Twitter, Youtube,
  TrendingUp, Award, Zap, Shield, Target, ArrowRight, CheckCircle,
  Search, Filter, Globe, Camera, Gift, Coffee, Utensils, Cookie
} from 'lucide-react';

const mockFestivals = [
  {
    id: 1,
    festival_name: "Lễ Hội Ẩm Thực Xuân 2025",
    theme: "Hương vị truyền thống",
    organizer_school: {
      id: 1,
      school_name: "Trường THPT ABC",
      address: "123 Đường ABC, Quận 1, TP.HCM",
    },
    start_date: "2025-03-15T08:00:00Z",
    end_date: "2025-03-17T18:00:00Z",
    location: "Sân trường THPT ABC",
    status: "published",
    description: "Lễ hội ẩm thực với chủ đề hương vị truyền thống, mang đến những món ăn đặc sắc từ khắp ba miền.",
    image_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=300&fit=crop",
    stats: {
      registered_booths: 18,
      participating_schools: 8,
      total_visitors: 1250,
    },
  },
];

const mockBooths = [
  {
    id: 1,
    festival_id: 1,
    booth_name: "Bánh Mì Truyền Thống",
    booth_type: "food",
    description: "Gian hàng bánh mì với hương vị truyền thống Sài Gòn, nguyên liệu tươi ngon",
    status: "approved",
    points_balance: 1250,
    group: {
      group_name: "Team Bánh Mì Sài Gòn",
      class_name: "12A1"
    },
    location: {
      location_name: "Khu A - Vị trí 01",
    },
    menu_items_count: 8,
    total_orders: 45,
    revenue: 2250000,
    rating: 4.7,
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop"
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [festivalBooths, setFestivalBooths] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleFestivalClick = (festival) => {
    setIsLoading(true);
    setSelectedFestival(festival);
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    setTimeout(() => {
      setFestivalBooths(mockBooths.filter(booth => booth.festival_id === festival.id));
      setIsLoading(false);
    }, 800);
  };

  const handleBoothClick = (booth) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    setTimeout(() => {
      navigate(`/booths/${booth.id}`);
    }, 300);
  };

  const handleLoginClick = () => {
    navigate('/auth/login');
  };

  const handleRegisterClick = () => {
    navigate('/auth/register');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isOngoing = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  };

  const isUpcoming = (startDate) => {
    const now = new Date();
    const start = new Date(startDate);
    return start > now;
  };

  const Header = () => (
    <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Festival Hub
              </h1>
            </div>
          </div>
          
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">Trang chủ</a>
              <a href="#festivals" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">Lễ hội</a>
              <a href="#about" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">Giới thiệu</a>
              <a href="#contact" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">Liên hệ</a>
            </div>
          </nav>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              <button 
                onClick={handleLoginClick}
                className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Đăng nhập
              </button>
              <button 
                onClick={handleRegisterClick}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                Đăng ký
              </button>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <a href="#" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">Trang chủ</a>
            <a href="#festivals" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">Lễ hội</a>
            <a href="#about" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">Giới thiệu</a>
            <a href="#contact" className="block px-3 py-2 text-gray-700 hover:text-indigo-600">Liên hệ</a>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleLoginClick}
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Đăng nhập
                </button>
                <button 
                  onClick={handleRegisterClick}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg"
                >
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );

  const Footer = () => (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Festival Hub
            </h3>
            <p className="text-gray-400">
              Nền tảng kết nối các lễ hội học đường, tạo cơ hội giao lưu và học hỏi cho học sinh trên toàn quốc.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-gray-400 hover:text-pink-400 cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
              <Youtube className="w-5 h-5 text-gray-400 hover:text-red-400 cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Dịch vụ</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Tổ chức lễ hội</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Quản lý gian hàng</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Hệ thống điểm thưởng</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Trò chơi tương tác</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Hướng dẫn sử dụng</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Liên hệ hỗ trợ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Liên hệ</h4>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>1900-123-456</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>support@festivalhub.vn</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Festival Hub. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );

  if (selectedFestival) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-16">
            <button
              onClick={() => {
                setSelectedFestival(null);
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }}
              className="mb-6 flex items-center text-white/80 hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5 rotate-180 mr-2" />
              Quay lại danh sách lễ hội
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isOngoing(selectedFestival.start_date, selectedFestival.end_date) 
                      ? 'bg-green-500 text-white'
                      : isUpcoming(selectedFestival.start_date)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}>
                    {isOngoing(selectedFestival.start_date, selectedFestival.end_date) 
                      ? '🔴 Đang diễn ra'
                      : isUpcoming(selectedFestival.start_date)
                      ? '⏳ Sắp diễn ra'
                      : '✅ Đã kết thúc'
                    }
                  </span>
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  {selectedFestival.festival_name}
                </h1>
                
                <p className="text-xl text-white/90 mb-6">
                  {selectedFestival.theme}
                </p>
                
                <div className="space-y-3 text-white/80">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5" />
                    <span>
                      {formatDate(selectedFestival.start_date)} - {formatDate(selectedFestival.end_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5" />
                    <span>{selectedFestival.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    <span>{selectedFestival.organizer_school.school_name}</span>
                  </div>
                </div>
              </div>
              
              <div className="lg:text-right">
                <img
                  src={selectedFestival.image_url}
                  alt={selectedFestival.festival_name}
                  className="w-full h-64 lg:h-80 object-cover rounded-xl shadow-2xl"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{selectedFestival.stats.registered_booths}</div>
                <div className="text-white/80">Gian hàng</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{selectedFestival.stats.participating_schools}</div>
                <div className="text-white/80">Trường tham gia</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{selectedFestival.stats.total_visitors}</div>
                <div className="text-white/80">Lượt tham quan</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Các gian hàng tham gia
            </h2>
            <div className="flex items-center gap-2 text-gray-600">
              <span>{festivalBooths.length} gian hàng</span>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded flex-1"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {festivalBooths.map((booth, index) => (
                <div
                  key={booth.id}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer"
                  onClick={() => handleBoothClick(booth)}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={booth.image_url}
                      alt={booth.booth_name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                        booth.booth_type === 'food' ? 'bg-orange-500' :
                        booth.booth_type === 'beverage' ? 'bg-blue-500' :
                        'bg-purple-500'
                      }`}>
                        {booth.booth_type === 'food' ? '🍜 Đồ ăn' :
                         booth.booth_type === 'beverage' ? '☕ Đồ uống' :
                         '🍰 Tráng miệng'}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {booth.booth_name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-600">{booth.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {booth.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Nhóm:</span>
                        <span className="font-medium text-gray-700">{booth.group.group_name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Lớp:</span>
                        <span className="font-medium text-gray-700">{booth.group.class_name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Vị trí:</span>
                        <span className="font-medium text-gray-700">{booth.location.location_name}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{booth.menu_items_count}</div>
                        <div className="text-xs text-gray-500">Món ăn</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{booth.total_orders}</div>
                        <div className="text-xs text-gray-500">Đơn hàng</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-indigo-600">{booth.points_balance}</div>
                        <div className="text-xs text-gray-500">Điểm</div>
                      </div>
                    </div>
                    
                    <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
                      Xem chi tiết gian hàng
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Festival Hub
          </h1>
          <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Khám phá những lễ hội học đường tuyệt vời với hàng trăm gian hàng độc đáo từ các trường học trên toàn quốc
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => {
                const festivalsSection = document.getElementById('festivals');
                festivalsSection.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg transform hover:scale-105"
            >
              Khám phá ngay
            </button>
            <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
              <Play className="w-5 h-5" />
              Xem video giới thiệu
            </button>
          </div>
        </div>
      </div>

      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn Festival Hub?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nền tảng toàn diện giúp tổ chức và tham gia lễ hội học đường một cách dễ dàng và hiệu quả
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Dễ dàng sử dụng",
                description: "Giao diện thân thiện, dễ sử dụng cho mọi lứa tuổi"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "An toàn bảo mật",
                description: "Hệ thống bảo mật cao, đảm bảo thông tin an toàn"
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: "Hiệu quả cao",
                description: "Tối ưu hóa quy trình tổ chức và quản lý lễ hội"
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "Chất lượng đỉnh cao",
                description: "Đội ngũ hỗ trợ chuyên nghiệp 24/7"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="festivals" className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Lễ hội đang diễn ra
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tham gia những lễ hội thú vị với hàng trăm gian hàng từ các trường học
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {mockFestivals.map((festival, index) => (
            <div
              key={festival.id}
              className="group cursor-pointer"
              onClick={() => handleFestivalClick(festival)}
              style={{
                animationDelay: `${index * 200}ms`,
                animation: 'fadeInUp 0.8s ease-out forwards'
              }}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3">
                <div className="relative overflow-hidden">
                  <img
                    src={festival.image_url}
                    alt={festival.festival_name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isOngoing(festival.start_date, festival.end_date) 
                        ? 'bg-green-500 text-white'
                        : isUpcoming(festival.start_date)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}>
                      {isOngoing(festival.start_date, festival.end_date) 
                        ? '🔴 Đang diễn ra'
                        : isUpcoming(festival.start_date)
                        ? '⏳ Sắp diễn ra'
                        : '✅ Đã kết thúc'
                      }
                    </span>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {festival.festival_name}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {festival.theme}
                    </p>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {formatDate(festival.start_date)} - {formatDate(festival.end_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{festival.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{festival.organizer_school.school_name}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6 line-clamp-2">
                    {festival.description}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">{festival.stats.registered_booths}</div>
                      <div className="text-xs text-gray-500">Gian hàng</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{festival.stats.participating_schools}</div>
                      <div className="text-xs text-gray-500">Trường học</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-pink-600">{festival.stats.total_visitors}</div>
                      <div className="text-xs text-gray-500">Khách thăm</div>
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 group-hover:scale-105">
                    Khám phá lễ hội
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Con số ấn tượng
            </h2>
            <p className="text-xl text-white/90">
              Festival Hub đã kết nối và phục vụ hàng ngàn người dùng
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: "150+", label: "Trường học tham gia" },
              { number: "500+", label: "Lễ hội đã tổ chức" },
              { number: "10,000+", label: "Gian hàng hoạt động" },
              { number: "50,000+", label: "Học sinh tham gia" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-white/80">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Về Festival Hub
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Festival Hub là nền tảng hàng đầu tại Việt Nam giúp các trường học tổ chức và quản lý 
                lễ hội một cách chuyên nghiệp và hiệu quả.
              </p>
              <div className="space-y-4">
                {[
                  "Kết nối cộng đồng giáo dục trên toàn quốc",
                  "Tạo cơ hội học tập và giao lưu cho học sinh",
                  "Phát triển kỹ năng tổ chức và kinh doanh",
                  "Xây dựng văn hóa học đường tích cực"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <button className="mt-8 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2">
                Tìm hiểu thêm
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=400&fit=crop"
                alt="Về chúng tôi"
                className="w-full rounded-xl shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-20"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Bạn muốn tổ chức lễ hội cho trường mình?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Tham gia cùng hàng trăm trường học khác để tạo ra những lễ hội tuyệt vời
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleRegisterClick}
              className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-full hover:bg-gray-100 transition-colors"
            >
              Đăng ký ngay
            </button>
            <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-indigo-600 transition-all">
              Tìm hiểu thêm
            </button>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;