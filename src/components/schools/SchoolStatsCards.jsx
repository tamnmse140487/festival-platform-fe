import React from 'react';
import { School, Users, Calendar } from 'lucide-react';
import Card from '../common/Card';

const SchoolStatsCards = ({ schools }) => {
  const stats = {
    total: schools.length,
    totalFestivals: schools.reduce((sum, school) => sum + (school.festivals?.length || 0), 0),
    totalParticipations: schools.reduce((sum, school) => sum + (school.festivalSchools?.length || 0), 0)
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Lễ hội tổ chức</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFestivals}</p>
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
              <p className="text-sm font-medium text-gray-600">Lượt tham gia</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalParticipations}</p>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default SchoolStatsCards;