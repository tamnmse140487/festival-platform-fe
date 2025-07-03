import React from 'react';
import { MapPin } from 'lucide-react';
import Card from '../common/Card';

const MapTab = ({ festivalMap, mapLocations, loading }) => {
  // console.log("festivalMap: ", festivalMap)
  // console.log("mapLocations: ", mapLocations)
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <Card.Content>
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {festivalMap ? (
        <>
          <Card>
            <Card.Header>
              <Card.Title>{festivalMap.mapName}</Card.Title>
              <Card.Description>Loại: {festivalMap.mapType}</Card.Description>
            </Card.Header>
            <Card.Content>
              {festivalMap.mapUrl && (
                <img
                  src={festivalMap.mapUrl}
                  alt={festivalMap.mapName}
                  className="w-full h-full object-cover rounded-lg"
                />
              )}
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Vị trí trên bản đồ</Card.Title>
            </Card.Header>
            <Card.Content>
              {mapLocations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mapLocations.map((location) => (
                    <div key={location.id} className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900">{location.locationName}</h4>
                      <p className="text-sm text-gray-600">Loại: {location.locationType}</p>
                      {location.coordinates && (
                        <p className="text-sm text-gray-600">Tọa độ: {location.coordinates}</p>
                      )}
                      <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                        location.isOccupied 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {location.isOccupied ? 'Đã sử dụng' : 'Còn trống'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Chưa có vị trí nào được thiết lập.</p>
              )}
            </Card.Content>
          </Card>
        </>
      ) : (
        <Card>
          <Card.Content>
            <div className="text-center py-8">
              <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bản đồ</h3>
              <p className="text-gray-600">Bản đồ lễ hội chưa được thiết lập.</p>
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

export default MapTab;