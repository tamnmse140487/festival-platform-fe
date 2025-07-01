import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { mockFestivals } from '../../data/mockData';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import BoothForm from '../../components/booths/BoothForm';

const CreateBoothPage = () => {
  const navigate = useNavigate();
  const { festivalId } = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const festival = mockFestivals.find(f => f.id === parseInt(festivalId));

  const availableLocations = [
    { id: 1, location_name: 'Khu A - Vị trí 01', location_type: 'food', is_occupied: false },
    { id: 2, location_name: 'Khu A - Vị trí 02', location_type: 'food', is_occupied: true },
    { id: 3, location_name: 'Khu A - Vị trí 03', location_type: 'food', is_occupied: false },
    { id: 4, location_name: 'Khu B - Vị trí 01', location_type: 'beverage', is_occupied: false },
    { id: 5, location_name: 'Khu B - Vị trí 02', location_type: 'beverage', is_occupied: false },
    { id: 6, location_name: 'Khu C - Vị trí 01', location_type: 'other', is_occupied: false },
  ];

  if (!festival) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy lễ hội</h2>
        <Button onClick={() => navigate('/festivals')} className="mt-4">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    
    try {
      const boothData = {
        ...formData,
        festival_id: festival.id,
        user_id: user.id,
        status: 'pending',
        registration_date: new Date().toISOString()
      };

      console.log('Creating booth:', boothData);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Đăng ký gian hàng thành công! Chờ phê duyệt.');
      navigate('/booths');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đăng ký gian hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/festivals');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/festivals')}
          icon={<ArrowLeft size={20} />}
        >
          Quay lại
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Đăng ký gian hàng</h1>
          <p className="text-gray-600 mt-1">
            Đăng ký gian hàng cho lễ hội "{festival.festival_name}"
          </p>
        </div>
      </div>

      <Card>
        <Card.Content>
          <div className="flex items-start space-x-4">
            <img 
              src={festival.image_url} 
              alt={festival.festival_name}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{festival.festival_name}</h3>
              <p className="text-gray-600 mb-2">{festival.theme}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <MapPin size={14} className="mr-1" />
                  <span>{festival.location}</span>
                </div>
                <span>
                  {new Date(festival.start_date).toLocaleDateString('vi-VN')} - 
                  {new Date(festival.end_date).toLocaleDateString('vi-VN')}
                </span>
                <span>
                  {festival.stats.registered_booths}/{festival.max_booths} gian hàng
                </span>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Content>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Trạng thái đăng ký</h3>
              <p className="text-gray-600">
                Thời gian đăng ký: {new Date(festival.registration_start_date).toLocaleDateString('vi-VN')} - 
                {new Date(festival.registration_end_date).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Đang mở đăng ký
              </span>
            </div>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Thông tin đăng ký gian hàng</Card.Title>
          <Card.Description>
            Vui lòng điền đầy đủ thông tin để đăng ký gian hàng
          </Card.Description>
        </Card.Header>
        
        <Card.Content>
          <BoothForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
            availableLocations={availableLocations}
            festival={festival}
          />
        </Card.Content>
      </Card>
    </div>
  );
};

export default CreateBoothPage;