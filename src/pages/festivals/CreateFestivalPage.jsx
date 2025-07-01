import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Calendar, MapPin, Users, Upload, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';

const CreateFestivalPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      festival_name: '',
      theme: '',
      description: '',
      location: '',
      start_date: '',
      end_date: '',
      registration_start_date: '',
      registration_end_date: '',
      max_booths: '',
      food_booths: '',
      beverage_booths: '',
      other_booths: ''
    }
  });

  const watchMaxBooths = watch('max_booths');
  const watchFoodBooths = watch('food_booths');
  const watchBeverageBooths = watch('beverage_booths');
  const watchOtherBooths = watch('other_booths');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const totalSpecificBooths = (parseInt(data.food_booths) || 0) + 
                                  (parseInt(data.beverage_booths) || 0) + 
                                  (parseInt(data.other_booths) || 0);
      
      if (totalSpecificBooths > parseInt(data.max_booths)) {
        toast.error('Tổng số gian hàng chi tiết không được vượt quá số gian hàng tối đa');
        setIsLoading(false);
        return;
      }

      const festivalData = {
        ...data,
        image: selectedImage,
        created_at: new Date().toISOString()
      };

      console.log('Creating festival:', festivalData);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Tạo lễ hội thành công!');
      navigate('/festivals');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo lễ hội');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/festivals')}
          icon={<ArrowLeft size={20} />}
        >
          Quay lại
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tạo lễ hội mới</h1>
          <p className="text-gray-600 mt-1">Điền thông tin để tạo lễ hội cho trường của bạn</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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
                      error={errors.festival_name?.message}
                      {...register('festival_name', {
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
                    error={errors.start_date?.message}
                    {...register('start_date', {
                      required: 'Ngày bắt đầu là bắt buộc'
                    })}
                  />
                  
                  <Input
                    label="Ngày kết thúc"
                    type="datetime-local"
                    required
                    leftIcon={<Calendar size={20} />}
                    error={errors.end_date?.message}
                    {...register('end_date', {
                      required: 'Ngày kết thúc là bắt buộc'
                    })}
                  />
                  
                  <Input
                    label="Mở đăng ký từ"
                    type="datetime-local"
                    required
                    leftIcon={<Calendar size={20} />}
                    error={errors.registration_start_date?.message}
                    {...register('registration_start_date', {
                      required: 'Ngày mở đăng ký là bắt buộc'
                    })}
                  />
                  
                  <Input
                    label="Đóng đăng ký vào"
                    type="datetime-local"
                    required
                    leftIcon={<Calendar size={20} />}
                    error={errors.registration_end_date?.message}
                    {...register('registration_end_date', {
                      required: 'Ngày đóng đăng ký là bắt buộc'
                    })}
                  />
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>Cấu hình gian hàng</Card.Title>
                <Card.Description>Thiết lập số lượng và phân loại gian hàng</Card.Description>
              </Card.Header>
              
              <Card.Content>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Tổng số gian hàng tối đa"
                      type="number"
                      required
                      placeholder="Nhập số lượng"
                      leftIcon={<Users size={20} />}
                      error={errors.max_booths?.message}
                      {...register('max_booths', {
                        required: 'Số gian hàng tối đa là bắt buộc',
                        min: {
                          value: 1,
                          message: 'Phải có ít nhất 1 gian hàng'
                        }
                      })}
                    />
                  </div>
                  
                  <Input
                    label="Gian hàng đồ ăn"
                    type="number"
                    placeholder="Số lượng"
                    hint="Để trống nếu không giới hạn"
                    {...register('food_booths', {
                      min: { value: 0, message: 'Không thể âm' }
                    })}
                  />
                  
                  <Input
                    label="Gian hàng đồ uống"
                    type="number"
                    placeholder="Số lượng"
                    hint="Để trống nếu không giới hạn"
                    {...register('beverage_booths', {
                      min: { value: 0, message: 'Không thể âm' }
                    })}
                  />
                  
                  <div className="md:col-span-2">
                    <Input
                      label="Gian hàng khác"
                      type="number"
                      placeholder="Số lượng"
                      hint="Để trống nếu không giới hạn"
                      {...register('other_booths', {
                        min: { value: 0, message: 'Không thể âm' }
                      })}
                    />
                  </div>
                  
                  {watchMaxBooths && (watchFoodBooths || watchBeverageBooths || watchOtherBooths) && (
                    <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Tóm tắt phân bổ:</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <div>Đồ ăn: {watchFoodBooths || 0} gian hàng</div>
                        <div>Đồ uống: {watchBeverageBooths || 0} gian hàng</div>
                        <div>Khác: {watchOtherBooths || 0} gian hàng</div>
                        <div className="font-medium border-t border-blue-200 pt-1">
                          Tổng đã phân bổ: {(parseInt(watchFoodBooths) || 0) + (parseInt(watchBeverageBooths) || 0) + (parseInt(watchOtherBooths) || 0)}/{watchMaxBooths}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card.Content>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <Card.Header>
                <Card.Title>Hình ảnh lễ hội</Card.Title>
                <Card.Description>Tải lên hình ảnh đại diện</Card.Description>
              </Card.Header>
              
              <Card.Content>
                <div className="space-y-4">
                  {previewImage ? (
                    <div className="relative">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          setSelectedImage(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                            Tải lên hình ảnh
                          </span>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG tối đa 5MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>Hành động</Card.Title>
              </Card.Header>
              
              <Card.Content>
                <div className="space-y-3">
                  <Button
                    type="submit"
                    fullWidth
                    loading={isLoading}
                    icon={<Save size={20} />}
                  >
                    Tạo lễ hội
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    onClick={() => navigate('/festivals')}
                    disabled={isLoading}
                  >
                    Hủy bỏ
                  </Button>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateFestivalPage;