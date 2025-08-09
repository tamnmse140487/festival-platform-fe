import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import Card from '../common/Card';
import { convertToVietnamTimeWithFormat } from '../../utils/formatters';

const OverviewTab = ({ festival }) => {
  if (!festival) {
    return (
      <div className="space-y-6">
        <Card>
          <Card.Content>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <Card.Title>Mô tả lễ hội</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-gray-700 leading-relaxed">{festival.description}</p>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Lịch trình đăng ký</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-blue-900">Mở đăng ký</h4>
                <p className="text-blue-700 text-sm">
                  {convertToVietnamTimeWithFormat(festival.registrationStartDate)}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <h4 className="font-medium text-red-900">Đóng đăng ký</h4>
                <p className="text-red-700 text-sm">
                  {convertToVietnamTimeWithFormat(festival.registrationEndDate)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default OverviewTab;