import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import SchoolStatsCards from '../../components/schools/SchoolStatsCards';
import SchoolCard from '../../components/schools/SchoolCard';
import SchoolDetailModal from '../../components/schools/SchoolDetailModal';
import CreateSchoolForm from '../../components/schools/CreateSchoolForm';
import { schoolServices } from '../../services/schoolServices';

const SchoolListPage = () => {
  const { hasRole } = useAuth();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const response = await schoolServices.get();
      setSchools(response.data || []);
    } catch (error) {
      console.error('Error loading schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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

  const handleSchoolCreated = () => {
    setShowCreateModal(false);
    loadSchools();
  };

  const handleSchoolUpdated = () => {
    setShowDetailModal(false);
    loadSchools();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

      <SchoolStatsCards schools={schools} />

      <Card>
        <Card.Content>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm trường học..."
                leftIcon={<Search size={20} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {paginatedSchools.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy trường học nào</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Thử thay đổi từ khóa tìm kiếm.' 
                  : 'Chưa có trường học nào trong hệ thống.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedSchools.map(school => (
                <SchoolCard 
                  key={school.schoolId} 
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
            onSchoolUpdated={handleSchoolUpdated}
          />
        )}
      </Modal>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Thêm trường học mới"
        size="lg"
      >
        <CreateSchoolForm 
          onClose={() => setShowCreateModal(false)}
          onSchoolCreated={handleSchoolCreated}
        />
      </Modal>
    </div>
  );
};

export default SchoolListPage;