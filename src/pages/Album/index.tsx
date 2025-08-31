import Button from "@/components/common/Button";
import { useEffect, useRef, useState } from "react";
import { FaPlus, FaSync } from "react-icons/fa";
import { useParams } from "react-router-dom";

import Photos from "./components/Photos";
import { useFileUpload } from "./hooks/useFileUpload";
import { usePhotoDelete } from "./hooks/useFileDelete";
import { loadPhotos } from "./api/loadPhotos";
import { loadGroup } from "./api/loadGroup";
import { broadcastPhotoChange, subscribePhotoUpdates } from "./api/updatePhoto";
import { formatTravelDays } from "./utils/formatTravelDays";
import type { Photo } from "./types/photo";
import { useFileDownload } from "./hooks/useFileDownload";

function Album() {
  const { userId, groupId } = useParams();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [group, setGroup] = useState<{
    start_day: string;
    end_day: string;
  } | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoadingGroup, setIsLoadingGroup] = useState(true);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [hasUpdates, setHasUpdates] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!groupId || !userId) {
    return;
  }

  const travelDays = group
    ? formatTravelDays(group.start_day, group.end_day)
    : isLoadingGroup
      ? "날짜 정보 로딩 중"
      : "그룹 정보 없음";

  const { handleFiles, isUploading } = useFileUpload({
    groupId,
    onUploadComplete: (photo) => {
      setPhotos((prev) => [photo, ...prev]);
      broadcastPhotoChange(groupId, userId, "upload", photo.id);
    },
    onUploadError: (error) => {
      console.error("업로드 에러:", error);
    },
  });

  const { deletePhoto, isDeleting } = usePhotoDelete({
    onDeleteComplete: (photoId) => {
      setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
      broadcastPhotoChange(groupId, userId, "delete", photoId);
    },
    onDeleteError: (error) => {
      console.error("삭제 에러:", error);
    },
  });

  const { downloadPhoto, isDownloading } = useFileDownload();

  // 날짜 데이터 로드
  const fetchGroup = async () => {
    try {
      setIsLoadingGroup(true);
      const data = await loadGroup(groupId);
      setGroup(data);
    } catch (err) {
      console.error("날짜 로드 에러:", err);
    } finally {
      setIsLoadingGroup(false);
    }
  };

  // 사진 데이터 로드
  const fetchPhotos = async () => {
    try {
      setIsLoadingPhotos(true);

      const data = await loadPhotos(groupId);
      setPhotos(data);
    } catch (err) {
      console.error("사진 로드 에러:", err);
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files) return;

    handleFiles(files);

    if (event.target) {
      event.target.value = "";
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    const photo = photos.find((p) => p.id === photoId);
    if (!photo) return;

    if (window.confirm("정말로 이 사진을 삭제하시겠습니까?")) {
      await deletePhoto(photoId, photo.url);
    }
  };

  const handleDownloadPhoto = async (photo: Photo) => {
    await downloadPhoto(photo);
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setHasUpdates(false);
      const data = await loadPhotos(groupId);
      setPhotos(data);
    } catch (err) {
      console.error("새로고침 에러:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 데이터 로드
  useEffect(() => {
    fetchGroup();
    fetchPhotos();
  }, [groupId]);

  // 실시간 알림
  useEffect(() => {
    const unsubscribe = subscribePhotoUpdates(groupId, userId, () =>
      setHasUpdates(true),
    );
    return unsubscribe;
  }, [groupId, userId]);

  return (
    <main className="h-full overflow-hidden grid grid-rows-[auto_1fr] gap-y-4 px-6 py-4">
      <header className="flex flex-wrap justify-between items-center gap-2 md:gap-3">
        <h1 className="text-2xl font-semibold">{travelDays}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            startIcon={
              <FaSync className={isRefreshing ? "animate-spin" : ""} />
            }
            disabled={isRefreshing}
            className="p-2 relative w-10 h-10"
          >
            {hasUpdates && (
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </Button>
          <Button
            variant="primary"
            onClick={handleAddPhoto}
            startIcon={isUploading ? undefined : <FaPlus />}
            isLoading={isUploading}
          >
            {isUploading ? "업로드 중" : "사진 추가"}
          </Button>
        </div>
      </header>

      {/* 파일 input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <Photos
        photos={photos}
        isLoading={
          isLoadingPhotos || isUploading || isDeleting || isDownloading
        }
        onFilesDropped={handleFiles}
        onDeletePhoto={handleDeletePhoto}
        onDownloadPhoto={handleDownloadPhoto}
      />
    </main>
  );
}

export default Album;
