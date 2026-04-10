import api from './axios';
import { ApiResponse } from '../types';

export const documentApi = {
  getDocuments: async () => {
    const res = await api.get<ApiResponse<any[]>>('/documents');
    return res.data;
  },
  getUploadUrl: async (filename: string, contentType: string) => {
    const res = await api.post<ApiResponse<{ uploadUrl: string; key: string }>>('/documents/upload-url', {
      filename,
      contentType,
    });
    return res.data;
  },
  saveDocumentMetadata: async (data: any) => {
    const res = await api.post<ApiResponse<any>>('/documents', data);
    return res.data;
  },
};
