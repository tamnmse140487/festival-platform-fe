import React from 'react';
import { X } from 'lucide-react';
import Button from '../../../components/common/Button';

const EditWalletModal = ({
  show,
  onClose,
  editName,
  setEditName,
  onEdit,
  isProcessing
}) => {
  if (!show) return null;

  return (
    <div className="mt-0-important fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-semibold text-gray-900">Chỉnh sửa tên ví</h4>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên ví mới:
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Nhập tên ví mới"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button
              onClick={onEdit}
              disabled={!editName.trim() || isProcessing}
              className="flex-1"
            >
              {isProcessing ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditWalletModal;