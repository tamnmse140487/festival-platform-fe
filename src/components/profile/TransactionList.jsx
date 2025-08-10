import React from 'react';
import { DollarSign, CreditCard } from 'lucide-react';

const TransactionList = ({ transactions }) => {
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'payment':
        return <CreditCard className="w-5 h-5 text-red-600" />;
      case 'refund':
        return <DollarSign className="w-5 h-5 text-blue-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type, amount) => {
    if (amount > 0) return 'text-green-600';
    return 'text-red-600';
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-100';
      case 'payment':
        return 'bg-red-100';
      case 'refund':
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

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
        {transactions.map((transaction) => (
          <div key={transaction.historyId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getBackgroundColor(transaction.type)}`}>
                {getTransactionIcon(transaction.type)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{transaction.description}</p>
                <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
              </div>
            </div>
            <div className={`text-lg font-semibold ${getTransactionColor(transaction.type, transaction.amount)}`}>
              {transaction?.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('vi-VN')} VND
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;