import React, { useState, useEffect } from 'react';
import { Wallet, DollarSign, Plus, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';
import { walletServices } from '../../services/walletServices';
import { accountWalletHistoriesServices } from '../../services/accountWalletHistoryServices';
import { accountFestivalWalletsServices } from '../../services/accountFestivalWalletsServices';
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

      await fetchFestivalWallets();

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
    } finally {
    }
  }

  const fetchFestivalWallets = async () => {
    try {
      const response = await accountFestivalWalletsServices.get({
        accountId: user.id
      });

      const walletsWithFestival = await Promise.all(
        response.data.map(async (wallet) => {
          const festivalResponse = await festivalServices.get({
            festivalId: wallet.festivalId
          });
          return {
            ...wallet,
            festivalName: festivalResponse.data[0].festivalName || 'Unknown Festival'
          };

        })
      );

      setFestivalWallets(walletsWithFestival);
    } catch (error) {
      console.error('Error fetching festival wallets:', error);
      setFestivalWallets([]);
    }
  };

  const handleCreateWallet = async (festivalId, festivalName, walletName) => {
    try {
      setIsProcessing(true);

      const response = await accountFestivalWalletsServices.create({
        accountId: user.id,
        festivalId: festivalId,
        name: walletName
      });

      await accountWalletHistoriesServices.create({
        accountId: user.id,
        description: `Hệ thống đã tạo ví phụ cho lễ hội ${festivalName}`,
        type: HISTORY_TYPE.CREATE_SUB_WALLET,
        amount: 0
      });

      await fetchFestivalWallets();
      await fetchWalletData();

      toast.success('Tạo ví phụ thành công');
      setShowCreateWalletModal(false);

    } catch (error) {
      console.error('Error creating wallet:', error);
      toast.error('Có lỗi xảy ra khi tạo ví. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferAmount || !selectedFestivalWallet || !walletData.walletId) return;

    const amount = parseFloat(transferAmount);
    if (amount <= 0 || amount > walletData.balance) {
      toast.error('Số tiền không hợp lệ hoặc không đủ số dư');
      return;
    }

    try {
      setIsProcessing(true);

      await accountFestivalWalletsServices.transferToFestivalWallet({
        walletId: walletData.walletId,
        accountFestivalWalletId: selectedFestivalWallet.accountFestivalWalletId,
        amount: amount
      });

      await accountWalletHistoriesServices.create({
        accountId: user.id,
        description: `Chuyển ${amount} từ ví chính về ví ${selectedFestivalWallet.name}`,
        amount: amount,
        type: HISTORY_TYPE.TRANSFER
      });

      setWalletData(prev => ({
        ...prev,
        balance: prev.balance - amount
      }));

      setFestivalWallets(prev =>
        prev.map(wallet =>
          wallet.id === selectedFestivalWallet.id
            ? { ...wallet, balance: wallet.balance + amount }
            : wallet
        )
      );

      toast.success('Chuyển tiền thành công');
      setShowTransferModal(false);
      setTransferAmount('');
      setSelectedFestivalWallet(null);
      fetchHistory();

    } catch (error) {
      console.error('Error during transfer:', error);
      toast.error('Có lỗi xảy ra khi chuyển tiền. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReturnTransfer = async () => {
    if (!returnTransferAmount || !selectedReturnWallet || !walletData.walletId) return;

    const amount = parseFloat(returnTransferAmount);
    if (amount <= 0 || amount > selectedReturnWallet.balance) {
      toast.error('Số tiền không hợp lệ hoặc không đủ số dư');
      return;
    }

    try {
      setIsProcessing(true);

      await accountFestivalWalletsServices.transferToWallet({
        walletId: walletData.walletId,
        accountFestivalWalletId: selectedReturnWallet.accountFestivalWalletId,
        amount: amount
      });

      await accountWalletHistoriesServices.create({
        accountId: user.id,
        description: `Chuyển ${amount} từ ${selectedReturnWallet.name} về ví chính`,
        amount: amount,
        type: HISTORY_TYPE.RETURN_TRANSFER
      });

      setWalletData(prev => ({
        ...prev,
        balance: prev.balance + amount
      }));

      setFestivalWallets(prev =>
        prev.map(wallet =>
          wallet.id === selectedReturnWallet.id
            ? { ...wallet, balance: wallet.balance - amount }
            : wallet
        )
      );

      toast.success('Chuyển tiền về ví chính thành công');
      setShowReturnTransferModal(false);
      setReturnTransferAmount('');
      setSelectedReturnWallet(null);

      fetchHistory();

    } catch (error) {
      console.error('Error during return transfer:', error);
      toast.error('Có lỗi xảy ra khi chuyển tiền. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditWallet = async () => {
    if (!editName.trim() || !editingWallet) return;

    try {
      setIsProcessing(true);

      await accountFestivalWalletsServices.update({
        id: editingWallet.id,
        newName: editName.trim()
      });

      setFestivalWallets(prev =>
        prev.map(wallet =>
          wallet.id === editingWallet.id
            ? { ...wallet, name: editName.trim() }
            : wallet
        )
      );

      toast.success('Cập nhật tên ví thành công');
      setShowEditModal(false);
      setEditingWallet(null);
      setEditName('');

    } catch (error) {
      console.error('Error updating wallet:', error);
      toast.error('Có lỗi xảy ra khi cập nhật ví. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

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
          <Button
            onClick={() => setShowCreateWalletModal(true)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Tạo ví phụ</span>
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
            <div className="flex flex-col space-y-2">
              <Button
                onClick={() => setShowTransferModal(true)}
                variant="outline"
                className="text-red border-red hover:bg-white hover:text-blue-600"
                disabled={festivalWallets.length === 0}
              >
                <ArrowRight size={16} className="mr-2" />
                Chuyển tiền
              </Button>
              <Button
                onClick={() => setShowReturnTransferModal(true)}
                variant="outline"
                className="text-red border-red hover:bg-white hover:text-blue-600"
                disabled={festivalWallets.length === 0 || festivalWallets.every(w => w.balance === 0)}
              >
                <ArrowRight size={16} className="mr-2 rotate-180" />
                Về ví chính
              </Button>
            </div>
          </div>
        </div>
      </div>

      <FestivalWalletGrid
        festivalWallets={festivalWallets}
        onEditWallet={openEditModal}
      />

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

      <CreateWalletModal
        show={showCreateWalletModal}
        onClose={() => setShowCreateWalletModal(false)}
        onCreateWallet={handleCreateWallet}
        isProcessing={isProcessing}
      />

      <TransferModal
        show={showTransferModal}
        onClose={() => {
          setShowTransferModal(false);
          setTransferAmount('');
          setSelectedFestivalWallet(null);
        }}
        festivalWallets={festivalWallets}
        walletData={walletData}
        transferAmount={transferAmount}
        setTransferAmount={setTransferAmount}
        selectedFestivalWallet={selectedFestivalWallet}
        setSelectedFestivalWallet={setSelectedFestivalWallet}
        onTransfer={handleTransfer}
        isProcessing={isProcessing}
      />

      <ReturnTransferModal
        show={showReturnTransferModal}
        onClose={() => {
          setShowReturnTransferModal(false);
          setReturnTransferAmount('');
          setSelectedReturnWallet(null);
        }}
        festivalWallets={festivalWallets}
        returnTransferAmount={returnTransferAmount}
        setReturnTransferAmount={setReturnTransferAmount}
        selectedReturnWallet={selectedReturnWallet}
        setSelectedReturnWallet={setSelectedReturnWallet}
        onReturnTransfer={handleReturnTransfer}
        isProcessing={isProcessing}
      />

      <EditWalletModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingWallet(null);
          setEditName('');
        }}
        editName={editName}
        setEditName={setEditName}
        onEdit={handleEditWallet}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default WalletTab;