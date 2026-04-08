import { useCallback, useState } from 'react';

import ApiService from '@/services/apiClient';

type UploadState = {
  uploading: boolean;
};

const toFilePath = (input: any): string => {
  if (!input) return '';
  if (typeof input === 'string') return input;
  return String(
    input.path ||
    input.originalFilePath ||
    input.previewPath ||
    input.thumbnailPath ||
    input.url ||
    input.originalUrl ||
    '',
  ).trim();
};

export function useFileUpload() {
  const [state, setState] = useState<UploadState>({ uploading: false });

  const uploadFile = useCallback(async (fileUri: string) => {
    setState({ uploading: true });
    try {
      const response = await ApiService.uploadSingleFile(fileUri);
      return {
        raw: response,
        path: toFilePath(response),
      };
    } finally {
      setState({ uploading: false });
    }
  }, []);

  const uploadMultipleFiles = useCallback(async (fileUris: string[]) => {
    setState({ uploading: true });
    try {
      const response = await ApiService.uploadMultipleFiles(fileUris);
      const items = Array.isArray(response) ? response : Array.isArray(response?.content) ? response.content : [];
      return items.map((item) => ({
        raw: item,
        path: toFilePath(item),
      }));
    } finally {
      setState({ uploading: false });
    }
  }, []);

  return {
    uploading: state.uploading,
    uploadFile,
    uploadMultipleFiles,
  };
}
