import React from 'react';
import { Menu, Plus, Trash2 } from 'lucide-react';
import Card from '../../common/Card';
import Input from '../../common/Input';
import Button from '../../common/Button';

const EditMenuForm = ({ 
  register, 
  errors, 
  menuItems, 
  setMenuItems 
}) => {
  const addMenuItem = () => {
    setMenuItems([...menuItems, { 
      itemName: '', 
      description: '', 
      itemType: 'food', 
      minPrice: 0,
      maxPrice: 0
    }]);
  };

  const removeMenuItem = (index) => {
    if (menuItems.length > 1) {
      setMenuItems(menuItems.filter((_, i) => i !== index));
    }
  };

  const formatPrice = (value) => {
    if (!value || value === '0') return '';
    return parseInt(value).toLocaleString('vi-VN');
  };

  const parsePrice = (value) => {
    return value.replace(/\D/g, '');
  };

  const updateMenuItem = (index, field, value) => {
    let processedValue = value;
    
    if (field === 'minPrice' || field === 'maxPrice') {
      processedValue = parsePrice(value);
      
      const currentItem = menuItems[index];
      const minPrice = field === 'minPrice' ? parseInt(processedValue) || 0 : parseInt(currentItem.minPrice) || 0;
      const maxPrice = field === 'maxPrice' ? parseInt(processedValue) || 0 : parseInt(currentItem.maxPrice) || 0;
      
      if (field === 'minPrice' && processedValue && maxPrice > 0 && parseInt(processedValue) > maxPrice) {
        const updated = menuItems.map((item, i) => 
          i === index ? { ...item, [field]: processedValue, maxPrice: processedValue } : item
        );
        setMenuItems(updated);
        return;
      }
    }
    
    const updated = menuItems.map((item, i) => 
      i === index ? { ...item, [field]: processedValue } : item
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
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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
                        type="text"
                        placeholder="Giá tối thiểu"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formatPrice(item.minPrice)}
                        onChange={(e) => updateMenuItem(index, 'minPrice', e.target.value)}
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Giá tối đa"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formatPrice(item.maxPrice)}
                        onChange={(e) => updateMenuItem(index, 'maxPrice', e.target.value)}
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};

export default EditMenuForm;