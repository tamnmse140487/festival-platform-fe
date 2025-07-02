import React from 'react';
import { Map, Plus, Trash2 } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';

const MapConfigForm = ({ register, errors, mapLocations, setMapLocations }) => {
  const addLocation = () => {
    setMapLocations([...mapLocations, { locationName: '', locationType: 'booth', coordinates: '' }]);
  };

  const removeLocation = (index) => {
    if (mapLocations.length > 1) {
      setMapLocations(mapLocations.filter((_, i) => i !== index));
    }
  };

  const updateLocation = (index, field, value) => {
    const updated = mapLocations.map((location, i) => 
      i === index ? { ...location, [field]: value } : location
    );
    setMapLocations(updated);
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title>Cấu hình bản đồ</Card.Title>
        <Card.Description>Thiết lập bản đồ và vị trí cho lễ hội</Card.Description>
      </Card.Header>
      
      <Card.Content>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Tên bản đồ"
              required
              placeholder="Nhập tên bản đồ"
              leftIcon={<Map size={20} />}
              error={errors.mapName?.message}
              {...register('mapName', {
                required: 'Tên bản đồ là bắt buộc'
              })}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại bản đồ <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                {...register('mapType', { required: 'Loại bản đồ là bắt buộc' })}
              >
                <option value="layout">Sơ đồ bố trí</option>
                <option value="navigation">Bản đồ định hướng</option>
                <option value="overview">Tổng quan</option>
              </select>
              {errors.mapType && (
                <p className="mt-1 text-sm text-red-600">{errors.mapType.message}</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Vị trí trên bản đồ</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLocation}
                icon={<Plus size={16} />}
              >
                Thêm vị trí
              </Button>
            </div>
            
            <div className="space-y-4">
              {mapLocations.map((location, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                  <div>
                    <input
                      type="text"
                      placeholder="Tên vị trí"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={location.locationName}
                      onChange={(e) => updateLocation(index, 'locationName', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={location.locationType}
                      onChange={(e) => updateLocation(index, 'locationType', e.target.value)}
                    >
                      <option value="booth">Gian hàng</option>
                      <option value="entrance">Lối vào</option>
                      <option value="stage">Sân khấu</option>
                      <option value="restroom">Nhà vệ sinh</option>
                      <option value="parking">Bãi đỗ xe</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      placeholder="Tọa độ (x,y)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={location.coordinates}
                      onChange={(e) => updateLocation(index, 'coordinates', e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeLocation(index)}
                      disabled={mapLocations.length === 1}
                      icon={<Trash2 size={16} />}
                    />
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

export default MapConfigForm;