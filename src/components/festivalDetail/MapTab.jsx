import React, { useState } from 'react';
import { MapPin, Store } from 'lucide-react';
import Card from '../common/Card';
import { FESTIVAL_STATUS, ROLE_NAME } from '../../utils/constants';
import BoothRegistrationModal from '../booths/BoothRegistrationModal';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';

const MapTab = ({ festivalMap, mapLocations, festival, loading, menuItems = [] }) => {
  const { user, hasRole } = useAuth();
  const [showRegisterBoothModal, setShowRegisterBoothModal] = useState(false);

  const handleRegisterBoothModalClose = () => {
    setShowRegisterBoothModal(false);
  };

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
              <div className='relative'>
                {hasRole([ROLE_NAME.STUDENT]) && festival?.status === FESTIVAL_STATUS.PUBLISHED && (
                  <Button
                    icon={<Store size={16} />}
                    onClick={() => setShowRegisterBoothModal(true)}
                    className='absolute right-0 -top-8'
                  >
                    Đăng ký gian hàng
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Content>
              {mapLocations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mapLocations.map((location) => (
                    <div key={location.locationId || location.id} className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900">
                        {location.coordinates && `${location.coordinates} - `}
                        {location.locationName}
                      </h4>
                      <p className="text-sm text-gray-600">Loại: {location.locationType}</p>

                      <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${location.isOccupied
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                        }`}>
                        {location.isOccupied ? 'Đã có nhóm đăng ký' : 'Còn trống'}
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

      <BoothRegistrationModal
        isOpen={showRegisterBoothModal}
        onClose={handleRegisterBoothModalClose}
        mapLocations={mapLocations}
        festivalId={festival?.festivalId || festival?.id}
        menuItems={menuItems}
      />
    </div>
  );
};

export default MapTab;