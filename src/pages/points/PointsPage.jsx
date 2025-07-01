import React, { useState } from 'react';
import { Star, TrendingUp, Gift, ArrowUpCircle, ArrowDownCircle, Calendar, GamepadIcon, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mockPointsTransactions } from '../../data/mockData';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';

const PointsPage = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('balance');
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const currentBalance = 1250;
  const totalEarned = 2150;
  const totalSpent = 900;

  const recentTransactions = mockPointsTransactions.slice(0, 10);

  const rewardItems = [
    { id: 1, name: 'Voucher 50k', points: 500, description: 'Giảm giá 50.000đ cho đơn hàng từ 200k', image: '/api/placeholder/100/100' },
    { id: 2, name: 'Combo bánh mì', points: 100, description: 'Bánh mì thịt nướng + nước ngọt', image: '/api/placeholder/100/100' },
    { id: 3, name: 'Cà phê miễn phí', points: 80, description: 'Ly cà phê bất kỳ tại gian hàng Coffee Lovers', image: '/api/placeholder/100/100' },
    { id: 4, name: 'Sticker Festival', points: 20, description: 'Bộ sticker kỷ niệm lễ hội', image: '/api/placeholder/100/100' },
  ];

  const tabs = [
    { id: 'balance', label: 'Số dư', icon: <Star size={16} /> },
    { id: 'history', label: 'Lịch sử', icon: <Calendar size={16} /> },
    { id: 'rewards', label: 'Đổi quà', icon: <Gift size={16} /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Điểm tích lũy</h1>
          <p className="text-gray-600 mt-1">
            Quản lý điểm tích lũy và đổi quà hấp dẫn!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-2">
          <Card.Content>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Số dư hiện tại</p>
                <p className="text-4xl font-bold text-blue-600">{currentBalance.toLocaleString()}</p>
                <p className="text-sm text-gray-500">điểm</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                onClick={() => setShowRedeemModal(true)}
                icon={<Gift size={16} />}
              >
                Đổi quà
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowTransferModal(true)}
                icon={<ArrowUpCircle size={16} />}
              >
                Chuyển điểm
              </Button>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng tích lũy</p>
                <p className="text-2xl font-bold text-gray-900">{totalEarned.toLocaleString()}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã sử dụng</p>
                <p className="text-2xl font-bold text-gray-900">{totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      <Card>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <Card.Content>
          {selectedTab === 'balance' && <BalanceTab />}
          {selectedTab === 'history' && <HistoryTab transactions={recentTransactions} />}
          {selectedTab === 'rewards' && <RewardsTab rewards={rewardItems} />}
        </Card.Content>
      </Card>

      <Modal
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
        title="Đổi điểm lấy quà"
        size="md"
      >
        <RedeemModal onClose={() => setShowRedeemModal(false)} />
      </Modal>

      <Modal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        title="Chuyển điểm"
        size="md"
      >
        <TransferModal onClose={() => setShowTransferModal(false)} />
      </Modal>
    </div>
  );
};

