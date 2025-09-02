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
import type { VirtuosoGridHandle } from "react-virtuoso";

function Album() {
  const { userId, groupId } = useParams();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const virtuosoRef = useRef<VirtuosoGridHandle>(null);

  const [group, setGroup] = useState<{
    start_day: string;
    end_day: string;
  } | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoadingGroup, setIsLoadingGroup] = useState(true);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);
  const [hasUpdates, setHasUpdates] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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

  const { downloadPhoto, isDownloading } = useFileDownload({
    onPhotoNotFound: (photoId) => {
      setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
    },
  });

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
      const initialPhotos = await loadPhotos(groupId, { limit: 30 });

      setPhotos(initialPhotos);

      if (initialPhotos.length > 0) {
        const lastPhoto = initialPhotos[initialPhotos.length - 1];
        setCursor(lastPhoto.created_at);
        setHasMore(initialPhotos.length === 30);
      } else {
        setCursor(null);
        setHasMore(false);
      }
    } catch (err) {
      console.error("사진 로드 에러:", err);
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  // 추가 사진 로드 (무한스크롤)
  const loadMorePhotos = async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const newPhotos = await loadPhotos(groupId, { cursor, limit: 30 });

      if (newPhotos.length === 0) {
        setHasMore(false);
      } else {
        setPhotos((prev) => [...prev, ...newPhotos]);
        const lastPhoto = newPhotos[newPhotos.length - 1];
        setCursor(lastPhoto.created_at);
        setHasMore(newPhotos.length === 30);
      }
    } catch (err) {
      console.error("추가 로딩 실패:", err);
    } finally {
      setIsLoadingMore(false);
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

      const freshPhotos = await loadPhotos(groupId, { limit: 30 });

      // 모든 상태 초기화
      setPhotos(freshPhotos);
      if (freshPhotos.length > 0) {
        const lastPhoto = freshPhotos[freshPhotos.length - 1];
        setCursor(lastPhoto.created_at);
        setHasMore(freshPhotos.length === 30);
      } else {
        setCursor(null);
        setHasMore(false);
      }
      virtuosoRef.current?.scrollToIndex({ index: 0, behavior: "auto" });
    } catch (err) {
      console.error("새로고침 에러:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePhotoNotFound = (photoId: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
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

  const isLoading =
    isLoadingPhotos || isUploading || isDeleting || isDownloading;

  return (
    <main className="h-full overflow-hidden grid grid-rows-[auto_1fr] gap-y-3 sm:gap-y-4 px-[50px] pt-[50px] pb-0">
      <header className="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:justify-between lg:items-center">
        <h1 className="text-xl sm:text-2xl font-semibold">{travelDays}</h1>
        <div className="flex items-center justify-start lg:justify-end gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            startIcon={
              <FaSync className={isRefreshing ? "animate-spin" : ""} />
            }
            disabled={isRefreshing}
            className="p-2 relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0"
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
            className="flex-shrink-0 text-sm sm:text-base"
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
        virtuosoRef={virtuosoRef}
        photos={photos}
        isLoading={isLoading}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onFilesDropped={handleFiles}
        onDeletePhoto={handleDeletePhoto}
        onDownloadPhoto={handleDownloadPhoto}
        onLoadMore={loadMorePhotos}
        onPhotoNotFound={handlePhotoNotFound}
      />
    </main>
  );
}

export default Album;
