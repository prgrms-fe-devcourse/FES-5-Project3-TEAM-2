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
import { createInfoContent } from "../utils/createInfoContent";
import type { SearchResult } from "../types/map";

function Map() {
  const { map, handleMapLoad, handleZoom, handleResultClick } = useMapHandlers();
  const {
    searchResults,
    isSearching,
    isResultsVisible,
    searchPlaces,
    clearResults,
    hideResults,
    showResults
  } = useSearchPlace(map);

  const handleSearch = useCallback(
    (query: string) => {
      searchPlaces(query);
    },
    [searchPlaces],
  );
  
  const { showInfo, hideInfo } = useInfoWindow();

  const handleAddSchedule = useCallback(
    (place: SearchResult) => {
      console.log('일정 추가:', place);
      hideInfo();
    },
    [hideInfo]
  );
  
  const handleMarkerClick = useCallback(
    (place: SearchResult, marker: google.maps.marker.AdvancedMarkerElement) => {
      
      if (map) {
        const htmlContent = createInfoContent(place, handleAddSchedule);
        showInfo(map, marker, htmlContent);
      }
    },
    [map, showInfo, handleAddSchedule]
  );

  useSearchMarkers({map, searchResults, onMarkerClick: handleMarkerClick });
  

  return (
    <div className="flex-1 relative">
      <Wrapper
        apiKey="google_api_key"
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
