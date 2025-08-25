import React, { useState, useEffect } from 'react';
import { Wallet, DollarSign, Plus, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';
import { walletServices } from '../../services/walletServices';
import { accountWalletHistoriesServices } from '../../services/accountWalletHistoryServices';
import TransactionList from './TransactionList';
import TopupModal from './wallet/TopupModal';
import CreateWalletModal from './wallet/CreateWalletModal';
import TransferModal from './wallet/TransferModal';
import EditWalletModal from './wallet/EditWalletModal';
import ReturnTransferModal from './wallet/ReturnTransferModal';
import FestivalWalletGrid from './wallet/FestivalWalletGrid';
import toast from 'react-hot-toast';
import { festivalServices } from '../../services/festivalServices';
import { HISTORY_TYPE, PAYMENT_TYPE } from '../../utils/constants';

const WalletTab = ({ user }) => {
  const [walletData, setWalletData] = useState({
    balance: 0,
    walletId: null
  });
  const [transactions, setTransactions] = useState([]);
  const [festivalWallets, setFestivalWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showCreateWalletModal, setShowCreateWalletModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReturnTransferModal, setShowReturnTransferModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [returnTransferAmount, setReturnTransferAmount] = useState('');
  const [selectedFestivalWallet, setSelectedFestivalWallet] = useState(null);
  const [selectedReturnWallet, setSelectedReturnWallet] = useState(null);
  const [editingWallet, setEditingWallet] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchWalletData();
  }, [user?.id]);

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

  const fetchHistory = async () => {
    try {
      const historyResponse = await accountWalletHistoriesServices.get({
        accountId: user.id
      });
      setTransactions(historyResponse.data || []);

    } catch (error) {
      console.error('Error fetching history data:', error);
      console.error('Error updating wallet:', error);
      toast.error('Có lỗi xảy ra khi cập nhật ví. Vui lòng thử lại.');
    } finally {
    }
  }

  const openEditModal = (wallet) => {
    setEditingWallet(wallet);
    setEditName(wallet.name);
    setShowEditModal(true);
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
          <Button
            onClick={() => setShowTopupModal(true)}
            className="flex items-center space-x-2"
          >
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