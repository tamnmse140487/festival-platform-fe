import React, { useState, useEffect } from 'react';
import { Wallet, DollarSign } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { walletServices } from '../../services/walletServices';
import { accountWalletHistoriesServices } from '../../services/accountWalletHistoryServices';
import { paymentServices } from '../../services/paymentServices';
import TransactionList from './TransactionList';
import TopupModal from './wallet/TopupModal';
import toast from 'react-hot-toast';
import { HISTORY_TYPE } from '../../utils/constants';

const WalletTab = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [walletData, setWalletData] = useState({
    balance: 0,
    walletId: null,
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [handledReturn, setHandledReturn] = useState(false); 

  useEffect(() => {
    fetchWalletData();
  }, [user?.id]);

  useEffect(() => {
    const handleReturnParams = async () => {
      if (!user?.id || handledReturn) return;

      const urlParams = new URLSearchParams(location.search);
      const cancel = urlParams.get('cancel');
      const status = urlParams.get('status');
      const orderCode = urlParams.get('orderCode');

      if (cancel === 'true' && status !== 'CANCELLED' && orderCode) {
        try {
          const paymentResponse = await paymentServices.get({ walletId: orderCode });
          const payment = Array.isArray(paymentResponse?.data)
            ? paymentResponse.data[0]
            : paymentResponse?.data;

          const amountPaid = Number(payment?.amountPaid) || 0;
          if (!amountPaid) {
            toast.error('Không xác định được số tiền nạp.');
          } else {
            const description = `Bạn đã nạp ${amountPaid.toLocaleString('vi-VN')} VNĐ vào ví cá nhân`;
            const createRes = await accountWalletHistoriesServices.create({
              accountId: user.id,
              description,
              type: HISTORY_TYPE.TOPUP,
              amount: amountPaid,
            });

            const createdHistory = Array.isArray(createRes?.data)
              ? createRes.data[0]
              : createRes?.data || {
                  accountWalletHistoryId: Date.now(),
                  accountId: user.id,
                  description,
                  type: HISTORY_TYPE.TOPUP,
                  amount: amountPaid,
                  createdAt: new Date().toISOString(),
                };

            setTransactions((prev) => [createdHistory, ...prev]);

            const latestWallet = await walletServices.get({ userId: user.id });
            if (Array.isArray(latestWallet?.data) && latestWallet.data[0]) {
              setWalletData({
                balance: latestWallet.data[0].balance,
                walletId: latestWallet.data[0].walletId,
              });
            }

            toast.success('Nạp tiền thành công!');
          }
        } catch (err) {
          console.error('Handle return params error:', err);
          toast.error('Xử lý nạp tiền thất bại.');
        } finally {
          setHandledReturn(true);
          navigate({ pathname: location.pathname }, { replace: true });
        }
      }
    };

    handleReturnParams();
  }, [user?.id, location.search, handledReturn, navigate, location.pathname]);

  const fetchWalletData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      let walletResponse = await walletServices.get({ userId: user.id });
      if (!Array.isArray(walletResponse?.data) || walletResponse.data.length === 0) {
        const createResponse = await walletServices.create({
          accountId: user.id,
          balance: 0,
        });
        setWalletData({
          balance: 0,
          walletId: createResponse?.data?.walletId || null,
        });
      } else {
        setWalletData({
          balance: walletResponse.data[0].balance,
          walletId: walletResponse.data[0].walletId,
        });
      }

      const historyResponse = await accountWalletHistoriesServices.get({
        accountId: user.id,
      });

      setTransactions(historyResponse?.data || []);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Không thể tải dữ liệu ví.');
    } finally {
      setLoading(false);
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quản lý ví cá nhân</h3>
        <div className="flex space-x-2">
          <Button onClick={() => setShowTopupModal(true)} className="flex items-center space-x-2">
            <DollarSign size={16} />
            <span>Nạp tiền</span>
          </Button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Ví chính - Số dư hiện tại</p>
            <p className="text-3xl font-bold">
              {walletData.balance.toLocaleString('vi-VN')} VND
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Wallet className="w-12 h-12 text-blue-200" />
          </div>
        </div>
      </div>

      <TransactionList transactions={transactions} />

      <TopupModal
        show={showTopupModal}
        onClose={() => {
          setShowTopupModal(false);
          setSelectedAmount(null);
        }}
        user={user}
        walletData={walletData}
        selectedAmount={selectedAmount}
        setSelectedAmount={setSelectedAmount}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />
    </div>
  );
};

export default WalletTab;