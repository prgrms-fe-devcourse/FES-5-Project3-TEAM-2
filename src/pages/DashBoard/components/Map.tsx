import { Wrapper } from "@googlemaps/react-wrapper";
import { useCallback, useEffect } from "react";

// 컴포넌트
import GoogleMap from "./GoogleMap";
import MapZoom from "./MapZoom";
import SearchBox from "./SearchBox";
import SearchResults from "./SearchResults";

// 훅
import { useSearchPlace } from "../hooks/useSearchPlace";
import { useMapHandlers } from "../hooks/useMapHandler";
import { useSearchMarkers } from "../hooks/useSearchMarkers";
import { useScheduleMarkers } from "../hooks/useScheduleMarkers";
import { useInfoWindow } from "../hooks/useInfoWindow";
import { useMapClick } from "../hooks/useMapClick";

// 유틸리티
import { createSearchInfoContent } from "../utils/searchInfoContent";
import { createScheduleInfoContent } from "../utils/scheduleInfoContent";
import { createMapClickInfoContent } from "../utils/mapClickInfoContent";

// 타입
import type { SearchResult } from "../types/map";
import type { Schedule } from "../api/mapSchedule";

type ScheduleItem =
  | { lat: number; lng: number; address: string }
  | SearchResult;

function Map() {
  const groupId = "d02a8611-bfac-4c54-8251-2c5af49ab183";

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
    groupId,
    onMarkerClick: handleScheduleMarkerClick,
  });

  // === 핸들러 ===
  const handleAddSchedule = useCallback(
    (item: ScheduleItem) => {
      console.log("일정 추가:", item);
      hideInfo();
    },
    [hideInfo],
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
    },
    [map, showInfo, handleAddSchedule],
  );

  const handleMapClick = useCallback(
    (location: {
      lat: number;
      lng: number;
      address: string;
      clickEvent: google.maps.MapMouseEvent;
    }) => {
      if (!map) return;
      const content = createMapClickInfoContent(location, handleAddSchedule);
      const position =
        location.clickEvent.latLng ||
        new google.maps.LatLng(location.lat, location.lng);
      showInfo(
        map,
        position,
        content,
        "map-click",
        location,
        handleAddSchedule,
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
      </Wrapper>
    </div>
  );
}

export default Map;
