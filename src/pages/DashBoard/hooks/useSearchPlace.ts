import { useState, useCallback } from "react";

interface SearchResult {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
}

export function useSearchPlace(map: google.maps.Map | null) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResultsVisible, setIsResultsVisible] = useState(false);

  const clearResults = useCallback(() => {
    setSearchResults([]);
    setIsResultsVisible(false);
  }, []);

  const hideResults = useCallback(() => {
    setIsResultsVisible(false);
  }, []);

  const showResults = useCallback(() => {
    if (searchResults.length > 0) {
      setIsResultsVisible(true);
    }
  }, []);

  const searchPlaces = useCallback(
    async (query: string) => {
      if (!query.trim() || !map) return;

      setIsSearching(true);
      setSearchResults([]);
      setIsResultsVisible(false);

      try {
        const { Place } = (await google.maps.importLibrary(
          "places",
        )) as google.maps.PlacesLibrary;

        const request = {
          textQuery: query.trim(),
          fields: ["displayName", "formattedAddress", "location", "rating"],
          locationBias: map.getCenter(),
        };

        const { places } = await Place.searchByText(request);

        if (places && places.length > 0) {
          const formattedResults: SearchResult[] = places
            .slice(0, 20)
            .map((place, idx) => ({
              id: place.location
                ? `${place.location.lat()}_${place.location.lng()}`
                : `place_${Date.now()}_${idx}`,
              name: place.displayName || "장소명 없음",
              address: place.formattedAddress || "주소 없음",
              location: {
                lat: place.location?.lat() || 0,
                lng: place.location?.lng() || 0,
              },
              rating: place.rating ?? undefined,
            }));

          setSearchResults(formattedResults);
          setIsResultsVisible(true);

          // 첫 번째 결과로 지도 이동
          if (formattedResults[0] && map) {
            map.panTo(formattedResults[0].location);
            map.setZoom(13);
          }
        }
      } catch (error) {
        console.error("Places search error:", error);
      }
      setIsSearching(false);
    },
    [map],
  );

  return {
    searchResults,
    isSearching,
    isResultsVisible,
    searchPlaces,
    clearResults,
    hideResults,
    showResults,
  };
}
