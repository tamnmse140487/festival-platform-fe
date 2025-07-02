import React from 'react';
import { Users } from 'lucide-react';
import Input from '../common/Input';
import Card from '../common/Card';

const BoothConfigForm = ({ register, errors, watch }) => {
  const watchMaxFoodBooths = watch('maxFoodBooths');
  const watchMaxBeverageBooths = watch('maxBeverageBooths');

  return (
    <Card>
      <Card.Header>
        <Card.Title>Cấu hình gian hàng</Card.Title>
        <Card.Description>Thiết lập số lượng gian hàng theo loại</Card.Description>
      </Card.Header>
      
      <Card.Content>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Số gian hàng đồ ăn"
            type="number"
            required
            placeholder="Nhập số lượng"
            leftIcon={<Users size={20} />}
            error={errors.maxFoodBooths?.message}
            {...register('maxFoodBooths', {
              required: 'Số gian hàng đồ ăn là bắt buộc',
              min: {
                value: 0,
                message: 'Số lượng không thể âm'
              }
            })}
          />
          
          <Input
            label="Số gian hàng đồ uống"
            type="number"
            required
            placeholder="Nhập số lượng"
            leftIcon={<Users size={20} />}
            error={errors.maxBeverageBooths?.message}
            {...register('maxBeverageBooths', {
              required: 'Số gian hàng đồ uống là bắt buộc',
              min: {
                value: 0,
                message: 'Số lượng không thể âm'
              }
            })}
          />
          
          {(watchMaxFoodBooths || watchMaxBeverageBooths) && (
            <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Tóm tắt cấu hình:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div>Gian hàng đồ ăn: {watchMaxFoodBooths || 0} gian hàng</div>
                <div>Gian hàng đồ uống: {watchMaxBeverageBooths || 0} gian hàng</div>
                <div className="font-medium border-t border-blue-200 pt-1">
                  Tổng số gian hàng: {(parseInt(watchMaxFoodBooths) || 0) + (parseInt(watchMaxBeverageBooths) || 0)}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  );
};

export default BoothConfigForm;