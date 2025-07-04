import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Edit,
  Share2,
  ShoppingCart,
  Trophy,
  Clock,
  CheckCircle,
  Image as ImageIcon,
  Play,
  X,
  Check,
  Handshake,
  Store
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { festivalServices } from '../../services/festivalServices';
import { festivalSchoolServices } from '../../services/festivalSchoolServices';
import { festivalMapServices } from '../../services/festivalMapServices';
import { mapLocationServices } from '../../services/mapLocationServices';
import { festivalMenuServices } from '../../services/festivalMenuServices';
import { menuItemServices } from '../../services/menuItemServices';
import { imageServices } from '../../services/imageServices';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import OverviewTab from '../../components/festivalDetail/OverviewTab';
import ImagesTab from '../../components/festivalDetail/ImagesTab';
import MapTab from '../../components/festivalDetail/MapTab';
import MenuTab from '../../components/festivalDetail/MenuTab';
import IngredientRegistrationModal from '../../components/festivalDetail/IngredientRegistrationModal';
import { ROLE_NAME, FESTIVAL_STATUS } from '../../utils/constants';
import BoothRegistrationModal from '../../components/booths/BoothRegistrationModal';

const FestivalDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [festival, setFestival] = useState(null);
  const [festivalImages, setFestivalImages] = useState([]);
  const [festivalMap, setFestivalMap] = useState(null);
  const [mapLocations, setMapLocations] = useState([]);
  const [festivalMenu, setFestivalMenu] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [menuItemImages, setMenuItemImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    loadFestivalData();
  }, [id]);

  const loadFestivalData = async () => {
    try {
      setLoading(true);

      const [
        festivalResponse,
        festivalImagesResponse,
        mapResponse,
        menuResponse
      ] = await Promise.all([
        festivalServices.get({ festivalId: parseInt(id) }),
        imageServices.get({ festivalId: parseInt(id) }),
        festivalMapServices.get({ festivalId: parseInt(id) }),
        festivalMenuServices.get({ festivalId: parseInt(id) })
      ]);

      if (festivalResponse.data && festivalResponse.data.length > 0) {
        setFestival(festivalResponse.data[0]);
      }

      if (festivalImagesResponse.data) {
        setFestivalImages(festivalImagesResponse.data);
      }

      if (mapResponse.data && mapResponse.data.length > 0) {
        const map = mapResponse.data[0];
        setFestivalMap(map);

        const locationsResponse = await mapLocationServices.get({ mapId: map.id });
        setMapLocations(locationsResponse.data || []);
      }

      if (menuResponse.data && menuResponse.data.length > 0) {
        const menu = menuResponse.data[0];
        setFestivalMenu(menu);

        const itemsResponse = await menuItemServices.get({ menuId: menu.id });
        if (itemsResponse.data) {
          setMenuItems(itemsResponse.data);

          const menuItemImagesPromises = itemsResponse.data.map(item =>
            imageServices.get({ menuItemId: item.id })
          );
          const menuItemImagesResponses = await Promise.all(menuItemImagesPromises);
          const allMenuItemImages = menuItemImagesResponses.flatMap(response => response.data || []);
          setMenuItemImages(allMenuItemImages);
        }
      }

    } catch (error) {
      console.error('Error loading festival data:', error);
      toast.error('Không thể tải thông tin lễ hội');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setIsRegistering(true);
      await festivalSchoolServices.create({
        festivalId: parseInt(id),
        schoolId: user.schoolId
      });
      toast.success('Đăng ký tham gia lễ hội thành công!');
      setShowRegisterModal(false);
    } catch (error) {
      console.error('Error registering for festival:', error);
      toast.error('Không thể đăng ký tham gia lễ hội');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setIsUpdatingStatus(true);
      await festivalServices.update({ id: parseInt(id), status: newStatus });
      setFestival(prev => ({ ...prev, status: newStatus }));
      toast.success('Cập nhật trạng thái lễ hội thành công!');
    } catch (error) {
      console.error('Error updating festival status:', error);
      toast.error('Không thể cập nhật trạng thái lễ hội');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleIngredientModalClose = () => {
    setShowIngredientModal(false);
  };



  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-40 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!festival) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy lễ hội</h2>
        <Button onClick={() => navigate('/app/festivals')} className="mt-4">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      [FESTIVAL_STATUS.DRAFT]: { label: 'Bản nháp', class: 'bg-gray-100 text-gray-800', icon: <Edit size={16} /> },
      [FESTIVAL_STATUS.PUBLISHED]: { label: 'Đã công bố', class: 'bg-green-100 text-green-800', icon: <CheckCircle size={16} /> },
      [FESTIVAL_STATUS.ONGOING]: { label: 'Đang diễn ra', class: 'bg-blue-100 text-blue-800', icon: <Clock size={16} /> },
      [FESTIVAL_STATUS.COMPLETED]: { label: 'Đã kết thúc', class: 'bg-purple-100 text-purple-800', icon: <Trophy size={16} /> },
      [FESTIVAL_STATUS.CANCELLED]: { label: 'Đã hủy', class: 'bg-red-100 text-red-800', icon: <X size={16} /> }
    };

    const badge = badges[status] || badges[FESTIVAL_STATUS.DRAFT];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
        {badge.icon}
        <span className="ml-1">{badge.label}</span>
      </span>
    );
  };

  const getStatusActions = () => {
    if (hasRole([ROLE_NAME.ADMIN]) && festival.status === FESTIVAL_STATUS.DRAFT) {
      return (
        <button
          onClick={() => handleStatusUpdate(FESTIVAL_STATUS.PUBLISHED)}
          disabled={isUpdatingStatus}
          className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        >
          {isUpdatingStatus ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Check size={16} className="mr-1" />
          )}
          Duyệt lễ hội
        </button>
      );
    }

    if (hasRole([ROLE_NAME.SCHOOL_MANAGER]) && festival.schoolId === user.schoolId) {
      if (festival.status === FESTIVAL_STATUS.PUBLISHED) {
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleStatusUpdate(FESTIVAL_STATUS.ONGOING)}
              disabled={isUpdatingStatus}
              className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isUpdatingStatus ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Play size={16} className="mr-1" />
              )}
              Bắt đầu
            </button>
            <button
              onClick={() => handleStatusUpdate(FESTIVAL_STATUS.CANCELLED)}
              disabled={isUpdatingStatus}
              className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isUpdatingStatus ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <X size={16} className="mr-1" />
              )}
              Hủy bỏ
            </button>
          </div>
        );
      }

      if (festival.status === FESTIVAL_STATUS.ONGOING) {
        return (
          <button
            onClick={() => handleStatusUpdate(FESTIVAL_STATUS.COMPLETED)}
            disabled={isUpdatingStatus}
            className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {isUpdatingStatus ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Trophy size={16} className="mr-1" />
            )}
            Kết thúc
          </button>
        );
      }
    }

    return null;
  };

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: <Calendar size={16} /> },
    { id: 'images', label: 'Hình ảnh', icon: <ImageIcon size={16} /> },
    { id: 'map', label: 'Bản đồ', icon: <MapPin size={16} /> },
    { id: 'menu', label: 'Thực đơn', icon: <ShoppingCart size={16} /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/app/festivals')}
            icon={<ArrowLeft size={20} />}
          >
            Quay lại
          </Button>
        </div>

        <div className="flex items-center space-x-3">
          {hasRole([ROLE_NAME.SUPPLIER]) && festival.status === FESTIVAL_STATUS.PUBLISHED && (
            <Button
              variant="success"
              icon={<Handshake size={16} />}
              onClick={() => setShowIngredientModal(true)}
            >
              Đăng ký cung cấp nguyên liệu
            </Button>
          )}

          {getStatusActions()}
          <Button variant="outline" icon={<Share2 size={16} />}>
            Chia sẻ
          </Button>
          {hasRole([ROLE_NAME.SCHOOL_MANAGER]) && festival.organizerSchoolId === user.schoolId && (
            <Button
              icon={<Edit size={16} />}
              onClick={() => navigate(`/app/festivals/${id}/edit`)}
            >
              Chỉnh sửa
            </Button>
          )}

        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="relative h-64 lg:h-80">
          <img
            src={festivalImages.length > 0 ? festivalImages[0].imageUrl : '/api/placeholder/800/400'}
            alt={festival.festivalName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center justify-between mb-4">
              {getStatusBadge(festival.status)}
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center">
                  <ShoppingCart size={16} className="mr-1" />
                  {festival.maxFoodBooths + festival.maxBeverageBooths} gian hàng
                </span>
              </div>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">{festival.festivalName}</h1>
            <p className="text-xl opacity-90">{festival.theme}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {activeTab === 'overview' && <OverviewTab festival={festival} />}
          {activeTab === 'images' && <ImagesTab festivalImages={festivalImages} loading={loading} />}
          {activeTab === 'map' && <MapTab festivalMap={festivalMap} mapLocations={mapLocations} festival={festival} festivalMenu={festivalMenu} menuItems={menuItems} menuItemImages={menuItemImages} loading={loading} />}
          {activeTab === 'menu' && <MenuTab festivalMenu={festivalMenu} menuItems={menuItems} menuItemImages={menuItemImages} loading={loading} />}
        </div>

        <div className="space-y-6">
          <Card>
            <Card.Header>
              <Card.Title>Thông tin tổ chức</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Địa điểm</label>
                  <p className="text-gray-900 flex items-center">
                    <MapPin size={16} className="mr-1 text-gray-400" />
                    {festival.location}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Thời gian diễn ra</label>
                  <div className="text-gray-900">
                    <div className="flex items-center mb-1">
                      <Calendar size={16} className="mr-1 text-gray-400" />
                      <span className="text-sm">Bắt đầu:</span>
                    </div>
                    <p className="ml-5">{formatDate(festival.startDate)}</p>
                    <div className="flex items-center mb-1 mt-2">
                      <Calendar size={16} className="mr-1 text-gray-400" />
                      <span className="text-sm">Kết thúc:</span>
                    </div>
                    <p className="ml-5">{formatDate(festival.endDate)}</p>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Thống kê gian hàng</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Gian hàng đồ ăn</span>
                  <span className="font-semibold">{festival.maxFoodBooths}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Gian hàng đồ uống</span>
                  <span className="font-semibold">{festival.maxBeverageBooths}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-gray-600 font-medium">Tổng số gian hàng</span>
                  <span className="font-bold text-blue-600">{festival.maxFoodBooths + festival.maxBeverageBooths}</span>
                </div>
              </div>
            </Card.Content>
          </Card>

          {hasRole([ROLE_NAME.STUDENT, ROLE_NAME.TEACHER]) && festival.status === FESTIVAL_STATUS.PUBLISHED && (
            <Card>
              <Card.Header>
                <Card.Title>Tham gia lễ hội</Card.Title>
              </Card.Header>
              <Card.Content>
                <Button
                  fullWidth
                  onClick={() => setShowRegisterModal(true)}
                >
                  Đăng ký tham gia
                </Button>
              </Card.Content>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Đăng ký tham gia lễ hội"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Bạn có muốn đăng ký tham gia lễ hội "{festival.festivalName}" không?
          </p>
          <div className="flex space-x-3">
            <Button
              fullWidth
              loading={isRegistering}
              onClick={handleRegister}
            >
              Xác nhận đăng ký
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowRegisterModal(false)}
              disabled={isRegistering}
            >
              Hủy
            </Button>
          </div>
        </div>
      </Modal>

      <IngredientRegistrationModal
        isOpen={showIngredientModal}
        onClose={handleIngredientModalClose}
        festivalId={parseInt(id)}
        supplierId={user?.supplierId}
      />


    </div>
  );
};

export default FestivalDetailPage;