const BalanceTab = () => {
  const earningSources = [
    { source: 'Chơi mini games', points: 850, percentage: 68 },
    { source: 'Mua sắm tại gian hàng', points: 300, percentage: 24 },
    { source: 'Tham gia sự kiện', points: 100, percentage: 8 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Nguồn tích điểm</h3>
        <div className="space-y-4">
          {earningSources.map((source, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{source.source}</span>
                  <span className="text-sm font-semibold text-gray-900">{source.points} điểm</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cách kiếm điểm</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-2">
              <GamepadIcon className="w-5 h-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-900">Chơi Mini Games</span>
            </div>
            <p className="text-sm text-blue-700">Tham gia các trò chơi tại gian hàng để nhận điểm thưởng</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center mb-2">
              <ShoppingCart className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium text-green-900">Mua sắm</span>
            </div>
            <p className="text-sm text-green-700">Mỗi 1.000đ mua sắm = 1 điểm tích lũy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const HistoryTab = ({ transactions }) => {
  const getTransactionIcon = (type) => {
    return type === 'earned' ? (
      <ArrowUpCircle className="w-5 h-5 text-green-600" />
    ) : (
      <ArrowDownCircle className="w-5 h-5 text-red-600" />
    );
  };

  const getTransactionColor = (type) => {
    return type === 'earned' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Lịch sử giao dịch</h3>
        <select className="px-3 py-1 border border-gray-300 rounded text-sm">
          <option>7 ngày qua</option>
          <option>30 ngày qua</option>
          <option>3 tháng qua</option>
        </select>
      </div>

      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              {getTransactionIcon(transaction.transaction_type)}
              <div>
                <p className="font-medium text-gray-900">{transaction.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.transaction_date).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
            <div className={`text-right font-semibold ${getTransactionColor(transaction.transaction_type)}`}>
              {transaction.transaction_type === 'earned' ? '+' : ''}{transaction.points_amount} điểm
            </div>
          </div>
        ))}
      </div>

      {transactions.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">Chưa có giao dịch nào</p>
        </div>
      )}
    </div>
  );
};

const RewardsTab = ({ rewards }) => {
  const currentBalance = 1250;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quà tặng có thể đổi</h3>
        <p className="text-sm text-gray-600">Số dư: <span className="font-semibold text-blue-600">{currentBalance} điểm</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rewards.map((reward) => (
          <div key={reward.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <img 
                src={reward.image} 
                alt={reward.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{reward.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-600">{reward.points} điểm</span>
                  <Button 
                    size="sm"
                    disabled={currentBalance < reward.points}
                    variant={currentBalance >= reward.points ? 'primary' : 'outline'}
                  >
                    {currentBalance >= reward.points ? 'Đổi ngay' : 'Không đủ điểm'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RedeemModal = ({ onClose }) => {
  const [selectedReward, setSelectedReward] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickRedeemOptions = [
    { value: 'voucher50', label: 'Voucher 50k', points: 500 },
    { value: 'combo_banh_mi', label: 'Combo bánh mì', points: 100 },
    { value: 'cafe_free', label: 'Cà phê miễn phí', points: 80 },
    { value: 'sticker', label: 'Sticker Festival', points: 20 }
  ];

  const handleRedeem = async () => {
    if (!selectedReward) return;
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Đổi điểm lấy quà</h3>
        <p className="text-gray-600">Chọn phần quà bạn muốn đổi</p>
      </div>

      <div className="space-y-3">
        {quickRedeemOptions.map((option) => (
          <label 
            key={option.value}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                name="reward"
                value={option.value}
                checked={selectedReward === option.value}
                onChange={(e) => setSelectedReward(e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium text-gray-900">{option.label}</span>
            </div>
            <span className="text-blue-600 font-semibold">{option.points} điểm</span>
          </label>
        ))}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Hủy
        </Button>
        <Button 
          onClick={handleRedeem}
          disabled={!selectedReward}
          loading={isLoading}
        >
          Xác nhận đổi
        </Button>
      </div>
    </div>
  );
};

const TransferModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleTransfer = async () => {
    if (!formData.recipient || !formData.amount) return;
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ArrowUpCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Chuyển điểm</h3>
        <p className="text-gray-600">Chia sẻ điểm với bạn bè</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email người nhận
          </label>
          <input
            type="email"
            placeholder="Nhập email..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.recipient}
            onChange={(e) => handleChange('recipient', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số điểm
          </label>
          <input
            type="number"
            placeholder="Nhập số điểm..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            min="1"
            max="1250"
          />
          <p className="text-xs text-gray-500 mt-1">Tối đa 1,250 điểm</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lời nhắn (tùy chọn)
          </label>
          <textarea
            rows={3}
            placeholder="Nhập lời nhắn..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Hủy
        </Button>
        <Button 
          onClick={handleTransfer}
          disabled={!formData.recipient || !formData.amount}
          loading={isLoading}
        >
          Chuyển điểm
        </Button>
      </div>
    </div>
  );
};

export default PointsPage;