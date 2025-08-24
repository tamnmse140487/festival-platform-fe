import React from 'react';
import { X } from 'lucide-react';
import Button from '../../../components/common/Button';

const TransferModal = ({
  show,
  onClose,
  festivalWallets,
  walletData,
  transferAmount,
  setTransferAmount,
  selectedFestivalWallet,
  setSelectedFestivalWallet,
  onTransfer,
  isProcessing
}) => {
  if (!show) return null;

  return (
    <div className="mt-0-important fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-semibold text-gray-900">Chuyển tiền đến ví phụ</h4>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn ví phụ:
            </label>
            <div className="space-y-2">
              {festivalWallets.map((wallet) => (
                <button
                  key={wallet.accountFestivalWalletId}
                  onClick={() => setSelectedFestivalWallet(wallet)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    selectedFestivalWallet?.accountFestivalWalletId === wallet.accountFestivalWalletId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{wallet.name}</div>
                  <div className="text-sm text-gray-600">{wallet.festivalName}</div>
                  <div className="text-sm font-medium text-green-600">
                    {wallet.balance.toLocaleString('vi-VN')} VND
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số tiền chuyển:
            </label>
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="Nhập số tiền"
              max={walletData.balance}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Số dư khả dụng: {walletData.balance.toLocaleString('vi-VN')} VND
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button
              onClick={onTransfer}
              disabled={!transferAmount || !selectedFestivalWallet || isProcessing}
              className="flex-1"
            >
              {isProcessing ? 'Đang chuyển...' : 'Xác nhận chuyển'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;