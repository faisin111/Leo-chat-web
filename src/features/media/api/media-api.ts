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

export const resolveMimeType = (file: File): string => {
  if (file.type && file.type.trim()) return file.type.toLowerCase();
  const ext = file.name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'avif':
      return 'image/avif';
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'ppt':
      return 'application/vnd.ms-powerpoint';
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'txt':
      return 'text/plain';
    case 'csv':
      return 'text/csv';
    case 'zip':
      return 'application/zip';
    case 'json':
      return 'application/json';
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'ogg':
    case 'oga':
      return 'audio/ogg';
    case 'm4a':
    case 'aac':
      return 'audio/aac';
    case 'mp4':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    default:
      return 'application/octet-stream';
  }
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
  uploadFile: async (file: File): Promise<ConfirmResponse> => {
    const mimeType = resolveMimeType(file);
    const presignData = await mediaApi.presign({
      mimeType,
      sizeInBytes: file.size,
    });

    await mediaApi.uploadToPresignedUrl(
      presignData.uploadUrl,
      file,
      presignData.contentType || mimeType,
    );

    const confirmData = await mediaApi.confirm({
      storageKey: presignData.storageKey,
    });

    return confirmData;
  },

  uploadImage: async (file: File): Promise<ConfirmResponse> => {
    return mediaApi.uploadFile(file);
  },
};
