import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../common/Button';
import Input from '../common/Input';
import { mockIngredients } from '../../data/mockData';

const MenuItemForm = ({ 
  menuItem = null, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(menuItem?.image_url || null);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      item_name: menuItem?.item_name || '',
      description: menuItem?.description || '',
      price: menuItem?.price || '',
      quantity_limit: menuItem?.quantity_limit || '',
      category: menuItem?.category || '',
      ingredients: menuItem?.ingredients || [{ ingredient_id: '', quantity: '', unit: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients'
  });

  const watchPrice = watch('price');

  const categories = [
    { value: 'main', label: 'Món chính' },
    { value: 'appetizer', label: 'Khai vị' },
    { value: 'dessert', label: 'Tráng miệng' },
    { value: 'beverage', label: 'Đồ uống' },
    { value: 'snack', label: 'Đồ ăn vặt' }
  ];

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

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
  };

  const addIngredient = () => {
    append({ ingredient_id: '', quantity: '', unit: '' });
  };

  const removeIngredient = (index) => {
    remove(index);
  };

  const onFormSubmit = (data) => {
    const formData = {
      ...data,
      price: parseFloat(data.price),
      quantity_limit: parseInt(data.quantity_limit) || null,
      image: selectedImage,
      ingredients: data.ingredients.filter(ing => 
        ing.ingredient_id && ing.quantity && ing.unit
      )
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Thông tin món ăn</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tên món ăn"
            required
            placeholder="Nhập tên món ăn"
            error={errors.item_name?.message}
            {...register('item_name', {
              required: 'Tên món ăn là bắt buộc',
              minLength: {
                value: 2,
                message: 'Tên món ăn phải có ít nhất 2 ký tự'
              }
            })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              {...register('category', {
                required: 'Danh mục là bắt buộc'
              })}
            >
              <option value="">Chọn danh mục</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Mô tả chi tiết về món ăn, nguyên liệu, cách chế biến..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            {...register('description', {
              required: 'Mô tả là bắt buộc',
              minLength: {
                value: 20,
                message: 'Mô tả phải có ít nhất 20 ký tự'
              }
            })}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Giá bán"
              type="number"
              required
              placeholder="Ví dụ: 25000"
              hint="Giá bán tính bằng VNĐ"
              error={errors.price?.message}
              {...register('price', {
                required: 'Giá bán là bắt buộc',
                min: {
                  value: 1000,
                  message: 'Giá bán tối thiểu 1,000 VNĐ'
                }
              })}
            />
            {watchPrice && (
              <p className="text-sm text-green-600 mt-1">
                {parseInt(watchPrice).toLocaleString()} VNĐ
              </p>
            )}
          </div>

          <Input
            label="Giới hạn số lượng"
            type="number"
            placeholder="Ví dụ: 50"
            hint="Để trống nếu không giới hạn"
            error={errors.quantity_limit?.message}
            {...register('quantity_limit', {
              min: {
                value: 1,
                message: 'Số lượng phải lớn hơn 0'
              }
            })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Nguyên liệu</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addIngredient}
            icon={<Plus size={16} />}
          >
            Thêm nguyên liệu
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border border-gray-200 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nguyên liệu
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  {...register(`ingredients.${index}.ingredient_id`)}
                >
                  <option value="">Chọn nguyên liệu</option>
                  {mockIngredients.map(ingredient => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.ingredient_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  {...register(`ingredients.${index}.quantity`)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn vị
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  {...register(`ingredients.${index}.unit`)}
                >
                  <option value="">Chọn đơn vị</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="l">Lít (l)</option>
                  <option value="ml">Mililít (ml)</option>
                  <option value="cái">Cái</option>
                  <option value="gói">Gói</option>
                  <option value="chai">Chai</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeIngredient(index)}
                  icon={<Trash2 size={16} />}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Xóa
                </Button>
              </div>
            </div>
          ))}
        </div>

        {fields.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Chưa có nguyên liệu nào</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addIngredient}
              className="mt-2"
              icon={<Plus size={16} />}
            >
              Thêm nguyên liệu đầu tiên
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Hình ảnh món ăn</h3>
        
        {previewImage ? (
          <div className="relative inline-block">
            <img
              src={previewImage}
              alt="Preview"
              className="w-48 h-48 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div>
              <label htmlFor="menu-image" className="cursor-pointer">
                <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Tải lên hình ảnh
                </span>
                <input
                  id="menu-image"
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
          {menuItem ? 'Cập nhật' : 'Thêm'} món ăn
        </Button>
      </div>
    </form>
  );
};

export default MenuItemForm;