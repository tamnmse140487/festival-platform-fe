import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, X, MapPin, ShoppingCart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../common/Button';
import Input from '../common/Input';

const BoothForm = ({ 
  booth = null, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  availableLocations = [],
  festival = null 
}) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState(booth?.images || []);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      booth_name: booth?.booth_name || '',
      booth_type: booth?.booth_type || '',
      location_id: booth?.location_id || '',
      description: booth?.description || '',
      business_plan: booth?.business_plan || '',
      expected_revenue: booth?.expected_revenue || '',
      group_id: booth?.group_id || ''
    }
  });

  const watchBoothType = watch('booth_type');

  const boothTypes = [
    { value: 'food', label: 'Đồ ăn', description: 'Các món ăn chính, snack' },
    { value: 'beverage', label: 'Đồ uống', description: 'Nước uống, trà, cà phê' },
    { value: 'dessert', label: 'Tráng miệng', description: 'Bánh ngọt, kem, chè' },
    { value: 'other', label: 'Khác', description: 'Sản phẩm khác' }
  ];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + previewImages.length > 5) {
      toast.error('Tối đa 5 hình ảnh');
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} quá lớn (tối đa 5MB)`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          url: e.target.result,
          file: file,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });

    setSelectedImages(prev => [...prev, ...files]);
  };

  const removeImage = (imageId) => {
    setPreviewImages(prev => prev.filter(img => img.id !== imageId));
    setSelectedImages(prev => prev.filter((_, index) => {
      const imgIndex = previewImages.findIndex(img => img.id === imageId);
      return index !== imgIndex;
    }));
  };

  const onFormSubmit = (data) => {
    const formData = {
      ...data,
      images: selectedImages,
      expected_revenue: parseFloat(data.expected_revenue) || 0
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tên gian hàng"
            required
            placeholder="Nhập tên gian hàng"
            leftIcon={<ShoppingCart size={20} />}
            error={errors.booth_name?.message}
            {...register('booth_name', {
              required: 'Tên gian hàng là bắt buộc',
              minLength: {
                value: 3,
                message: 'Tên gian hàng phải có ít nhất 3 ký tự'
              }
            })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại gian hàng <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              {...register('booth_type', {
                required: 'Loại gian hàng là bắt buộc'
              })}
            >
              <option value="">Chọn loại gian hàng</option>
              {boothTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.booth_type && (
              <p className="mt-1 text-sm text-red-600">{errors.booth_type.message}</p>
            )}
            {watchBoothType && (
              <p className="mt-1 text-xs text-gray-500">
                {boothTypes.find(t => t.value === watchBoothType)?.description}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vị trí mong muốn <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            {...register('location_id', {
              required: 'Vị trí là bắt buộc'
            })}
          >
            <option value="">Chọn vị trí</option>
            {availableLocations.map(location => (
              <option key={location.id} value={location.id}>
                {location.location_name} - {location.location_type}
                {location.is_occupied && ' (Đã có người đăng ký)'}
              </option>
            ))}
          </select>
          {errors.location_id && (
            <p className="mt-1 text-sm text-red-600">{errors.location_id.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả gian hàng <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Mô tả chi tiết về gian hàng, sản phẩm, dịch vụ..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            {...register('description', {
              required: 'Mô tả là bắt buộc',
              minLength: {
                value: 50,
                message: 'Mô tả phải có ít nhất 50 ký tự'
              }
            })}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Kế hoạch kinh doanh</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kế hoạch kinh doanh <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={6}
            placeholder="Mô tả chi tiết kế hoạch kinh doanh: menu, giá cả, chiến lược bán hàng, dự kiến chi phí..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            {...register('business_plan', {
              required: 'Kế hoạch kinh doanh là bắt buộc',
              minLength: {
                value: 100,
                message: 'Kế hoạch phải có ít nhất 100 ký tự'
              }
            })}
          />
          {errors.business_plan && (
            <p className="mt-1 text-sm text-red-600">{errors.business_plan.message}</p>
          )}
        </div>

        <Input
          label="Dự kiến doanh thu (VNĐ)"
          type="number"
          placeholder="Ví dụ: 5000000"
          hint="Doanh thu dự kiến cho cả lễ hội"
          error={errors.expected_revenue?.message}
          {...register('expected_revenue', {
            min: {
              value: 100000,
              message: 'Doanh thu tối thiểu 100,000 VNĐ'
            }
          })}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Hình ảnh minh họa</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previewImages.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.url}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={() => removeImage(image.id)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          
          {previewImages.length < 5 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <label htmlFor="booth-images" className="cursor-pointer">
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Thêm hình ảnh</span>
                <input
                  id="booth-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-500">
          Tối đa 5 hình ảnh, mỗi file tối đa 5MB. Hỗ trợ JPG, PNG.
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Hủy
        </Button>
        <Button 
          type="submit" 
          loading={isLoading}
        >
          {booth ? 'Cập nhật' : 'Đăng ký'} gian hàng
        </Button>
      </div>
    </form>
  );
};

export default BoothForm;