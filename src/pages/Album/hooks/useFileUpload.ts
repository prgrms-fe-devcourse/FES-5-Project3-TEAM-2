// hooks/useFileUpload.ts
import { useState } from "react";
import type { Photo } from "../types/photo";
import { insertPhotoToDatabase, uploadFileToStorage } from "../api/insertPhoto";
import { generateId } from "../utils/generateId";
import { compressImages } from "../utils/compressImages";

interface UseFileUploadProps {
  userId: string;
  groupId: string;
  onUploadComplete?: (photo: Photo) => void;
  onUploadError?: (error: string) => void;
}

export function useFileUpload({
  userId,
  groupId,
  onUploadComplete,
  onUploadError,
}: UseFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );

  const uploadFile = async (file: File): Promise<Photo | null> => {
    const fileId = generateId();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${groupId}/${fileId}_${cleanFileName}`;

    try {
      // Storage에 업로드
      const publicUrl = await uploadFileToStorage(file, fileName);

      // DB에 insert
      const photo = await insertPhotoToDatabase(publicUrl, groupId, userId);

      return photo;
    } catch (error) {
      console.error(`파일 ${file.name} 업로드 실패:`, error);
      onUploadError?.(error instanceof Error ? error.message : "업로드 실패");
      return null;
    }
  };

  const handleFiles = async (files: File[] | FileList) => {
    if (files.length === 0) return;

    // 이미지 파일만 필터링
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );

    // 이미지가 아닌 파일들이 있으면 알림
    const nonImageFiles = Array.from(files).filter(
      (file) => !file.type.startsWith("image/"),
    );
    if (nonImageFiles.length > 0) {
      const nonImageNames = nonImageFiles.map((f) => f.name).join(", ");
      onUploadError?.(`이미지 파일이 아닙니다: ${nonImageNames}`);
    }

    if (imageFiles.length === 0) return;

    setIsUploading(true);

    const compressedFiles = await compressImages(Array.from(files));

    const results = { success: 0, failed: 0 };

    for (let i = 0; i < compressedFiles.length; i++) {
      const file = compressedFiles[i];

      const result = await uploadFile(file);

      if (result) {
        results.success++;
        onUploadComplete?.(result);
      } else {
        results.failed++;
      }

      // 진행률 업데이트
      setUploadProgress((prev) => ({
        ...prev,
        [file.name]: ((i + 1) / files.length) * 100,
      }));
    }

    setIsUploading(false);
    setUploadProgress({});

    // 결과 알림
    if (results.failed > 0) {
      console.log(
        `업로드 완료: ${results.success}개 성공, ${results.failed}개 실패`,
      );
    }
  };

  return {
    handleFiles,
    isUploading,
    uploadProgress,
  };
}
