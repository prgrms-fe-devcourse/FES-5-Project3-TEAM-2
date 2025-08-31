import { useState } from "react";
import {
  deleteFileFromStorage,
  deletePhotoFromDatabase,
} from "../api/deletePhoto";
import { extractFileNameFromUrl } from "../utils/extractFileFromUrl";

interface UsePhotoDeleteProps {
  onDeleteComplete?: (photoId: string) => void;
  onDeleteError?: (error: string) => void;
}

export function usePhotoDelete({
  onDeleteComplete,
  onDeleteError,
}: UsePhotoDeleteProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deletePhoto = async (photoId: string, fileUrl: string) => {
    setIsDeleting(true);

    try {
      // URL에서 파일명 추출
      const fileName = extractFileNameFromUrl(fileUrl);

      // Storage에서 파일 삭제
      if (fileName) {
        await deleteFileFromStorage(fileName);
      }

      // DB에서 삭제
      await deletePhotoFromDatabase(photoId);

      onDeleteComplete?.(photoId);
    } catch (error) {
      console.error("사진 삭제 실패:", error);
      onDeleteError?.(error instanceof Error ? error.message : "삭제 실패");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deletePhoto,
    isDeleting,
  };
}
