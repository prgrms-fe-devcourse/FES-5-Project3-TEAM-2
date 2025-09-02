import { Wrapper } from "@googlemaps/react-wrapper";
import { useCallback, useEffect, useState } from "react";

// 컴포넌트
import GoogleMap from "./GoogleMap";
import MapZoom from "./MapZoom";
import SearchBox from "./SearchBox";
import SearchResults from "./SearchResults";
import AddScheduleModal from "./AddScheduleModal";

// 훅
import { useSearchPlace } from "../hooks/useSearchPlace";
import { useMapHandlers } from "../hooks/useMapHandler";
import { useSearchMarkers } from "../hooks/useSearchMarkers";
import { useScheduleMarkers } from "../hooks/useScheduleMarkers";
import { useInfoWindow } from "../hooks/useInfoWindow";
import { useMapClick, reverseGeocode } from "../hooks/useMapClick";

// 유틸리티
import { createSearchInfoContent } from "../utils/searchInfoContent";
import { createScheduleInfoContent } from "../utils/scheduleInfoContent";
import { createMapClickInfoContent } from "../utils/mapClickInfoContent";

// 타입
import type { SearchResult } from "../types/map";
import type { Schedule } from "../api/mapSchedule";
import { usePlanStore } from "../store/planStore";
import { useGroupStore } from "../store/groupStore";
import { useFocusStore } from "../store/focusStore";

type ScheduleItem =
  | { lat: number; lng: number; address: string }
  | SearchResult;

type MapClickLocation = {
  lat: number;
  lng: number;
  address?: string;
  clickEvent: google.maps.MapMouseEvent;
};

type ScheduleModalData = {
  location: {
    lat: number;
    lng: number;
    address?: string;
    name?: string;
  };
  day: string;
  groupId: string;
};

