import { useRef, useCallback } from "react";
import { createScheduleInfoContent } from "../utils/scheduleInfoContent";
import type { Schedule } from "../api/mapSchedule";

type InfoWindowType = "schedule" | "search" | "map-click";

interface SearchResult {
  id: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  rating?: number;
}

interface ClickLocation {
  lat: number;
  lng: number;
  address: string;
}

type ScheduleItem = ClickLocation | SearchResult;

type InfoWindowData =
  | { type: "schedule"; schedules: Schedule[] }
  | { type: "search"; searchResult: SearchResult }
  | { type: "map-click"; location: ClickLocation };

interface CurrentInfoWindow {
  infoWindow: google.maps.InfoWindow;
  type: InfoWindowType;
  data: InfoWindowData;
  marker?: google.maps.marker.AdvancedMarkerElement;
  onAddSchedule?: (item: ScheduleItem) => void;
}

function createInfoWindowData(
  type: InfoWindowType,
  data?: Schedule[] | SearchResult | ClickLocation,
): InfoWindowData {
  switch (type) {
    case "schedule":
      return {
        type: "schedule",
        schedules: Array.isArray(data) ? (data as Schedule[]) : [],
      };
    case "search":
      return {
        type: "search",
        searchResult: data as SearchResult,
      };
    case "map-click":
      return {
        type: "map-click",
        location: data as ClickLocation,
      };
  }
}

// === 메인 훅 ===
export function useInfoWindow() {
  // 현재 활성화된 InfoWindow 상태 저장
  const currentInfoRef = useRef<CurrentInfoWindow | null>(null);

  // Schedule InfoWindow 내용 업데이트 (실시간 변경 대응)
  const updateScheduleInfoWindow = useCallback(
    (updatedSchedules: Schedule[]) => {
      const current = currentInfoRef.current;
      if (!current || current.type !== "schedule") return;

      // 새로운 내용으로 HTML 재생성 및 적용
      const content = createScheduleInfoContent(
        updatedSchedules,
        current.onAddSchedule,
      );
      current.infoWindow.setContent(content);

      // 내부 데이터 동기화
      if (current.data.type === "schedule") {
        current.data.schedules = updatedSchedules;
      }
    },
    [],
  );

  // InfoWindow 표시
  const showInfo = useCallback(
    (
      map: google.maps.Map,
      anchor: google.maps.marker.AdvancedMarkerElement | google.maps.LatLng,
      content: HTMLElement | string,
      type: InfoWindowType = "map-click",
      data?: Schedule[] | SearchResult | ClickLocation,
      onAddSchedule?: (item: ScheduleItem) => void,
    ) => {
      // 기존 InfoWindow 닫기
      hideInfo();

      // Google Maps InfoWindow 생성
      const infoWindow = new google.maps.InfoWindow({ content });

      if (anchor instanceof google.maps.LatLng) {
        infoWindow.setPosition(anchor);
        infoWindow.open(map);
      } else {
        infoWindow.open(map, anchor);
      }

      // 상태 저장 (실시간 업데이트)
      currentInfoRef.current = {
        infoWindow,
        type,
        data: createInfoWindowData(type, data),
        marker: anchor instanceof google.maps.LatLng ? undefined : anchor,
        onAddSchedule,
      };
    },
    [],
  );

  // InfoWindow 닫기
  const hideInfo = useCallback(() => {
    if (currentInfoRef.current) {
      currentInfoRef.current.infoWindow.close();
      currentInfoRef.current = null;
    }
  }, []);

  // 현재 표시중인 Schedule 목록 반환
  const getCurrentSchedules = useCallback((): Schedule[] => {
    const current = currentInfoRef.current;
    if (!current || current.type !== "schedule") return [];

    return current.data.type === "schedule" ? current.data.schedules : [];
  }, []);

  return {
    showInfo,
    hideInfo,
    updateScheduleInfoWindow,
    getCurrentSchedules,
  };
}
