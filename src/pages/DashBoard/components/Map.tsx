import { Wrapper } from "@googlemaps/react-wrapper";
import { useCallback } from "react";
import GoogleMap from "./GoogleMap";
import MapZoom from "./MapZoom";
import SearchBox from "./SearchBox";
import SearchResults from "./SearchResults";
import { useSearchPlace } from "../hooks/useSearchPlace";
import { useMapHandlers } from "../hooks/useMapHandler";
import { useSearchMarkers } from "../hooks/useSearchMarkers";

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

  useSearchMarkers(map, searchResults);

  const handleSearch = useCallback(
    (query: string) => {
      searchPlaces(query);
    },
    [searchPlaces],
  );

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
        />
      </Wrapper>
    </div>
  );
}

export default Map;
