import React, { useState } from 'react';
import { Plus, Search, School, MapPin, Phone, Mail, Users, Calendar, Eye, Edit, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';

const SchoolListPage = () => {
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const itemsPerPage = 10;

  const mockSchools = [
    {
      id: 1,
      school_name: 'Trường THPT ABC',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      contact_info: '028-12345678',
      email: 'contact@thptabc.edu.vn',
      principal: 'Nguyễn Văn A',
      established_year: 1995,
      student_count: 1200,
      teacher_count: 80,
      status: 'active',
      festival_count: 5,
      booth_count: 18,
      logo_url: '/api/placeholder/80/80',
      created_at: '2024-01-15T08:00:00Z'
    },
    {
      id: 2,
      school_name: 'Trường THPT XYZ',
      address: '456 Đường XYZ, Quận 3, TP.HCM',
      contact_info: '028-87654321',
      email: 'info@thptxyz.edu.vn',
      principal: 'Trần Thị B',
      established_year: 2000,
      student_count: 900,
      teacher_count: 60,
      status: 'active',
      festival_count: 3,
      booth_count: 12,
      logo_url: '/api/placeholder/80/80',
      created_at: '2024-02-01T09:00:00Z'
    },
    {
      id: 3,
      school_name: 'Trường THPT DEF',
      address: '789 Đường DEF, Quận 7, TP.HCM',
      contact_info: '028-11223344',
      email: 'admin@thptdef.edu.vn',
      principal: 'Lê Văn C',
      established_year: 1988,
      student_count: 1500,
      teacher_count: 95,
      status: 'pending',
      festival_count: 0,
      booth_count: 0,
      logo_url: '/api/placeholder/80/80',
      created_at: '2024-03-01T10:00:00Z'
    }
  ];

  const filteredSchools = mockSchools.filter(school => {
    const matchesSearch = school.school_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.principal.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || school.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
  const paginatedSchools = filteredSchools.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetails = (school) => {
    setSelectedSchool(school);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'active': { label: 'Hoạt động', class: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
      'pending': { label: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} /> },
      'suspended': { label: 'Tạm dừng', class: 'bg-red-100 text-red-800', icon: <Clock size={14} /> }
    };
    
    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.class}`}>
        {badge.icon}
        <span className="ml-1">{badge.label}</span>
      </span>
    );
  };

  const getStatsOverview = () => {
    const total = mockSchools.length;
    const active = mockSchools.filter(s => s.status === 'active').length;
    const pending = mockSchools.filter(s => s.status === 'pending').length;
    const totalStudents = mockSchools.reduce((sum, s) => sum + s.student_count, 0);
    
    return { total, active, pending, totalStudents };
  };

  const stats = getStatsOverview();

  if (!hasRole(['admin'])) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Không có quyền truy cập</h2>
        <p className="text-gray-600 mt-2">Chỉ Admin mới có thể truy cập trang này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Trường học</h1>
          <p className="text-gray-600 mt-1">
            Quản lý tất cả trường học trong hệ thống Festival Hub.
          </p>
        </div>
        
        <Button 
          icon={<Plus size={20} />}
          onClick={() => setShowCreateModal(true)}
        >
          Thêm trường học
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <Card.Content>
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <School className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng trường</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng học sinh</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents.toLocaleString()}</p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      <Card>
        <Card.Content>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Tìm kiếm trường học..."
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
                <option value="pending">Chờ duyệt</option>
                <option value="suspended">Tạm dừng</option>
              </select>
            </div>
          </div>

          {paginatedSchools.length === 0 ? (
            <div className="text-center py-12">
              <School className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy trường học nào</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.' 
                  : 'Chưa có trường học nào trong hệ thống.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedSchools.map(school => (
                <SchoolCard 
                  key={school.id} 
                  school={school} 
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredSchools.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </Card.Content>
      </Card>

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Chi tiết trường học"
        size="lg"
      >
        {selectedSchool && (
          <SchoolDetailModal 
            school={selectedSchool} 
            onClose={() => setShowDetailModal(false)}
          />
        )}
      </Modal>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Thêm trường học mới"
        size="md"
      >
        <CreateSchoolForm onClose={() => setShowCreateModal(false)} />
      </Modal>
    </div>
  );
};

const SchoolCard = ({ school, onViewDetails }) => {
  return (
    <Card hover>
      <Card.Content>
        <div className="flex items-start space-x-4">
          <img 
            src={school.logo_url} 
            alt={school.school_name}
            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
          />
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {school.school_name}
                  </h3>
                  {getStatusBadge(school.status)}
                </div>
                
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <MapPin size={14} className="mr-2" />
                    <span>{school.address}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone size={14} className="mr-2" />
                    <span>{school.contact_info}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail size={14} className="mr-2" />
                    <span>{school.email}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Users size={14} className="mr-1" />
                    {school.student_count} học sinh
                  </span>
                  <span className="flex items-center">
                    <School size={14} className="mr-1" />
                    {school.teacher_count} giáo viên
                  </span>
                  <span className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    Thành lập {school.established_year}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(school)}
                  icon={<Eye size={16} />}
                >
                  Chi tiết
                </Button>
                <Button
                  size="sm"
                  icon={<Edit size={16} />}
                >
                  Chỉnh sửa
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};

const SchoolDetailModal = ({ school, onClose }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <img 
          src={school.logo_url} 
          alt={school.school_name}
          className="w-20 h-20 rounded-lg object-cover border border-gray-200"
        />
        <div>
          <h3 className="text-xl font-bold text-gray-900">{school.school_name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            {getStatusBadge(school.status)}
            <span className="text-sm text-gray-500">
              Tham gia từ {new Date(school.created_at).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Thông tin liên hệ</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <MapPin size={16} className="mr-2 text-gray-400" />
              <span>{school.address}</span>
            </div>
            <div className="flex items-center">
              <Phone size={16} className="mr-2 text-gray-400" />
              <span>{school.contact_info}</span>
            </div>
            <div className="flex items-center">
              <Mail size={16} className="mr-2 text-gray-400" />
              <span>{school.email}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
          <div className="space-y-2 text-sm">
            <div><strong>Hiệu trưởng:</strong> {school.principal}</div>
            <div><strong>Năm thành lập:</strong> {school.established_year}</div>
            <div><strong>Số học sinh:</strong> {school.student_count.toLocaleString()}</div>
            <div><strong>Số giáo viên:</strong> {school.teacher_count}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="text-center p-6 bg-blue-50 rounded-lg">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {school.festival_count}
          </div>
          <div className="text-blue-800 font-medium">Lễ hội đã tổ chức</div>
        </div>
        
        <div className="text-center p-6 bg-green-50 rounded-lg">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {school.booth_count}
          </div>
          <div className="text-green-800 font-medium">Gian hàng tham gia</div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Đóng
        </Button>
        <Button>
          Chỉnh sửa thông tin
        </Button>
      </div>
    </div>
  );
};

const CreateSchoolForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    school_name: '',
    address: '',
    contact_info: '',
    email: '',
    principal: '',
    established_year: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Creating school:', formData);
      onClose();
    } catch (error) {
      console.error('Error creating school:', error);
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
          label="Tên trường"
          required
          placeholder="Nhập tên trường"
          value={formData.school_name}
          onChange={(e) => handleChange('school_name', e.target.value)}
        />
        
        <Input
          label="Địa chỉ"
          required
          placeholder="Nhập địa chỉ"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Số điện thoại"
            required
            placeholder="028-12345678"
            value={formData.contact_info}
            onChange={(e) => handleChange('contact_info', e.target.value)}
          />
          
          <Input
            label="Email"
            type="email"
            required
            placeholder="contact@school.edu.vn"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Hiệu trưởng"
            required
            placeholder="Nhập tên hiệu trưởng"
            value={formData.principal}
            onChange={(e) => handleChange('principal', e.target.value)}
          />
          
          <Input
            label="Năm thành lập"
            type="number"
            placeholder="1990"
            value={formData.established_year}
            onChange={(e) => handleChange('established_year', e.target.value)}
          />
        </div>
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
          Thêm trường học
        </Button>
      </div>
    </form>
  );
};

const getStatusBadge = (status) => {
  const badges = {
    'active': { label: 'Hoạt động', class: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
    'pending': { label: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} /> },
    'suspended': { label: 'Tạm dừng', class: 'bg-red-100 text-red-800', icon: <Clock size={14} /> }
  };
  
  const badge = badges[status] || badges.pending;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.class}`}>
      {badge.icon}
      <span className="ml-1">{badge.label}</span>
    </span>
  );
};

export default SchoolListPage;