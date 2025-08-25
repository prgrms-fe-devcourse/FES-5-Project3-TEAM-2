import { Wrapper } from "@googlemaps/react-wrapper";
import { useCallback } from "react";
import GoogleMap from "./GoogleMap";
import MapZoom from "./MapZoom";
import SearchBox from "./SearchBox";
import SearchResults from "./SearchResults";
import { useSearchPlace } from "../hooks/useSearchPlace";
import { useMapHandlers } from "../hooks/useMapHandler";

function Map() {
  const { map, handleMapLoad, handleZoom, handleResultClick } =
    useMapHandlers();
  const { searchResults, isSearching, searchPlaces, clearResults } =
    useSearchPlace(map);

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
        />

        <MapZoom
          onZoomIn={() => handleZoom(1)}
          onZoomOut={() => handleZoom(-1)}
        />

        <SearchResults
          results={searchResults}
          onResultClick={handleResultClick}
        />
      </Wrapper>
    </div>
  );
}

export default Map;