function Map() {
  const selectedDay = usePlanStore((state) => state.selectedDay);
  const group = useGroupStore((state) => state.group);
  const groupId = group?.id;
  const clickedPlanItemId = useFocusStore((state) => state.planItemId);
  const clearPlanItemId = useFocusStore((state) => state.clearPlanItemId);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleModalData, setScheduleModalData] = useState<
    ScheduleModalData | undefined
  >(undefined);

  // === 기본 훅 ===
  const { map, handleMapLoad, handleZoom, handleResultClick } =
    useMapHandlers();
  const { showInfo, hideInfo, updateScheduleInfoWindow, getCurrentSchedules } =
    useInfoWindow();

  // === 검색 ===
  const {
    searchResults,
    isSearching,
    isResultsVisible,
    searchPlaces,
    clearResults,
    hideResults,
    showResults,
  } = useSearchPlace(map);

  // === 일정 ===
  const { schedules } = useScheduleMarkers({
    map,
    groupId: groupId || "",
    onMarkerClick: handleScheduleMarkerClick,
  });

  // === 핸들러 ===
  const handleAddSchedule = useCallback(
    async (item: ScheduleItem | MapClickLocation) => {
      let scheduleItem: ScheduleModalData["location"];

      if ("clickEvent" in item) {
        // 지도 클릭 시
        const address = await reverseGeocode(item.lat, item.lng);
        scheduleItem = { lat: item.lat, lng: item.lng, address };
      } else if ("location" in item && "name" in item) {
        // 검색 시
        scheduleItem = {
          lat: item.location.lat,
          lng: item.location.lng,
          address: item.address,
          name: item.name,
        };
      } else {
        // 중복 일정
        scheduleItem = { lat: item.lat, lng: item.lng, address: item.address };
      }

      setScheduleModalData({
        location: scheduleItem,
        day:
          typeof selectedDay === "string"
            ? selectedDay
            : new Date().toISOString().split("T")[0],
        groupId: groupId || "",
      });
      setIsScheduleModalOpen(true);
      hideInfo();
    },
    [hideInfo, selectedDay, groupId],
  );

  const handleSearch = useCallback(
    (query: string) => {
      searchPlaces(query);
    },
    [searchPlaces],
  );

  const handleSearchMarkerClick = useCallback(
    (place: SearchResult, marker: google.maps.marker.AdvancedMarkerElement) => {
      if (!map) return;
      const content = createSearchInfoContent(place, handleAddSchedule);
      showInfo(map, marker, content, "search", place, handleAddSchedule);
      clearPlanItemId();
    },
    [map, showInfo, handleAddSchedule],
  );

  const handleMapClick = useCallback(
    (location: MapClickLocation) => {
      if (!map) return;

      const content = createMapClickInfoContent(
        { lat: location.lat, lng: location.lng },
        () => handleAddSchedule(location),
      );

      const position =
        location.clickEvent.latLng ||
        new google.maps.LatLng(location.lat, location.lng);

      const locationData = {
        lat: location.lat,
        lng: location.lng,
        address: "",
      };

      showInfo(map, position, content, "map-click", locationData, () =>
        handleAddSchedule(location),
      );
    },
    [map, showInfo, handleAddSchedule],
  );

  function handleScheduleMarkerClick(
    schedules: Schedule[],
    marker: google.maps.marker.AdvancedMarkerElement,
  ) {
    if (!map) return;
    const content = createScheduleInfoContent(schedules, handleAddSchedule);
    showInfo(map, marker, content, "schedule", schedules, handleAddSchedule);
  }

  // === 마커 등록 ===
  useSearchMarkers({
    map,
    searchResults,
    onMarkerClick: handleSearchMarkerClick,
  });

  useMapClick({
    map,
    onLocationClick: handleMapClick,
  });

  // === 실시간 업데이트 ===
  useEffect(() => {
    const currentSchedules = getCurrentSchedules();
    if (currentSchedules.length === 0) return;

    const firstSchedule = currentSchedules[0];
    const currentLocation = `${firstSchedule.latitude},${firstSchedule.longitude}`;

    const updatedSchedules = schedules.filter((s) => {
      if (!s.latitude || !s.longitude) return false;
      return `${s.latitude},${s.longitude}` === currentLocation;
    });

    const hasChanges =
      updatedSchedules.length !== currentSchedules.length ||
      JSON.stringify(updatedSchedules) !== JSON.stringify(currentSchedules);

    if (hasChanges) {
      updatedSchedules.length === 0
        ? hideInfo()
        : updateScheduleInfoWindow(updatedSchedules);
    }
  }, [schedules]);

  useEffect(() => {
    if (!map || !clickedPlanItemId) return;
    const targetSchedule = schedules.find((s) => s.id === clickedPlanItemId);

    if (targetSchedule && targetSchedule.latitude && targetSchedule.longitude) {
      const position = new google.maps.LatLng(
        targetSchedule.latitude,
        targetSchedule.longitude,
      );

      map.panTo(position);
      map.setZoom(15);
    }
  }, [clickedPlanItemId, map]);

  // === 렌더링 ===
  return (
    <div className="flex-1 relative">
      <Wrapper
        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        libraries={["places"]}
        version="weekly"
      >
        <GoogleMap onMapLoad={handleMapLoad} />

        <SearchBox
          onSearch={handleSearch}
          isSearching={isSearching}
          onClear={clearResults}
          onFocus={showResults}
        />

        <MapZoom
          onZoomIn={() => handleZoom(1)}
          onZoomOut={() => handleZoom(-1)}
        />

        <SearchResults
          results={searchResults}
          isVisible={isResultsVisible}
          onResultClick={handleResultClick}
          onHide={hideResults}
          onAddSchedule={handleAddSchedule}
        />

        <AddScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSuccess={() => {
            clearPlanItemId();
            setIsScheduleModalOpen(false);
          }}
          scheduleData={scheduleModalData}
        />
      </Wrapper>
    </div>
  );
}

export default Map;
