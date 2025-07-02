import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/configFirebase';
import { imageServices } from './imageServices';

export const uploadService = {
  uploadImage: async (file, folder = 'festivals', entityData = {}) => {
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      if (Object.keys(entityData).length > 0) {
        const imageData = {
          imageUrl: downloadURL,
          imageName: fileName,
          ...entityData
        };
        
        await imageServices.addToEntity(imageData);
      }
      
      return downloadURL;
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