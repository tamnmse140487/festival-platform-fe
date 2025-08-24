import React, { useState, useEffect } from "react";
import { File, Image, Download, Trash2, Eye, Calendar, User } from "lucide-react";
import { chatServices } from "../../services/chatServices";

const DocumentsTab = ({ groupId, user }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [statistics, setStatistics] = useState({});

  useEffect(() => {
    if (groupId) {
      fetchGroupFiles();
    }
  }, [groupId]);

  const fetchGroupFiles = async () => {
    try {
      setLoading(true);
      const response = await chatServices.getGroupFiles(groupId);

      if (response.success) {
        setFiles(response.data.files);
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error('Error fetching group files:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredFiles = files.filter(file => {
    if (activeTab === 'all') return true;
    return file.fileType === activeTab;
  });

  const getFileIcon = (fileType) => {
    return fileType === 'image' ? <Image size={20} /> : <File size={20} />;
  };

  const renderFileCard = (file) => (
    <div key={file.attachmentId} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className={`p-2 rounded-lg ${file.fileType === 'image' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
            {getFileIcon(file.fileType)}
          </div>

          <div className="flex-1 min-w-0 overflow-hidden">
            <h4 className="block text-sm font-medium text-gray-900 truncate break-all">
              {file.fileName}
            </h4>

            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
              <span className="flex items-center space-x-1">
                <Calendar size={12} />
                <span>{formatDate(file.uploadedAt)}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => window.open(file.fileUrl, '_blank')}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Xem file"
          >
            <Eye size={16} />
          </button>

          <a
            href={file.fileUrl}
            download={file.fileName}
            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
            title="Tải xuống"
            target="_blank"
          >
            <Download size={16} />
          </a>
        </div>
      </div>


      {file.fileType === 'image' && (
        <div className="mb-3">
          <img
            src={file.fileUrl}
            alt={file.fileName}
            className="w-full h-32 object-cover rounded-lg cursor-pointer"
            onClick={() => window.open(file.fileUrl, '_blank')}
          />
        </div>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex justify-between">
          <span>Kích thước:</span>
          <span className="font-medium">{formatFileSize(file.fileSize)}</span>
        </div>
        <div className="flex justify-between">
          <span>Loại:</span>
          <span className="font-medium capitalize">{file.fileType}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải danh sách tài liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <File className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng số file</p>
              <p className="text-2xl font-bold text-blue-600">{files.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Image className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Hình ảnh</p>
              <p className="text-2xl font-bold text-green-600">{statistics.totalImages || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <File className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tài liệu</p>
              <p className="text-2xl font-bold text-purple-600">{statistics.totalDocuments || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Tất cả ({files.length})
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'image'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Hình ảnh ({statistics.totalImages || 0})
        </button>
        <button
          onClick={() => setActiveTab('document')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'document'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Tài liệu ({statistics.totalDocuments || 0})
        </button>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'all' ? 'Chưa có tài liệu nào' :
              activeTab === 'image' ? 'Chưa có hình ảnh nào' : 'Chưa có tài liệu nào'}
          </h3>
          <p className="text-gray-600">
            Các file được chia sẻ trong chat sẽ xuất hiện ở đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map(renderFileCard)}
        </div>
      )}

      {files.length > 0 && (
        <div className="text-center text-sm text-gray-500 pt-4 border-t">
          Tổng dung lượng: {formatFileSize(statistics.totalSize || 0)}
        </div>
      )}
    </div>
  );
};

export default DocumentsTab;