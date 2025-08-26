import { useEffect, useRef } from "react";
import type { SearchResult } from "../types/map";

interface UseSearchMarkersProps {
  map: google.maps.Map | null;
  searchResults: SearchResult[];
  onMarkerClick: (place: SearchResult, marker: google.maps.marker.AdvancedMarkerElement) => void;
}

export function useSearchMarkers({ 
  map, 
  searchResults, 
  onMarkerClick 
}: UseSearchMarkersProps) {
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  useEffect(() => {
    if (!map) return;

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.map = null);
    markersRef.current = [];

    if (searchResults.length === 0) return;

    // 마커 생성
    const createMarkers = async () => {
      try {
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

        const newMarkers = searchResults.map((result) => {
        const div = document.createElement("div");
        div.style.width = "16px";
        div.style.height = "16px";
        div.style.background = "#F9B5D0";
        div.style.borderRadius = "50%";

        const marker = new AdvancedMarkerElement({
          position: result.location,
          map: map,
          content: div,
        });

        // 마커 클릭 시 동작
        marker.addListener("click", () => {
          onMarkerClick(result, marker);
        });

          return marker;
        });

        markersRef.current = newMarkers;
      } catch (error) {
        console.error('마커 생성 중 오류:', error);
      }
    };

    createMarkers();

    return () => {
      markersRef.current.forEach(marker => marker.map = null);
      markersRef.current = [];
    };
  }, [searchResults, map]);
}