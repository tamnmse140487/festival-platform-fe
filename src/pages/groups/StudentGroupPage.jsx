import React, { useState } from 'react';
import { Plus, Search, Users, DollarSign, Calendar, Eye, Edit, UserPlus, MessageCircle, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { mockStudentGroups } from '../../data/mockData';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';

const StudentGroupPage = () => {
  const { user, hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredGroups = mockStudentGroups.filter(group => {
    const matchesSearch = group.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.class_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || group.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (group) => {
    setSelectedGroup(group);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Nhóm học sinh</h1>
          <p className="text-gray-600 mt-1">
            {hasRole(['school_manager']) 
              ? 'Quản lý tất cả nhóm học sinh trong trường.' 
              : 'Quản lý các nhóm học sinh được phân công.'
            }
          </p>
        </div>
        
        {hasRole(['school_manager', 'teacher']) && (
          <Button 
            icon={<Plus size={20} />}
            onClick={() => setShowCreateModal(true)}
          >
            Tạo nhóm mới
          </Button>
        )}
      </div>

      <Card>
        <Card.Content>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Tìm kiếm nhóm..."
                  leftIcon={<Search size={20} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Tạm dừng</option>
              </select>
            </div>
          </div>

          {filteredGroups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy nhóm nào</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.' 
                  : 'Chưa có nhóm học sinh nào được tạo.'
                }
              </p>
              {hasRole(['school_manager', 'teacher']) && (
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  icon={<Plus size={16} />}
                >
                  Tạo nhóm đầu tiên
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredGroups.map(group => (
                <GroupCard 
                  key={group.id} 
                  group={group} 
                  onViewDetails={handleViewDetails}
                  hasManagePermission={hasRole(['school_manager', 'teacher'])}
                />
              ))}
            </div>
          )}
        </Card.Content>
      </Card>

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Chi tiết nhóm học sinh"
        size="lg"
      >
        {selectedGroup && (
          <GroupDetailModal 
            group={selectedGroup} 
            onClose={() => setShowDetailModal(false)}
          />
        )}
      </Modal>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Tạo nhóm học sinh mới"
        size="md"
      >
        <CreateGroupForm onClose={() => setShowCreateModal(false)} />
      </Modal>
    </div>
  );
};

const GroupCard = ({ group, onViewDetails, hasManagePermission }) => {
  const getStatusBadge = (status) => {
    return status === 'active' ? (
      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
        Đang hoạt động
      </span>
    ) : (
      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
        Tạm dừng
      </span>
    );
  };

  const getBoothStatusBadge = (status) => {
    const badges = {
      'approved': { label: 'Đã duyệt', class: 'bg-green-100 text-green-800' },
      'pending': { label: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-800' },
      'rejected': { label: 'Từ chối', class: 'bg-red-100 text-red-800' }
    };
    
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${badge.class}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <Card hover className="h-full">
      <Card.Content>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {group.group_name}
                </h3>
                {getStatusBadge(group.status)}
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Lớp:</strong> {group.class_name}</p>
                <p><strong>GVCN:</strong> {group.advisor.full_name}</p>
                <p><strong>Thành viên:</strong> {group.member_count} học sinh</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <DollarSign size={16} className="text-blue-600" />
            </div>
            <div className="text-lg font-bold text-blue-600">
              {group.group_budget.toLocaleString()}đ
            </div>
            <div className="text-xs text-blue-800">Ngân sách nhóm</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Calendar size={16} className="text-green-600" />
            </div>
            <div className="text-sm font-medium text-green-600">
              {new Date(group.creation_date).toLocaleDateString('vi-VN')}
            </div>
            <div className="text-xs text-green-800">Ngày tạo</div>
          </div>
        </div>

        {group.booth && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{group.booth.booth_name}</h4>
                <p className="text-sm text-gray-600">Vị trí: {group.booth.location}</p>
              </div>
              {getBoothStatusBadge(group.booth.status)}
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => onViewDetails(group)}
            icon={<Eye size={16} />}
          >
            Chi tiết
          </Button>
          {hasManagePermission && (
            <Button
              size="sm"
              fullWidth
              icon={<Edit size={16} />}
            >
              Quản lý
            </Button>
          )}
        </div>
      </Card.Content>
    </Card>
  );
};

const GroupDetailModal = ({ group, onClose }) => {
  const [activeTab, setActiveTab] = useState('info');

  const tabs = [
    { id: 'info', label: 'Thông tin', icon: <FileText size={16} /> },
    { id: 'members', label: 'Thành viên', icon: <Users size={16} /> },
    { id: 'budget', label: 'Ngân sách', icon: <DollarSign size={16} /> },
    { id: 'activity', label: 'Hoạt động', icon: <MessageCircle size={16} /> }
  ];

  const mockMembers = [
    { id: 1, name: 'Nguyễn Văn A', role: 'Nhóm trưởng', joinDate: '2025-01-20T08:00:00Z' },
    { id: 2, name: 'Trần Thị B', role: 'Thành viên', joinDate: '2025-01-20T08:30:00Z' },
    { id: 3, name: 'Lê Hoàng C', role: 'Thành viên', joinDate: '2025-01-20T09:00:00Z' },
    { id: 4, name: 'Phạm Thị D', role: 'Thành viên', joinDate: '2025-01-20T09:30:00Z' }
  ];

  const mockBudgetTransactions = [
    { id: 1, description: 'Ngân sách ban đầu', amount: 5000000, type: 'income', date: '2025-01-20T08:00:00Z' },
    { id: 2, description: 'Mua nguyên liệu bánh mì', amount: -500000, type: 'expense', date: '2025-02-01T10:00:00Z' },
    { id: 3, description: 'Doanh thu bán hàng', amount: 1200000, type: 'income', date: '2025-02-15T16:00:00Z' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
          <Users className="w-8 h-8 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{group.group_name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{group.class_name}</span>
            <span className={`px-2 py-1 text-xs rounded ${
              group.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {group.status === 'active' ? 'Đang hoạt động' : 'Tạm dừng'}
            </span>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'info' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Tên nhóm</label>
              <p className="text-gray-900">{group.group_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Lớp</label>
              <p className="text-gray-900">{group.class_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Giáo viên chủ nhiệm</label>
              <p className="text-gray-900">{group.advisor.full_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Số thành viên</label>
              <p className="text-gray-900">{group.member_count} học sinh</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
              <p className="text-gray-900">{new Date(group.creation_date).toLocaleDateString('vi-VN')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Trạng thái</label>
              <p className="text-gray-900">
                {group.status === 'active' ? 'Đang hoạt động' : 'Tạm dừng'}
              </p>
            </div>
          </div>

          {group.booth && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Thông tin gian hàng</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tên gian hàng</label>
                  <p className="text-gray-900">{group.booth.booth_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Loại gian hàng</label>
                  <p className="text-gray-900">{group.booth.booth_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Vị trí</label>
                  <p className="text-gray-900">{group.booth.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạng thái duyệt</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    group.booth.status === 'approved' ? 'bg-green-100 text-green-800' :
                    group.booth.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {group.booth.status === 'approved' ? 'Đã duyệt' :
                     group.booth.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-900">
              Danh sách thành viên ({mockMembers.length})
            </h4>
            <Button size="sm" icon={<UserPlus size={16} />}>
              Thêm thành viên
            </Button>
          </div>
          
          <div className="space-y-3">
            {mockMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">{member.name}</h5>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    Tham gia: {new Date(member.joinDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {group.group_budget.toLocaleString()}đ
              </div>
              <div className="text-blue-800 font-medium">Ngân sách hiện tại</div>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {mockBudgetTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}đ
              </div>
              <div className="text-green-800 font-medium">Tổng thu</div>
            </div>
            
            <div className="text-center p-6 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {Math.abs(mockBudgetTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)).toLocaleString()}đ
              </div>
              <div className="text-red-800 font-medium">Tổng chi</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">Lịch sử giao dịch</h4>
            <div className="space-y-3">
              {mockBudgetTransactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h5 className="font-medium text-gray-900">{transaction.description}</h5>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className={`text-right font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : ''}{transaction.amount.toLocaleString()}đ
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Hoạt động gần đây</h4>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">Gian hàng được phê duyệt bởi giáo viên</p>
                <p className="text-xs text-gray-500">2 ngày trước</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">Thêm thành viên mới: Phạm Thị D</p>
                <p className="text-xs text-gray-500">5 ngày trước</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">Cập nhật kế hoạch kinh doanh</p>
                <p className="text-xs text-gray-500">1 tuần trước</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Đóng
        </Button>
        <Button icon={<MessageCircle size={16} />}>
          Nhắn tin nhóm
        </Button>
      </div>
    </div>
  );
};

const CreateGroupForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    group_name: '',
    class_name: '',
    advisor_id: '',
    initial_budget: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Creating group:', formData);
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <Input
          label="Tên nhóm"
          required
          placeholder="Nhập tên nhóm"
          value={formData.group_name}
          onChange={(e) => handleChange('group_name', e.target.value)}
        />
        
        <Input
          label="Lớp"
          required
          placeholder="Ví dụ: 12A1"
          value={formData.class_name}
          onChange={(e) => handleChange('class_name', e.target.value)}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giáo viên chủ nhiệm <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.advisor_id}
            onChange={(e) => handleChange('advisor_id', e.target.value)}
            required
          >
            <option value="">Chọn giáo viên</option>
            <option value="1">Cô Nguyễn Thị A</option>
            <option value="2">Thầy Trần Văn B</option>
            <option value="3">Cô Lê Thị C</option>
          </select>
        </div>
        
        <Input
          label="Ngân sách ban đầu"
          type="number"
          placeholder="Nhập số tiền (VNĐ)"
          value={formData.initial_budget}
          onChange={(e) => handleChange('initial_budget', e.target.value)}
          hint="Để trống nếu chưa có ngân sách"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          disabled={isLoading}
        >
          Hủy
        </Button>
        <Button 
          type="submit" 
          loading={isLoading}
        >
          Tạo nhóm
        </Button>
      </div>
    </form>
  );
};

export default StudentGroupPage;