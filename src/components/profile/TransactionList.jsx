import React from "react";
import {
  DollarSign,
  CreditCard,
  Wallet,
  Plus,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
} from "lucide-react";
import { convertToVietnamTimeWithFormat } from "../../utils/formatters";
import { HISTORY_TYPE } from "../../utils/constants";

const TransactionList = ({ transactions }) => {
  const getTransactionIcon = (type) => {
    switch (type) {
      case HISTORY_TYPE.TOPUP:
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case HISTORY_TYPE.REFUND:
        return <RefreshCw className="w-5 h-5 text-red-600" />;
      case HISTORY_TYPE.CREATE_SUB_WALLET:
        return <Plus className="w-5 h-5 text-purple-600" />;
      case HISTORY_TYPE.TRANSFER:
        return <ArrowUpRight className="w-5 h-5 text-orange-600" />;
      case HISTORY_TYPE.RETURN_TRANSFER:
        return <ArrowDownLeft className="w-5 h-5 text-indigo-600" />;
      case HISTORY_TYPE.PAYMENT:
        return <CreditCard className="w-5 h-5 text-red-600" />;
      case HISTORY_TYPE.COMMISSION:
        return <TrendingUp className="w-5 h-5 text-emerald-600" />;
      default:
        return <Wallet className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type, amount) => {
    switch (type) {
      case HISTORY_TYPE.CREATE_SUB_WALLET:
        return "text-purple-600";
      case HISTORY_TYPE.TOPUP:
      case HISTORY_TYPE.RETURN_TRANSFER:
      case HISTORY_TYPE.COMMISSION:
        return "text-green-600";
      case HISTORY_TYPE.TRANSFER:
      case HISTORY_TYPE.PAYMENT:
        return "text-red-600";
      default:
        return amount > 0 ? "text-green-600" : "text-red-600";
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case HISTORY_TYPE.TOPUP:
        return "bg-green-100";
      case HISTORY_TYPE.REFUND:
        return "bg-red-100";
      case HISTORY_TYPE.CREATE_SUB_WALLET:
        return "bg-purple-100";
      case HISTORY_TYPE.TRANSFER:
        return "bg-orange-100";
      case HISTORY_TYPE.RETURN_TRANSFER:
        return "bg-indigo-100";
      case HISTORY_TYPE.PAYMENT:
        return "bg-red-100";
      case HISTORY_TYPE.COMMISSION:
        return "bg-emerald-100";
      default:
        return "bg-gray-100";
    }
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case HISTORY_TYPE.TOPUP:
        return "Nạp tiền";
      case HISTORY_TYPE.REFUND:
        return "Hoàn tiền";
      case HISTORY_TYPE.CREATE_SUB_WALLET:
        return "Tạo ví con";
      case HISTORY_TYPE.TRANSFER:
        return "Chuyển tiền";
      case HISTORY_TYPE.RETURN_TRANSFER:
        return "Nhận tiền";
      case HISTORY_TYPE.PAYMENT:
        return "Thanh toán";
      case HISTORY_TYPE.COMMISSION:
        return "Hoa hồng";
      default:
        return "Giao dịch";
    }
  };

  const shouldShowAmount = (type) => {
    return type !== HISTORY_TYPE.CREATE_SUB_WALLET;
  };

  const getAmountDisplay = (transaction) => {
    const { type, amount } = transaction;

    if (
      [
        HISTORY_TYPE.PAYMENT,
        HISTORY_TYPE.TRANSFER,
        HISTORY_TYPE.REFUND,
      ].includes(type)
    ) {
      return `-${Math.abs(amount).toLocaleString("vi-VN")} VND`;
    }

    if (
      [
        HISTORY_TYPE.TOPUP,
        HISTORY_TYPE.RETURN_TRANSFER,
        HISTORY_TYPE.COMMISSION,
      ].includes(type)
    ) {
      return `+${Math.abs(amount).toLocaleString("vi-VN")} VND`;
    }

    const sign = amount > 0 ? "+" : "";
    return `${sign}${amount.toLocaleString("vi-VN")} VND`;
  };

  const getStatusBadge = (type) => {
    const typeLabel = getTransactionTypeLabel(type);
    const colorClasses = {
      [HISTORY_TYPE.TOPUP]: "bg-green-50 text-green-700 border-green-200",
      [HISTORY_TYPE.REFUND]: "bg-red-50 text-red-700 border-red-200",
      [HISTORY_TYPE.CREATE_SUB_WALLET]:
        "bg-purple-50 text-purple-700 border-purple-200",
      [HISTORY_TYPE.TRANSFER]: "bg-orange-50 text-orange-700 border-orange-200",
      [HISTORY_TYPE.RETURN_TRANSFER]:
        "bg-indigo-50 text-indigo-700 border-indigo-200",
      [HISTORY_TYPE.PAYMENT]: "bg-red-50 text-red-700 border-red-200",
      [HISTORY_TYPE.COMMISSION]:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full border ${
          colorClasses[type] || "bg-gray-50 text-gray-700 border-gray-200"
        }`}
      >
        {typeLabel}
      </span>
    );
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (!transactions.length) {
    return (
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Lịch sử giao dịch
        </h4>
        <div className="text-center py-8 text-gray-500">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Chưa có giao dịch nào</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">
        Lịch sử giao dịch
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({transactions.length} giao dịch)
        </span>
      </h4>
      <div className="space-y-3">
        {sortedTransactions.map((transaction) => (
          <div
            key={transaction.historyId}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${getBackgroundColor(
                  transaction.type
                )}`}
              >
                {getTransactionIcon(transaction.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-900">
                    {transaction.description}
                  </p>
                  {getStatusBadge(transaction.type)}
                </div>
                <p className="text-sm text-gray-500">
                  {convertToVietnamTimeWithFormat(transaction.createdAt)}
                </p>
                {transaction.note && (
                  <p className="text-xs text-gray-400 mt-1 italic">
                    {transaction.note}
                  </p>
                )}
              </div>
            </div>
            {shouldShowAmount(transaction.type) && (
              <div
                className={`text-lg font-semibold ${getTransactionColor(
                  transaction.type,
                  transaction.amount
                )}`}
              >
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
