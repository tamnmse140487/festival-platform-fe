import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../../components/common/Button';
import { festivalServices } from '../../../services/festivalServices';
import { FESTIVAL_STATUS } from '../../../utils/constants';
import toast from 'react-hot-toast';
import { getFestivalStatusBadge } from '../../../utils/helpers';

const CreateWalletModal = ({ show, onClose, onCreateWallet, isProcessing }) => {
  const [festivals, setFestivals] = useState([]);
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [walletName, setWalletName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      fetchFestivals();
    }
  }, [show]);

  const fetchFestivals = async () => {
    try {
      setLoading(true);
      const response = await festivalServices.get({
        status: FESTIVAL_STATUS.PUBLISHED
      });

      setFestivals(response.data || []);
    } catch (error) {
      console.error('Error fetching festivals:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách lễ hội');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedFestival || !walletName.trim()) {
      toast.error('Vui lòng chọn lễ hội và nhập tên ví');
      return;
    }

    await onCreateWallet(selectedFestival.festivalId, selectedFestival.festivalName, walletName.trim());

    setSelectedFestival(null);
    setWalletName('');
  };

  const handleClose = () => {
    setSelectedFestival(null);
    setWalletName('');
    onClose();
  };

  if (!show) return null;

  return (
    <div className="mt-0-important fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-semibold text-gray-900">Tạo ví phụ</h4>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên ví:
            </label>
            <input
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder="Nhập tên ví"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn lễ hội:
            </label>
            {loading ? (
              <div className="text-center py-4 text-gray-500">Đang tải...</div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {festivals.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    Không có lễ hội nào đang mở
                  </div>
                ) : (
                  festivals.map((festival) => (
                    <button
                      key={festival.festivalId}
                      onClick={() => setSelectedFestival(festival)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${selectedFestival?.festivalId === festival.festivalId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="font-medium">{festival.festivalName}</div>
                      <div className="text-sm text-gray-600">
                        Trạng thái:  {getFestivalStatusBadge(festival.status)}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Hủy
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!selectedFestival || !walletName.trim() || isProcessing || loading}
              className="flex-1"
            >
              {isProcessing ? 'Đang tạo...' : 'Tạo ví'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWalletModal;