import React from 'react';
import { Menu, Plus, Trash2, Upload, X } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card'; 

const MenuConfigForm = ({ register, errors, menuItems, setMenuItems }) => {
  const addMenuItem = () => {
    setMenuItems([...menuItems, { 
      itemName: '', 
      description: '', 
      itemType: 'food', 
      basePrice: 0,
      image: null,
      imagePreview: null
    }]);
  };

  const removeMenuItem = (index) => {
    if (menuItems.length > 1) {
      setMenuItems(menuItems.filter((_, i) => i !== index));
    }
  };

  const updateMenuItem = (index, field, value) => {
    const updated = menuItems.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setMenuItems(updated);
  };

  const handleImageUpload = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh');
        event.target.value = ''; 
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB');
        event.target.value = ''; 
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      
      const updated = menuItems.map((item, i) => 
        i === index ? { 
          ...item, 
          image: file, 
          imagePreview: previewUrl 
        } : item
      );
      setMenuItems(updated);
      
    }
  };

  const removeImage = (index) => {
    const updated = menuItems.map((item, i) => 
      i === index ? { 
        ...item, 
        image: null, 
        imagePreview: null 
      } : item
    );
    setMenuItems(updated);
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title>Cấu hình thực đơn</Card.Title>
        <Card.Description>Thiết lập thực đơn và món ăn cho lễ hội</Card.Description>
      </Card.Header>
      
      <Card.Content>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Tên thực đơn"
              required
              placeholder="Nhập tên thực đơn"
              leftIcon={<Menu size={20} />}
              error={errors.menuName?.message}
              {...register('menuName', {
                required: 'Tên thực đơn là bắt buộc'
              })}
            />
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả thực đơn
              </label>
              <textarea
                rows={3}
                placeholder="Mô tả về thực đơn"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                {...register('menuDescription')}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Món ăn/Đồ uống</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMenuItem}
                icon={<Plus size={16} />}
              >
                Thêm món
              </Button>
            </div>
            
            <div className="space-y-4">
              {menuItems.map((item, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Tên món"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={item.itemName}
                        onChange={(e) => updateMenuItem(index, 'itemName', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <input
                        type="text"
                        placeholder="Mô tả"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={item.description}
                        onChange={(e) => updateMenuItem(index, 'description', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={item.itemType}
                        onChange={(e) => updateMenuItem(index, 'itemType', e.target.value)}
                      >
                        <option value="food">Đồ ăn</option>
                        <option value="beverage">Đồ uống</option>
                      </select>
                    </div>
                    
                    <div>
                      <input
                        type="number"
                        placeholder="Giá cơ bản"
                        min="0"
                        step="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={item.basePrice}
                        onChange={(e) => updateMenuItem(index, 'basePrice', e.target.value)}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMenuItem(index)}
                        disabled={menuItems.length === 1}
                        icon={<Trash2 size={16} />}
                      />
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="mt-4 border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Ảnh món ăn</span>
                      {item.imagePreview && (
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    
                    {item.imagePreview ? (
                      <div className="relative">
                        <img
                          src={item.imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="text-white hover:text-red-200"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(index, e)}
                          className="hidden"
                          id={`image-upload-${index}`}
                        />
                        <label
                          htmlFor={`image-upload-${index}`}
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <Upload size={24} className="text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">
                            Nhấn để tải ảnh lên
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            PNG, JPG, GIF tối đa 5MB
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};

export default MenuConfigForm;