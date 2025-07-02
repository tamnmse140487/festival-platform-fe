import React from 'react';
import { MapPin } from 'lucide-react';
import Input from '../common/Input';
import Card from '../common/Card';

const BasicInfoForm = ({ register, errors }) => {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Thông tin cơ bản</Card.Title>
        <Card.Description>Thông tin chính về lễ hội</Card.Description>
      </Card.Header>
      
      <Card.Content>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              label="Tên lễ hội"
              required
              placeholder="Nhập tên lễ hội"
              error={errors.festivalName?.message}
              {...register('festivalName', {
                required: 'Tên lễ hội là bắt buộc',
                minLength: {
                  value: 5,
                  message: 'Tên lễ hội phải có ít nhất 5 ký tự'
                }
              })}
            />
          </div>
          
          <div className="md:col-span-2">
            <Input
              label="Chủ đề"
              placeholder="Nhập chủ đề lễ hội"
              error={errors.theme?.message}
              {...register('theme')}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Mô tả chi tiết về lễ hội"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
              {...register('description', {
                required: 'Mô tả là bắt buộc'
              })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
          
          <div className="md:col-span-2">
            <Input
              label="Địa điểm tổ chức"
              required
              placeholder="Nhập địa điểm tổ chức"
              leftIcon={<MapPin size={20} />}
              error={errors.location?.message}
              {...register('location', {
                required: 'Địa điểm là bắt buộc'
              })}
            />
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};

export default BasicInfoForm;