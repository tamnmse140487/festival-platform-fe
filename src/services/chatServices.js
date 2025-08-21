import { chatApi } from './api'; 

export const chatServices = {
  getMessages: async (groupId, page = 1, limit = 50) => {
    try {
      const response = await chatApi.get(`/chat/messages/${groupId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getLatestMessages: async (groupIds) => {
    try {
      const response = await chatApi.get('/chat/latest-messages', {
        params: { groupIds: groupIds.join(',') }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  sendMessage: async (groupId, messageType, contentText) => {
    try {
      const response = await chatApi.post('/chat/send', {
        groupId,
        messageType,
        contentText
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteMessage: async (messageId) => {
    try {
      const response = await chatApi.delete(`/chat/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getChatStats: async (groupId) => {
    try {
      const response = await chatApi.get(`/chat/stats/${groupId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await chatApi.post('/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  uploadFiles: async (files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await chatApi.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getFileInfo: async (filename) => {
    try {
      const response = await chatApi.get(`/upload/info/${filename}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteFile: async (filename) => {
    try {
      const response = await chatApi.delete(`/upload/files/${filename}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getGroupFiles: async (groupId, fileType = null) => {
    try {
      const params = { groupId };
      if (fileType) params.fileType = fileType;
      
      const response = await chatApi.get('/chat/group-files', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};