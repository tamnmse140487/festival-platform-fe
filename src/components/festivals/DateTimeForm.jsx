import React from 'react';
import { Calendar } from 'lucide-react';
import Input from '../common/Input';
import Card from '../common/Card';

const DateTimeForm = ({ register, errors }) => {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Thời gian tổ chức</Card.Title>
        <Card.Description>Lịch trình diễn ra lễ hội</Card.Description>
      </Card.Header>
      
      <Card.Content>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Ngày bắt đầu"
            type="datetime-local"
            required
            leftIcon={<Calendar size={20} />}
            error={errors.startDate?.message}
            {...register('startDate', {
              required: 'Ngày bắt đầu là bắt buộc'
            })}
          />
          
          <Input
            label="Ngày kết thúc"
            type="datetime-local"
            required
            leftIcon={<Calendar size={20} />}
            error={errors.endDate?.message}
            {...register('endDate', {
              required: 'Ngày kết thúc là bắt buộc'
            })}
          />
          
          <Input
            label="Mở đăng ký từ"
            type="datetime-local"
            required
            leftIcon={<Calendar size={20} />}
            error={errors.registrationStartDate?.message}
            {...register('registrationStartDate', {
              required: 'Ngày mở đăng ký là bắt buộc'
            })}
          />
          
          <Input
            label="Đóng đăng ký vào"
            type="datetime-local"
            required
            leftIcon={<Calendar size={20} />}
            error={errors.registrationEndDate?.message}
            {...register('registrationEndDate', {
              required: 'Ngày đóng đăng ký là bắt buộc'
            })}
          />
        </div>
      </Card.Content>
    </Card>
  );
};

export default DateTimeForm;