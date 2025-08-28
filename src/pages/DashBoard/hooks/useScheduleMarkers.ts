import { useEffect, useRef, useState, useCallback } from "react";
import { scheduleApi, type Schedule } from "../api/mapSchedule";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import {
  clearAllMarkers,
  createMarkerContent,
  loadMarkerLibrary,
} from "../utils/mapScheduleMarker";

interface UseScheduleMarkersProps {
  map: google.maps.Map | null;
  groupId: string;
  onMarkerClick?: (
    schedule: Schedule,
    marker: google.maps.marker.AdvancedMarkerElement,
  ) => void;
}

export function useScheduleMarkers({
  map,
  groupId,
  onMarkerClick,
}: UseScheduleMarkersProps) {
  const markersRef = useRef<
    Map<string, google.maps.marker.AdvancedMarkerElement>
  >(new Map());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // AdvancedMarkerElement 클래스 캐싱
  const markerClassRef = useRef<
    typeof google.maps.marker.AdvancedMarkerElement | null
  >(null);
  const initialZoomDoneRef = useRef(false);
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;

  // 마커 생성 또는 업데이트
  const createOrUpdateMarker = useCallback(
    (
      schedule: Schedule,
      AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement,
    ) => {
      if (!map) return;

      const existingMarker = markersRef.current.get(schedule.id);
      if (existingMarker) {
        if (existingMarker.content) {
          (existingMarker.content as HTMLElement).title = schedule.title;
        }

        google.maps.event.clearListeners(existingMarker, "click");
        if (onMarkerClickRef.current) {
          existingMarker.addListener("click", () =>
            onMarkerClickRef.current?.(schedule, existingMarker),
          );
        }

        return existingMarker;
      }

      // 새 마커 생성
      const marker = new AdvancedMarkerElement({
        position: { lat: schedule.latitude!, lng: schedule.longitude! },
        map,
        content: createMarkerContent(schedule.title),
        zIndex: 10,
      });

      if (onMarkerClickRef.current) {
        marker.addListener("click", () =>
          onMarkerClickRef.current?.(schedule, marker),
        );
      }

      markersRef.current.set(schedule.id, marker);
      return marker;
    },
    [map],
  );

  // 초기 데이터 로드
  useEffect(() => {
    if (!groupId) return;

    initialZoomDoneRef.current = false;
    const loadSchedules = async () => {
      setIsLoading(true);
      try {
        const data = await scheduleApi.getSchedules(groupId);
        setSchedules(data);
      } catch (error) {
        console.error("일정 로드 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSchedules();
  }, [groupId]);

  // schedules 상태 변경시 마커 업데이트
  useEffect(() => {
    if (!map) return;

    const updateAllMarkers = async () => {
      // 라이브러리가 로드되지 않았다면 로드하고 캐시
      if (!markerClassRef.current) {
        markerClassRef.current = await loadMarkerLibrary();
      }

      const currentMarkerIds = new Set(markersRef.current.keys());
      const newScheduleIds = new Set(schedules.map((s) => s.id));

      // 제거된 마커들 삭제
      currentMarkerIds.forEach((id) => {
        if (!newScheduleIds.has(id)) {
          markersRef.current.get(id)!.map = null;
          markersRef.current.delete(id);
        }
      });

      // 새로운/업데이트된 마커들 처리
      schedules.forEach((schedule) => {
        if (schedule.latitude && schedule.longitude) {
          createOrUpdateMarker(schedule, markerClassRef.current!);
        }
      });

      // 초기 로드 시 일정 마커들에 zoom
      if (schedules.length > 0 && !initialZoomDoneRef.current) {
        const bounds = new google.maps.LatLngBounds();
        schedules.forEach((schedule) => {
          if (schedule.latitude && schedule.longitude) {
            bounds.extend({ lat: schedule.latitude, lng: schedule.longitude });
          }
        });

        if (!bounds.isEmpty()) {
          map.fitBounds(bounds);
          if (schedules.length === 1) {
            setTimeout(() => map.setZoom(15), 100);
          }
          initialZoomDoneRef.current = true;
        }
      }
    };

    updateAllMarkers();
  }, [map, schedules, createOrUpdateMarker]);

  // Realtime 구독
  useEffect(() => {
    if (!groupId) return;

    const handleRealtimeChange = async (
      payload: RealtimePostgresChangesPayload<Schedule>,
    ) => {
      const { eventType, new: newSchedule, old } = payload;

      if (eventType === "INSERT" && newSchedule) {
        setSchedules((prev) => [...prev, newSchedule]);
      } else if (eventType === "DELETE" && old?.id) {
        setSchedules((prev) => prev.filter((s) => s.id !== old.id));
      } else if (eventType === "UPDATE" && newSchedule) {
        setSchedules((prev) =>
          prev.map((s) => (s.id === newSchedule.id ? newSchedule : s)),
        );
      }
    };

    const channel = scheduleApi.createSubscription(
      groupId,
      handleRealtimeChange,
    );

    return () => {
      scheduleApi.removeSubscription(channel);
    };
  }, [groupId]);

  // 컴포넌트 언마운트시 마커 정리
  useEffect(() => {
    return () => clearAllMarkers(markersRef.current);
  }, []);

  return { schedules, isLoading };
}
