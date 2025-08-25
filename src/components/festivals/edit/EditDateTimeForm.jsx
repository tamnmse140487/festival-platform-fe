import React from 'react';
import { Calendar } from 'lucide-react';
import Card from '../../common/Card';
import Input from '../../common/Input';

const EditDateTimeForm = ({ register, errors, watch }) => {
  const watchedValues = watch();

  const getVietnamDateTime = () => {
    const now = new Date();
    const vietnamTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    return vietnamTime.toISOString().slice(0, 16);
  };

  const validateStartDate = (value) => {
    if (!value) return 'Ngày bắt đầu là bắt buộc';

    const startDate = new Date(value);
    const now = new Date();
    const vietnamTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));

    return true;
  };

  const validateEndDate = (value) => {
    if (!value) return 'Ngày kết thúc là bắt buộc';

    const endDate = new Date(value);
    const startDate = new Date(watchedValues.startDate);

    if (watchedValues.startDate && endDate <= startDate) {
      return 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    return true;
  };

  const validateRegistrationStartDate = (value) => {
    if (!value) return 'Ngày mở đăng ký là bắt buộc';

    const regStartDate = new Date(value);
    const startDate = new Date(watchedValues.startDate);

    if (watchedValues.startDate && regStartDate >= startDate) {
      return 'Mở đăng ký phải trước ngày bắt đầu';
    }

    return true;
  };

  const validateRegistrationEndDate = (value) => {
    if (!value) return 'Ngày đóng đăng ký là bắt buộc';

    const regEndDate = new Date(value);
    const regStartDate = new Date(watchedValues.registrationStartDate);
    const startDate = new Date(watchedValues.startDate);

    if (watchedValues.registrationStartDate && regEndDate <= regStartDate) {
      return 'Đóng đăng ký phải sau ngày mở đăng ký';
    }

    if (watchedValues.startDate && regEndDate >= startDate) {
      return 'Đóng đăng ký phải trước ngày bắt đầu';
    }

    return true;
  };

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
              validate: validateStartDate
            })}
          />

          <Input
            label="Ngày kết thúc"
            type="datetime-local"
            required
            min={watchedValues.startDate }
            leftIcon={<Calendar size={20} />}
            error={errors.endDate?.message}
            {...register('endDate', {
              validate: validateEndDate
            })}
          />

          <Input
            label="Mở đăng ký từ"
            type="datetime-local"
            required
            max={watchedValues.startDate}
            leftIcon={<Calendar size={20} />}
            error={errors.registrationStartDate?.message}
            {...register('registrationStartDate', {
              validate: validateRegistrationStartDate
            })}
          />

          <Input
            label="Đóng đăng ký vào"
            type="datetime-local"
            required
            min={watchedValues.registrationStartDate}
            max={watchedValues.startDate}
            leftIcon={<Calendar size={20} />}
            error={errors.registrationEndDate?.message}
            {...register('registrationEndDate', {
              validate: validateRegistrationEndDate
            })}
          />
        </div>
      </Card.Content>
    </Card>
  );
};

export default EditDateTimeForm;