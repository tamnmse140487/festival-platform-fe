import React, { useState, useEffect } from 'react';
import { Wallet, DollarSign, CreditCard, Calendar } from 'lucide-react';
import Button from '../../components/common/Button';
import { walletServices } from '../../services/walletServices';
import { accountWalletHistoriesServices } from '../../services/accountWalletHistoryServices'; 
import TransactionList from './TransactionList';

const WalletTab = ({ user }) => {
  const [walletData, setWalletData] = useState({
    balance: 0,
    walletId: null
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        
        let walletResponse = await walletServices.get({ userId: user.id });
        console.log("walletResponse: ", walletResponse)
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
        <Button className="flex items-center justify-center space-x-2">
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
    </div>
  );
};

export default WalletTab;