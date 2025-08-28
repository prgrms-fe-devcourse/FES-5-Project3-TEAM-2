import { Wrapper } from "@googlemaps/react-wrapper";
import { useCallback } from "react";
import GoogleMap from "./GoogleMap";
import MapZoom from "./MapZoom";
import SearchBox from "./SearchBox";
import SearchResults from "./SearchResults";
import { useSearchPlace } from "../hooks/useSearchPlace";
import { useMapHandlers } from "../hooks/useMapHandler";
import { useSearchMarkers } from "../hooks/useSearchMarkers";
import { useInfoWindow } from "../hooks/useInfoWindow";
import { createSearchInfoContent } from "../utils/searchInfoContent";
import type { SearchResult } from "../types/map";
import { useScheduleMarkers } from "../hooks/useScheduleMarkers";
import { createScheduleInfoContent } from "../utils/scheduleInfoContent";
import { useMapClick } from "../hooks/useMapClick";
import { createMapClickInfoContent } from "../utils/mapClickInfoContent";
import type { Schedule } from "../api/mapSchedule";

type ScheduleItem =
  | { lat: number; lng: number; address: string }
  | SearchResult;

function Map() {
  const day = "2025-08-27";
  const groupId = "d02a8611-bfac-4c54-8251-2c5af49ab183";
  const { map, handleMapLoad, handleZoom, handleResultClick } =
    useMapHandlers();
  const {
    searchResults,
    isSearching,
    isResultsVisible,
    searchPlaces,
    clearResults,
    hideResults,
    showResults,
  } = useSearchPlace(map);

  const { showInfo, hideInfo } = useInfoWindow();

  // 일정 추가 핸들러
  const handleAddSchedule = useCallback(
    (item: ScheduleItem) => {
      console.log("일정 추가:", item);
      console.log(day);
      hideInfo();
    },
    [hideInfo],
  );

  // 검색 핸들러
  const handleSearch = useCallback(
    (query: string) => {
      searchPlaces(query);
    },
    [searchPlaces],
  );

  // 검색 마커 클릭 핸들러
  const handleSearchMarkerClick = useCallback(
    (place: SearchResult, marker: google.maps.marker.AdvancedMarkerElement) => {
      if (!map) return;

      const content = createSearchInfoContent(place, handleAddSchedule);
      showInfo(map, marker, content);
    },
    [map, showInfo, handleAddSchedule],
  );

  // 스케줄 마커 클릭 핸들러
  const handleScheduleMarkerClick = useCallback(
    (schedule: Schedule, marker: google.maps.marker.AdvancedMarkerElement) => {
      if (!map) return;

      const content = createScheduleInfoContent(schedule);
      showInfo(map, marker, content);
    },
    [map, showInfo],
  );

  // 지도 클릭 핸들러
  const handleMapClick = useCallback(
    (location: {
      lat: number;
      lng: number;
      address: string;
      clickEvent: google.maps.MapMouseEvent;
    }) => {
      if (!map) return;

      const content = createMapClickInfoContent(location, handleAddSchedule);
      const position = location.clickEvent.latLng || {
        lat: location.lat,
        lng: location.lng,
      };
      showInfo(map, position, content);
    },
    [map, showInfo, handleAddSchedule],
  );

  useSearchMarkers({
    map,
    searchResults,
    onMarkerClick: handleSearchMarkerClick,
  });

  useScheduleMarkers({
    map,
    groupId,
    onMarkerClick: handleScheduleMarkerClick,
  });

  useMapClick({
    map,
    onLocationClick: handleMapClick,
  });

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
