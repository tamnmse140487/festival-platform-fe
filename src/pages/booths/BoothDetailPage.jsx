import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Heart, Share2, ShoppingCart, Users, 
  Clock, Award, TrendingUp, MessageCircle, Camera,
  ChevronLeft, ChevronRight, Plus, Minus
} from 'lucide-react';

const mockBoothDetail = {
  id: 1,
  booth_name: "Bánh Mì Truyền Thống",
  booth_type: "food",
  description: "Gian hàng bánh mì với hương vị truyền thống Sài Gòn, nguyên liệu tươi ngon. Chúng tôi tự hào mang đến những chiếc bánh mì được làm từ công thức gia truyền, với bánh giòn rụm và nhân đầy đặn.",
  status: "approved",
  points_balance: 1250,
  group: {
    group_name: "Team Bánh Mì Sài Gòn",
    class_name: "12A1",
    school_name: "Trường THPT ABC"
  },
  location: {
    location_name: "Khu A - Vị trí 01",
  },
  festival: {
    festival_name: "Lễ Hội Ẩm Thực Xuân 2025",
    start_date: "2025-03-15T08:00:00Z",
    end_date: "2025-03-17T18:00:00Z"
  },
  menu_items_count: 8,
  total_orders: 145,
  revenue: 3250000,
  rating: 4.7,
  reviews_count: 89,
  images: [
    "https://sanko.com.vn/wp-content/uploads/cach-lam-banh-mi-thit-nuong-1.jpg",
    "https://bandoanuong.vn/uploads/blog/2024_05/banh-mi-cha-ca-nha-trang-0_1687277813.jpg",
    "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2024_2_19_638439762164888519_cach-lam-banh-mi-pate-trung-7.jpg",
    "https://img-global.cpcdn.com/recipes/01914f4be6cc4786/400x400cq70/photo.jpg"
  ],
  operating_hours: {
    start: "08:00",
    end: "18:00"
  },
  contact: {
    phone: "0901234567",
    facebook: "facebook.com/banhmi.abc"
  }
};

const mockMenuItems = [
  {
    id: 1,
    item_name: "Bánh mì thịt nướng",
    description: "Bánh mì giòn với thịt nướng thơm lừng, kèm rau sống tươi ngon",
    price: 25000,
    image_url: "https://sanko.com.vn/wp-content/uploads/cach-lam-banh-mi-thit-nuong-1.jpg",
    rating: 4.8,
    sold_count: 45,
    available: true
  },
  {
    id: 2,
    item_name: "Bánh mì chả cá",
    description: "Bánh mì với chả cá tươi ngon, đặc sản miền Trung",
    price: 30000,
    image_url: "https://bandoanuong.vn/uploads/blog/2024_05/banh-mi-cha-ca-nha-trang-0_1687277813.jpg",
    rating: 4.6,
    sold_count: 32,
    available: true
  },
  {
    id: 3,
    item_name: "Bánh mì pate",
    description: "Bánh mì truyền thống với pate thơm ngon",
    price: 20000,
    image_url: "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/2024_2_19_638439762164888519_cach-lam-banh-mi-pate-trung-7.jpg",
    rating: 4.5,
    sold_count: 38,
    available: false
  },
  {
    id: 4,
    item_name: "Bánh mì trứng ốp la",
    description: "Bánh mì kẹp trứng ốp la nóng hổi vừa thổi vừa ăn",
    price: 22000,
    image_url: "https://img-global.cpcdn.com/recipes/01914f4be6cc4786/400x400cq70/photo.jpg",
    rating: 4.4,
    sold_count: 30,
    available: true
  }
];

const mockReviews = [
  {
    id: 1,
    user_name: "Nguyễn Văn A",
    user_avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=40&h=40&fit=crop&crop=face",
    rating: 5,
    comment: "Bánh mì rất ngon, thịt nướng thơm phức. Sẽ quay lại ủng hộ!",
    date: "2025-03-16T10:30:00Z"
  },
  {
    id: 2,
    user_name: "Trần Thị B",
    user_avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    rating: 4,
    comment: "Chất lượng ổn, giá cả hợp lý. Bạn bán hàng rất nhiệt tình.",
    date: "2025-03-16T14:15:00Z"
  },
  {
    id: 3,
    user_name: "Lê Hoàng C",
    user_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    rating: 5,
    comment: "Bánh mì chả cá ngon tuyệt vời! Đúng vị miền Trung.",
    date: "2025-03-15T16:45:00Z"
  }
];

const BoothDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booth, setBooth] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('menu');
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setBooth(mockBoothDetail);
      setMenuItems(mockMenuItems);
      setReviews(mockReviews);
      setIsLoading(false);
    }, 1000);
  }, [id]);

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin gian hàng...</p>
        </div>
      </div>
    );
  }

  if (!booth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy gian hàng</h2>
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Quay lại
            </button>
            
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                <Heart className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-600 hover:text-blue-500 transition-colors">
                <Share2 className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-600 hover:text-green-500 transition-colors">
                <Camera className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative">
                <img
                  src={booth.images[selectedImage]}
                  alt={booth.booth_name}
                  className="w-full h-96 object-cover"
                />
                
                <button
                  onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : booth.images.length - 1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedImage(selectedImage < booth.images.length - 1 ? selectedImage + 1 : 0)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {booth.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === selectedImage ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-4 gap-3">
                  {booth.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative overflow-hidden rounded-lg ${
                        index === selectedImage ? 'ring-2 ring-indigo-500' : ''
                      }`}
                    >
                      <img
                        src={image}
                        alt=""
                        className="w-full h-20 object-cover hover:opacity-80 transition-opacity"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{booth.booth_name}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
                      booth.booth_type === 'food' ? 'bg-orange-500' :
                      booth.booth_type === 'beverage' ? 'bg-blue-500' :
                      'bg-purple-500'
                    }`}>
                      {booth.booth_type === 'food' ? '🍜 Đồ ăn' :
                       booth.booth_type === 'beverage' ? '☕ Đồ uống' :
                       '🍰 Tráng miệng'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-lg">{booth.rating}</span>
                      <span className="text-gray-600">({booth.reviews_count} đánh giá)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{booth.location.location_name}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {booth.points_balance} điểm
                  </div>
                  <div className="text-sm text-gray-500">Điểm hiện tại</div>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">{booth.description}</p>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{booth.menu_items_count}</div>
                  <div className="text-sm text-gray-600">Món ăn</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{booth.total_orders}</div>
                  <div className="text-sm text-gray-600">Đơn hàng</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{(booth.revenue / 1000000).toFixed(1)}M</div>
                  <div className="text-sm text-gray-600">Doanh thu</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {booth.operating_hours.start} - {booth.operating_hours.end}
                  </div>
                  <div className="text-sm text-gray-600">Giờ mở cửa</div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Thông tin nhóm</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Tên nhóm:</span>
                    <div className="font-medium">{booth.group.group_name}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Lớp:</span>
                    <div className="font-medium">{booth.group.class_name}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Trường:</span>
                    <div className="font-medium">{booth.group.school_name}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Liên hệ:</span>
                    <div className="font-medium">{booth.contact.phone}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg">
              <div className="border-b">
                <nav className="flex">
                  {[
                    { id: 'menu', label: 'Thực đơn', count: menuItems.length },
                    { id: 'reviews', label: 'Đánh giá', count: reviews.length },
                    { id: 'info', label: 'Thông tin', count: null }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                      {tab.count && (
                        <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'menu' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {menuItems.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex gap-4">
                          <img
                            src={item.image_url}
                            alt={item.item_name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{item.item_name}</h4>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">{item.rating}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-indigo-600">
                                {formatPrice(item.price)}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Đã bán: {item.sold_count}</span>
                                {item.available ? (
                                  <button
                                    onClick={() => addToCart(item)}
                                    className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 transition-colors"
                                  >
                                    Thêm
                                  </button>
                                ) : (
                                  <span className="px-3 py-1 bg-gray-300 text-gray-500 rounded text-sm">
                                    Hết hàng
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex items-start gap-4">
                          <img
                            src={review.user_avatar}
                            alt={review.user_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h5 className="font-medium text-gray-900">{review.user_name}</h5>
                              <div className="flex items-center gap-1">
                                {[...Array(review.rating)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.date).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'info' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Thông tin lễ hội</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-600">Tên lễ hội:</span>
                            <div className="font-medium">{booth.festival.festival_name}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Thời gian:</span>
                            <div className="font-medium">
                              {new Date(booth.festival.start_date).toLocaleDateString('vi-VN')} - 
                              {new Date(booth.festival.end_date).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Liên hệ</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Điện thoại:</span>
                          <span className="font-medium">{booth.contact.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Facebook:</span>
                          <a href={`https://${booth.contact.facebook}`} className="font-medium text-blue-600 hover:text-blue-700">
                            {booth.contact.facebook}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
                       <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <MessageCircle className="w-5 h-5 text-gray-500" />
                  <span>Nhắn tin cho gian hàng</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Star className="w-5 h-5 text-gray-500" />
                  <span>Đánh giá gian hàng</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="w-5 h-5 text-gray-500" />
                  <span>Chia sẻ</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê gian hàng</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">Doanh thu hôm nay</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    {formatPrice(450000)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Khách hàng hôm nay</span>
                  </div>
                  <span className="font-semibold text-blue-600">28</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">Xếp hạng</span>
                  </div>
                  <span className="font-semibold text-yellow-600">#3</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-600">Thời gian phục vụ</span>
                  </div>
                  <span className="font-semibold text-purple-600">~8 phút</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Gian hàng tương tự</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                <img
                  src={`https://images.unsplash.com/photo-${1555939594 + i}-58d7cb561ad1?w=300&h=200&fit=crop`}
                  alt={`Gian hàng ${i}`}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Gian hàng {i}</h4>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">4.{5 + i}</span>
                    <span className="text-xs text-gray-500">(120 đánh giá)</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Mô tả ngắn về gian hàng...</p>
                  <button className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoothDetailPage;