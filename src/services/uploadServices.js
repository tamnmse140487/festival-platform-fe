import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/configFirebase';

export const uploadService = {
  uploadImage: async (file, folder = 'festivals') => {
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Upload failed:', error);
      throw new Error('Không thể tải ảnh lên. Vui lòng thử lại.');
    }
  }
};