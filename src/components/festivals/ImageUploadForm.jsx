import React from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card from '../common/Card';

const ImageUploadForm = ({ previewImage, onImageChange }) => {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => onImageChange(file, e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    onImageChange(null, null);
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title>Hình ảnh lễ hội</Card.Title>
        <Card.Description>Tải lên hình ảnh đại diện</Card.Description>
      </Card.Header>
      
      <Card.Content>
        <div className="space-y-4">
          {previewImage ? (
            <div className="relative">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Tải lên hình ảnh
                  </span>
                  <input
                    id="image-upload"
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
      </Card.Content>
    </Card>
  );
};

export default ImageUploadForm;