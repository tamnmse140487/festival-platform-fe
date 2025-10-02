import React from 'react';
import { MapPin, Phone, Calendar, Eye, Edit, Users, Info, Trash2 } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const SchoolCard = ({ school, onViewDetails, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(school);
  };

  return (
    <Card hover>
      <Card.Content>
        <div className="flex items-start space-x-4">
          <img 
            src={school.logoUrl || '/api/placeholder/80/80'} 
            alt={school.schoolName}
            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
          />
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {school.schoolName}
                  </h3>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <MapPin size={14} className="mr-2" />
                    <span>{school.address}</span>
                  </div>
                  <div className="flex items-center">
                    <Info size={14} className="mr-2" />
                    <span>{school.contactInfo}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    Tạo {formatDate(school.createdAt)}
                  </span>
                  {/* <span className="flex items-center">
                    <Users size={14} className="mr-1" />
                    {school.festivals?.length || 0} lễ hội
                  </span> */}
                </div>

                {school.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {school.description}
                  </p>
                )}
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
                
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    icon={<Trash2 size={16} />}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    Xóa
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};

export default SchoolCard;