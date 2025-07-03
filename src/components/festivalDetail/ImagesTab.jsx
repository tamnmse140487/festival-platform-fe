import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import Card from '../common/Card';

const ImagesTab = ({ festivalImages, loading }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <Card.Header>
            <Card.Title>Hình ảnh lễ hội</Card.Title>
            <Card.Description>Tất cả hình ảnh của lễ hội</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-48"></div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <Card.Title>Hình ảnh lễ hội</Card.Title>
          <Card.Description>Tất cả hình ảnh của lễ hội</Card.Description>
        </Card.Header>
        <Card.Content>
          {festivalImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {festivalImages.map((image, index) => (
                <div key={image.id || index} className="relative group">
                  <img
                    src={image.imageUrl}
                    alt={image.imageName || `Festival image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có hình ảnh</h3>
              <p className="text-gray-600">Lễ hội chưa có hình ảnh nào được tải lên.</p>
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
};

export default ImagesTab;