import React from 'react';
import { Upload, X, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card from '../common/Card';
import Button from '../common/Button';

const FestivalImageUploadForm = ({ selectedImages, existingImages, onImageChange, onRemoveExistingImage }) => {
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Ảnh ${file.name} vượt quá 5MB`);
        continue;
      }
      validFiles.push(file);
    }
    
    if (validFiles.length > 0) {
      const newImages = [...selectedImages];
      
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newImages.push({
            file: file,
            preview: e.target.result,
            id: Date.now() + Math.random()
          });
          onImageChange([...newImages]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (imageId) => {
    const updatedImages = selectedImages.filter(img => img.id !== imageId);
    onImageChange(updatedImages);
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title>Hình ảnh lễ hội</Card.Title>
        <Card.Description>Quản lý hình ảnh cho lễ hội</Card.Description>
      </Card.Header>
      
      <Card.Content>
        <div className="space-y-6">
          {existingImages && existingImages.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Ảnh hiện tại</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {existingImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.imageUrl}
                      alt={image.imageName}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white"
                        onClick={() => onRemoveExistingImage && onRemoveExistingImage(image.id)}
                        icon={<Trash2 size={16} />}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Thêm ảnh mới</h4>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="festival-images-upload" className="cursor-pointer">
                  <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Tải lên hình ảnh
                  </span>
                  <input
                    id="festival-images-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG tối đa 5MB mỗi ảnh</p>
              </div>
            </div>

            {selectedImages.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Ảnh sẽ được thêm</h5>
                <div className="grid grid-cols-2 gap-4">
                  {selectedImages.map((image) => (
                    <div key={image.id} className="relative">
                      <img
                        src={image.preview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};

export default FestivalImageUploadForm;