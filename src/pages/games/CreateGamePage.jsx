import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, GamepadIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { mockBooths } from '../../data/mockData';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import GameForm from '../../components/games/GameForm';

const CreateGamePage = () => {
  const navigate = useNavigate();
  const { boothId } = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const booth = mockBooths.find(b => b.id === parseInt(boothId));

  if (!booth) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy gian hàng</h2>
        <Button onClick={() => navigate('/booths')} className="mt-4">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    
    try {
      const gameData = {
        ...formData,
        booth_id: booth.id,
        created_by: user.id,
        status: 'active',
        created_at: new Date().toISOString()
      };

      console.log('Creating game:', gameData);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Tạo mini game thành công!');
      navigate('/games');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo game');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/games');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/games')}
          icon={<ArrowLeft size={20} />}
        >
          Quay lại
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tạo Mini Game</h1>
          <p className="text-gray-600 mt-1">
            Tạo game tương tác cho gian hàng "{booth.booth_name}"
          </p>
        </div>
      </div>

      <Card>
        <Card.Content>
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              <GamepadIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{booth.booth_name}</h3>
              <p className="text-gray-600 mb-2">{booth.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Nhóm: {booth.group.group_name}</span>
                <span>Loại: {booth.booth_type}</span>
                <span>Vị trí: {booth.location.location_name}</span>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Hướng dẫn tạo game</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Mục đích của Mini Game:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Tăng tương tác với khách hàng</li>
                <li>• Quảng bá sản phẩm của gian hàng</li>
                <li>• Tạo trải nghiệm thú vị cho người tham gia</li>
                <li>• Thưởng điểm tích lũy cho khách hàng</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Lưu ý khi tạo game:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Câu hỏi nên liên quan đến sản phẩm</li>
                <li>• Thời gian hợp lý (3-5 phút)</li>
                <li>• Điểm thưởng không quá cao</li>
                <li>• Nội dung phù hợp với mọi lứa tuổi</li>
              </ul>
            </div>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Thông tin mini game</Card.Title>
          <Card.Description>
            Thiết lập thông tin và câu hỏi cho mini game của bạn
          </Card.Description>
        </Card.Header>
        
        <Card.Content>
          <GameForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
            boothId={booth.id}
          />
        </Card.Content>
      </Card>
    </div>
  );
};

export default CreateGamePage;