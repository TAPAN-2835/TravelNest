import api from './axios';
import { ApiResponse } from '../types';

export const documentApi = {
  getDocuments: async () => {
    const res = await api.get<ApiResponse<any[]>>('/documents');
    return res.data;
  },
  getUploadUrl: async (fileName: string, fileType: string, documentType: string) => {
    const res = await api.post<ApiResponse<{ uploadUrl: string; key: string }>>('/documents/upload-url', {
      fileName,
      fileType,
      documentType,
    });
    return res.data;
  },
  saveDocumentMetadata: async (data: any) => {
    const res = await api.post<ApiResponse<any>>('/documents', data);
    return res.data;
  },
  deleteDocument: async (id: string) => {
    const res = await api.delete<ApiResponse<any>>(`/documents/${id}`);
    return res.data;
  },
};
