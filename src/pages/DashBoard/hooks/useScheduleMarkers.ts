import { toast } from "@/components/Sweetalert";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import { scheduleApi, type Schedule } from "../api/mapSchedule";
import {
    clearAllMarkers,
    createMarkerContent,
    loadMarkerLibrary,
} from "../utils/mapScheduleMarker";
import { groupSchedulesByLocation } from "../utils/scheduleMarkersGrouping";

interface UseScheduleMarkersProps {
  map: google.maps.Map | null;
  groupId: string;
  onMarkerClick?: (
    schedules: Schedule[],
    marker: google.maps.marker.AdvancedMarkerElement,
  ) => void;
}

export function useScheduleMarkers({
  map,
  groupId,
  onMarkerClick,
}: UseScheduleMarkersProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const markersRef = useRef<
    Map<string, google.maps.marker.AdvancedMarkerElement>
  >(new Map());
  const markerClassRef = useRef<
    typeof google.maps.marker.AdvancedMarkerElement | null
  >(null);
  const initialZoomDoneRef = useRef(false);
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;

  // 새로운 마커 생성
  const createGroupMarker = useCallback(
    (groupSchedules: Schedule[], locationKey: string) => {
      if (!map || !markerClassRef.current) return;

      const representativeSchedule = groupSchedules[0];
      const marker = new markerClassRef.current({
        position: {
          lat: representativeSchedule.latitude!,
          lng: representativeSchedule.longitude!,
        },
        map,
        content: createMarkerContent(`${groupSchedules.length}개 일정`),
        zIndex: 10,
      });

      if (onMarkerClickRef.current) {
        marker.addListener("click", () => {
          onMarkerClickRef.current?.(groupSchedules, marker);
        });
      }

      markersRef.current.set(locationKey, marker);
      return marker;
    },
    [map],
  );

  // 기존 마커 내용 업데이트
  const updateGroupMarker = useCallback(
    (groupSchedules: Schedule[], locationKey: string) => {
      const existingMarker = markersRef.current.get(locationKey);
      if (!existingMarker || !existingMarker.content) return;

      const newContent = createMarkerContent(
        groupSchedules.length > 1
          ? `${groupSchedules.length}개 일정`
          : groupSchedules[0].title,
      );
      existingMarker.content = newContent;

      google.maps.event.clearListeners(existingMarker, "click");
      if (onMarkerClickRef.current) {
        existingMarker.addListener("click", () => {
          onMarkerClickRef.current?.(groupSchedules, existingMarker);
        });
      }
    },
    [],
  );

  // === 데이터 로드 ===
  useEffect(() => {
    if (!groupId) return;

    initialZoomDoneRef.current = false;

    const loadSchedules = async () => {
      setIsLoading(true);
      try {
        const data = await scheduleApi.getSchedules(groupId);
        setSchedules(data);
      } catch (error) {
        toast({
          title: "일정을 불러오지 못했습니다.",
          icon: "error",
          position: "top",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSchedules();
  }, [groupId]);

  // === 마커 업데이트 ===
  useEffect(() => {
    if (!map) return;

    const updateAllMarkers = async () => {
      // Google Maps 라이브러리 로드
      if (!markerClassRef.current) {
        markerClassRef.current = await loadMarkerLibrary();
      }

      const newScheduleGroups = groupSchedulesByLocation(schedules);
      const currentLocationKeys = new Set(markersRef.current.keys());
      const newLocationKeys = new Set(newScheduleGroups.keys());

      // 제거된 위치의 마커들 삭제
      currentLocationKeys.forEach((locationKey) => {
        if (!newLocationKeys.has(locationKey)) {
          const marker = markersRef.current.get(locationKey);
          if (marker) {
            marker.map = null;
            markersRef.current.delete(locationKey);
          }
        }
      });

      // 새로운/업데이트된 마커 처리
      newScheduleGroups.forEach((groupSchedules, locationKey) => {
        if (currentLocationKeys.has(locationKey)) {
          updateGroupMarker(groupSchedules, locationKey);
        } else {
          createGroupMarker(groupSchedules, locationKey);
        }
      });

      // 초기 줌 처리
      handleInitialZoom();
    };

    const handleInitialZoom = () => {
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
  }, [
    map,
    schedules,
    groupSchedulesByLocation,
    createGroupMarker,
    updateGroupMarker,
  ]);

  // === 실시간 구독 ===
  useEffect(() => {
    if (!groupId) return;

    const handleRealtimeChange = async (
      payload: RealtimePostgresChangesPayload<Schedule>,
    ) => {
      const { eventType, new: newSchedule, old } = payload;

      switch (eventType) {
        case "INSERT":
          if (newSchedule) {
            setSchedules((prev) => [...prev, newSchedule]);
          }
          break;
        case "DELETE":
          if (old?.id) {
            setSchedules((prev) => prev.filter((s) => s.id !== old.id));
          }
          break;
        case "UPDATE":
          if (newSchedule) {
            setSchedules((prev) =>
              prev.map((s) => (s.id === newSchedule.id ? newSchedule : s)),
            );
          }
          break;
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

  // === 정리 ===
  useEffect(() => {
    return () => clearAllMarkers(markersRef.current);
  }, []);

  return { schedules, isLoading };
}
