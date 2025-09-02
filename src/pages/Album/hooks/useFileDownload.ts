import { useState } from "react";
import type { Photo } from "../types/photo";
import { toast } from "@/components/Sweetalert";

interface UseFileDownloadProps {
  onPhotoNotFound?: (photoId: string) => void;
}

export function useFileDownload({
  onPhotoNotFound,
}: UseFileDownloadProps = {}) {
  const [isDownloading, setIsDownloading] = useState(false);

  const getFileExtension = (url: string): string => {
    const urlParts = url.split(".");
    const extension = urlParts[urlParts.length - 1].split("?")[0];
    return ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(
      extension.toLowerCase(),
    )
      ? extension
      : "jpg";
  };

  const openInNewTab = (url: string) => {
    const newWindow = window.open(url, "_blank");
    if (!newWindow) {
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "팝업이 차단되었습니다.",
        icon: "info",
        position: "top",
      });
    } else {
      toast({
        title: "사진이 새 탭에서 열립니다. 길게 눌러 저장할 수 있습니다.",
        icon: "info",
        position: "top",
      });
    }
  };

  const downloadFile = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const downloadForDesktop = async (
    photoUrl: string,
    fileName: string,
    photoId: string,
  ) => {
    try {
      const response = await fetch(photoUrl, {
        mode: "cors",
        cache: "no-cache",
      });

      if (!response.ok) {
        toast({
          title: "이미 삭제된 사진입니다.",
          icon: "error",
          position: "top",
        });
        onPhotoNotFound?.(photoId);
        return;
      }

      const blob = await response.blob();
      downloadFile(blob, fileName);
    } catch {
      toast({
        title: "다운로드에 실패했습니다.",
        icon: "error",
        position: "top",
      });
    }
  };

  const downloadPhoto = async (photo: Photo) => {
    try {
      setIsDownloading(true);

      const fileExtension = getFileExtension(photo.url);
      const safePhotoId = photo.id.replace(/[^a-z0-9_\-]/gi, "");
      const fileName = `photo_${safePhotoId}.${fileExtension}`;

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (isIOS) {
        openInNewTab(photo.url);
      } else {
        await downloadForDesktop(photo.url, fileName, photo.id);
      }
    } catch {
      toast({
        title: "다운로드에 실패했습니다.",
        icon: "error",
        position: "top",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    downloadPhoto,
    isDownloading,
  };
}
