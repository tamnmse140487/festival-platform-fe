import { imageServices } from './imageServices';

const uploadImageToCloudinary = async (file, folder = 'festivals') => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.REACT_APP_UPLOAD_PRESET);
    formData.append("folder", folder);

    const cloud_name = process.env.REACT_APP_CLOUD_NAME;

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      originalName: file.name
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const uploadService = {
  uploadImage: async (file, folder = 'festivals', entityData = {}) => {
    try {

      const uploadResult = await uploadImageToCloudinary(file, folder);
      
      if (Object.keys(entityData).length > 0) {
        const imageData = {
          imageUrl: uploadResult.url,
          imageName: uploadResult.originalName,
          ...entityData
        };
        
        await imageServices.addToEntity(imageData);
      }
      
      return uploadResult.url;
    } catch (error) {
      console.error('Upload failed:', error);
      throw new Error('Không thể tải ảnh lên. Vui lòng thử lại.');
    }
  },

  uploadFestivalImage: async (file, festivalId) => {
    return await uploadService.uploadImage(file, 'festivals', { festivalId });
  },

  uploadMenuItemImage: async (file, menuItemId) => {
    return await uploadService.uploadImage(file, 'menu-items', { menuItemId });
  },

  uploadMapImage: async (file, mapId) => {
    return await uploadService.uploadImage(file, 'maps', { mapId });
  },

  uploadBoothImage: async (file, boothId) => {
    return await uploadService.uploadImage(file, 'booths', { boothId });
  }
};