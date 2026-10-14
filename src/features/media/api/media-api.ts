import axios from 'axios';
import { http } from '@/shared/api/http-client';

export type PresignRequest = {
  mimeType: string;
  sizeInBytes: number;
};

export type PresignResponse = {
  bucket: string;
  storageKey: string;
  uploadUrl: string;
  method: 'PUT' | string;
  contentType: string;
  sizeInBytes: number;
  expiresIn: number;
};

export type ConfirmRequest = {
  storageKey: string;
};

export type ConfirmResponse = {
  bucket: string;
  storageKey: string;
  url: string;
  contentType: string;
  sizeInBytes: number;
  expiresIn: number;
};

export const mediaApi = {
  presign: async (data: PresignRequest): Promise<PresignResponse> => {
    const response = await http.post('/media/presign', data);
    return response.data;
  },

  confirm: async (data: ConfirmRequest): Promise<ConfirmResponse> => {
    const response = await http.post('/media/confirm', data);
    return response.data;
  },

  uploadToPresignedUrl: async (
    uploadUrl: string,
    file: File | Blob,
    contentType: string,
  ): Promise<void> => {
    // Direct upload to Supabase storage with PUT
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': contentType,
      },
    });
  },

  /** Convenience full flow: presigns, uploads bytes, confirms, and returns the download url */
  uploadImage: async (file: File): Promise<ConfirmResponse> => {
    const presignData = await mediaApi.presign({
      mimeType: file.type,
      sizeInBytes: file.size,
    });

    await mediaApi.uploadToPresignedUrl(presignData.uploadUrl, file, presignData.contentType);

    const confirmData = await mediaApi.confirm({
      storageKey: presignData.storageKey,
    });

    return confirmData;
  },
};
