import React, { useState, useEffect } from 'react';
import { MapPin, Grid, Download, Edit, Trash2, Eye, Image, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { festivalMapServices } from '../../../services/festivalMapServices';
import { mapLocationServices } from '../../../services/mapLocationServices';
import { convertToVietnamTimeWithFormat } from '../../../utils/formatters';
import { getStatusBadge } from '../../../utils/helpers';

const AdminMapTab = ({ festival }) => {
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaps();
  }, [festival.festivalId]);

  useEffect(() => {
    if (selectedMap) {
      loadLocations(selectedMap.mapId);
    }
  }, [selectedMap]);

  const loadMaps = async () => {
    try {
      setLoading(true);
      const response = await festivalMapServices.get({ festivalId: festival.festivalId });
      const mapsData = response.data || [];
      setMaps(mapsData);
      if (mapsData.length > 0) {
        setSelectedMap(mapsData[0]);
      }
    } catch (error) {
      console.error('Error loading maps:', error);
      toast.error('Không thể tải bản đồ lễ hội');
    } finally {
      setLoading(false);
    }
  };

  const loadLocations = async (mapId) => {
    try {
      const response = await mapLocationServices.get({ mapId });
      setLocations(response.data || []);
    } catch (error) {
      console.error('Error loading locations:', error);
      toast.error('Không thể tải danh sách vị trí');
    }
  };

  const getLocationStats = () => {
    const total = locations.length;
    const occupied = locations.filter(loc => loc.isOccupied).length;
    const available = total - occupied;
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

    return { total, occupied, available, occupancyRate };
  };

  const stats = getLocationStats();

  const statsData = [
    {
      label: 'Tổng vị trí',
      value: stats.total,
      color: 'text-gray-600'
    },
    {
      label: 'Đã thuê',
      value: stats.occupied,
      color: 'text-red-600'
    },
    {
      label: 'Còn trống',
      value: stats.available,
      color: 'text-green-600'
    },
    {
      label: 'Tỷ lệ lấp đầy',
      value: `${stats.occupancyRate}%`,
      color: 'text-blue-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Đang tải bản đồ...</span>
      </div>
    );
  }

  if (maps.length === 0) {
    return (
      <div className="text-center py-12">
        <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bản đồ</h3>
        <p className="text-gray-600 mb-6">Lễ hội này chưa có bản đồ nào được tạo.</p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Tạo bản đồ mới
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {maps.length > 1 && (
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Chọn bản đồ:</label>
            <select
              value={selectedMap?.mapId || ''}
              onChange={(e) => {
                const map = maps.find(m => m.mapId === parseInt(e.target.value));
                setSelectedMap(map);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {maps.map(map => (
                <option key={map.mapId} value={map.mapId}>
                  {map.mapName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => (
            <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>


      </div>

      {selectedMap && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedMap.mapName}</h3>
              <p className="text-sm text-gray-600">
                Loại: {selectedMap.mapType}

              </p>
            </div>

          </div>

          {selectedMap.mapUrl && (
            <div className="mb-4">
              <img
                src={selectedMap.mapUrl}
                alt={selectedMap.mapName}
                className="w-full h-64 object-contain bg-gray-50 rounded-lg border"
              />
            </div>
          )}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vị trí
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tọa độ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>

              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {locations.map((location) => (
                <tr key={location.locationId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {location.locationName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {location.coordinates}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {location.locationType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getStatusBadge(location.isOccupied, 'location')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {locations.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có vị trí nào</h3>
            <p className="text-gray-600">Bản đồ này chưa có vị trí nào được định nghĩa.</p>
          </div>
        )}
      </div>


      {selectedLocation && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Chi tiết vị trí</h3>
            <button
              onClick={() => setSelectedLocation(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tên vị trí:</span>
                  <span className="font-medium">{selectedLocation.locationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loại:</span>
                  <span className="font-medium">{selectedLocation.locationType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  {getStatusBadge(selectedLocation.isOccupied, 'location')}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tọa độ:</span>
                  <span className="font-mono text-xs">{selectedLocation.coordinates}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Thông tin hệ thống</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Location ID:</span>
                  <span className="font-mono">{selectedLocation.locationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Map ID:</span>
                  <span className="font-mono">{selectedLocation.mapId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày tạo:</span>
                  <span>{convertToVietnamTimeWithFormat(selectedLocation.createdAt)}</span>
                </div>
                {selectedLocation.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cập nhật:</span>
                    <span>{convertToVietnamTimeWithFormat(selectedLocation.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Edit size={16} />
              <span>Chỉnh sửa</span>
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2">
              <Trash2 size={16} />
              <span>Xóa vị trí</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMapTab;