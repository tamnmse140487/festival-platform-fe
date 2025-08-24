import React from 'react';
import { Edit2 } from 'lucide-react';

const FestivalWalletGrid = ({ festivalWallets, onEditWallet }) => {
  if (festivalWallets.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-md font-semibold text-gray-900">Ví phụ</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {festivalWallets.map((wallet) => (
          <div key={wallet.id} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-medium text-gray-900">{wallet.name}</h5>
              <button
                onClick={() => onEditWallet(wallet)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Edit2 size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">Lễ hội: {wallet.festivalName}</p>
            <p className="text-xl font-bold text-green-600">
              {wallet.balance.toLocaleString('vi-VN')} VND
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FestivalWalletGrid;