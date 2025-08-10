import React, { useState, useEffect } from 'react';
import { Wallet, DollarSign, CreditCard, Calendar, X } from 'lucide-react';
import Button from '../../components/common/Button';
import { walletServices } from '../../services/walletServices';
import { accountWalletHistoriesServices } from '../../services/accountWalletHistoryServices';
import { paymentServices } from '../../services/paymentServices';
import { PAYMENT_METHOD, PAYMENT_TYPE, TOPUP_PACKAGES } from '../../utils/constants';
import TransactionList from './TransactionList';
import toast from 'react-hot-toast';

const WalletTab = ({ user }) => {
  const [walletData, setWalletData] = useState({
    balance: 0,
    walletId: null
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);


  useEffect(() => {
    const fetchWalletData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        let walletResponse = await walletServices.get({ userId: user.id });
        if (walletResponse.data.length === 0) {
          const createResponse = await walletServices.create({
            accountId: user.id,
            balance: 0
          });
          setWalletData({
            balance: 0,
            walletId: createResponse.data.walletId
          });
        } else {
          setWalletData({
            balance: walletResponse.data[0].balance,
            walletId: walletResponse.data[0].walletId
          });
        }

        const historyResponse = await accountWalletHistoriesServices.get({
          accountId: user.id
        });
        setTransactions(historyResponse.data || []);

      } catch (error) {
        console.error('Error fetching wallet data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [user?.id]);

  const generateOrderId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  };

  const handleTopup = async () => {
    if (!selectedAmount || !walletData.walletId) return;

    try {
      setIsProcessing(true);

      const orderId = generateOrderId();
      const paymentData = {
        orderId: orderId,
        walletId: walletData.walletId,
        paymentMethod: PAYMENT_METHOD.BANK,
        paymentType: PAYMENT_TYPE.TOPUP,
        amountPaid: selectedAmount,
        description: 'Nap vi'
      };

      const paymentResponse = await paymentServices.create(paymentData);

      await accountWalletHistoriesServices.create({
        accountId: user.id,
        description: `Bạn đã nạp ${selectedAmount.toLocaleString('vi-VN')} VNĐ vào ví cá nhân`,
        type: PAYMENT_TYPE.TOPUP,
        amount: selectedAmount
      });

      const checkoutUrl = paymentResponse.data?.checkoutUrl

      if (checkoutUrl) {
        window.location.href = checkoutUrl
        toast.success('Tạo link thanh toán thành công')
      } else {
        toast.success('Tạo thanh toán thành công')
      }

    } catch (error) {
      console.error('Error during topup:', error);
      toast.error('Có lỗi xảy ra khi nạp tiền. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Quản lý ví cá nhân</h3>

      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Số dư hiện tại</p>
            <p className="text-3xl font-bold">
              {walletData.balance.toLocaleString('vi-VN')} VND
            </p>
          </div>
          <Wallet className="w-12 h-12 text-blue-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          className="flex items-center justify-center space-x-2"
          onClick={() => setShowTopupModal(true)}
        >
          <DollarSign size={20} />
          <span>Nạp tiền</span>
        </Button>
        <Button variant="outline" className="flex items-center justify-center space-x-2">
          <CreditCard size={20} />
          <span>Rút tiền</span>
        </Button>
        <Button variant="outline" className="flex items-center justify-center space-x-2">
          <Calendar size={20} />
          <span>Lịch sử</span>
        </Button>
      </div>

      <TransactionList transactions={transactions} />

      {showTopupModal && (
        <div className="mt-0-important fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-semibold text-gray-900">Nạp tiền vào ví</h4>
              <button
                onClick={() => {
                  setShowTopupModal(false);
                  setSelectedAmount(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">Chọn số tiền muốn nạp:</p>

              <div className="grid grid-cols-2 gap-3">
                {TOPUP_PACKAGES.map((pkg) => (
                  <button
                    key={pkg.value}
                    onClick={() => setSelectedAmount(pkg.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${selectedAmount === pkg.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    {pkg.label}
                  </button>
                ))}
              </div>

              {selectedAmount && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Số tiền nạp:</span>
                    <span className="font-semibold">
                      {selectedAmount.toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Phương thức:</span>
                    <span className="text-blue-600">Chuyển khoản ngân hàng</span>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowTopupModal(false);
                    setSelectedAmount(null);
                  }}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleTopup}
                  disabled={!selectedAmount || isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? 'Đang xử lý...' : 'Xác nhận nạp tiền'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletTab;