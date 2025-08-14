import React from 'react';
import { DollarSign, CreditCard, Wallet, Plus, TrendingUp } from 'lucide-react';
import { convertToVietnamTimeWithFormat } from '../../utils/formatters';
import { HISTORY_TYPE } from '../../utils/constants';

const TransactionList = ({ transactions }) => {
  const getTransactionIcon = (type) => {
    switch (type) {
      case HISTORY_TYPE.TOPUP:
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case HISTORY_TYPE.REFUND:
        return <DollarSign className="w-5 h-5 text-blue-600" />;
      case HISTORY_TYPE.CREATE_SUB_WALLET:
        return <Plus className="w-5 h-5 text-purple-600" />;
      case HISTORY_TYPE.PAYMENT:
        return <CreditCard className="w-5 h-5 text-red-600" />;
      case HISTORY_TYPE.COMMISSION:
        return <TrendingUp className="w-5 h-5 text-orange-600" />;
      default:
        return <Wallet className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type, amount) => {
    if (type === HISTORY_TYPE.CREATE_SUB_WALLET) return 'text-purple-600';
    if (type === HISTORY_TYPE.COMMISSION) return 'text-orange-600';
    if (amount > 0) return 'text-green-600';
    return 'text-red-600';
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case HISTORY_TYPE.TOPUP:
        return 'bg-green-100';
      case HISTORY_TYPE.REFUND:
        return 'bg-blue-100';
      case HISTORY_TYPE.CREATE_SUB_WALLET:
        return 'bg-purple-100';
      case HISTORY_TYPE.PAYMENT:
        return 'bg-red-100';
      case HISTORY_TYPE.COMMISSION:
        return 'bg-orange-100';
      default:
        return 'bg-gray-100';
    }
  };

  const shouldShowAmount = (type) => {
    return type !== HISTORY_TYPE.CREATE_SUB_WALLET;
  };

  const getAmountDisplay = (transaction) => {
    const { type, amount } = transaction;
    
    if (type === HISTORY_TYPE.PAYMENT) {
      return `-${Math.abs(amount).toLocaleString('vi-VN')} VND`;
    }
    
    if (type === HISTORY_TYPE.COMMISSION) {
      return `+${Math.abs(amount).toLocaleString('vi-VN')} VND`;
    }
    
    const sign = amount > 0 ? '+' : '';
    return `${sign}${amount.toLocaleString('vi-VN')} VND`;
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (!transactions.length) {
    return (
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Lịch sử giao dịch</h4>
        <div className="text-center py-8 text-gray-500">
          Chưa có giao dịch nào
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">Lịch sử giao dịch</h4>
      <div className="space-y-3">
        {sortedTransactions.map((transaction) => (
          <div key={transaction.historyId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getBackgroundColor(transaction.type)}`}>
                {getTransactionIcon(transaction.type)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{transaction.description}</p>
                <p className="text-sm text-gray-500">{convertToVietnamTimeWithFormat(transaction.createdAt)}</p>
              </div>
            </div>
            {shouldShowAmount(transaction.type) && (
              <div className={`text-lg font-semibold ${getTransactionColor(transaction.type, transaction.amount)}`}>
                {getAmountDisplay(transaction)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;