import { useEffect, useRef } from "react";
import type { SearchResult } from "../types/map";
import { toast } from "@/components/Sweetalert";

interface UseSearchMarkersProps {
  map: google.maps.Map | null;
  searchResults: SearchResult[];
  onMarkerClick: (
    place: SearchResult,
    marker: google.maps.marker.AdvancedMarkerElement,
  ) => void;
}

export const createMarkerContent = () => {
  const pin = document.createElement("div");

  // 클릭 가능 영역
  pin.style.width = "36px";
  pin.style.height = "48px";
  pin.style.display = "flex";
  pin.style.justifyContent = "center";
  pin.style.alignItems = "center";
  pin.style.cursor = "pointer";

  // 실제 보이는 마커
  pin.innerHTML = `
    <svg width="28" height="40" viewBox="0 0 56 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28 0C12.52 0 0 12.52 0 28C0 49 28 80 28 80C28 80 56 49 56 28C56 12.52 43.48 0 28 0ZM28 38C22.48 38 18 33.52 18 28C18 22.48 22.48 18 28 18C33.52 18 38 22.48 38 28C38 33.52 33.52 38 28 38Z" fill="#FF8E9E"/>
    </svg>
  `;

  pin.style.pointerEvents = "auto";

  return pin;
};

export function useSearchMarkers({
  map,
  searchResults,
  onMarkerClick,
}: UseSearchMarkersProps) {
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  useEffect(() => {
    if (!map) return;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => (marker.map = null));
    markersRef.current = [];

    if (searchResults.length === 0) return;

    // 마커 생성
    const createMarkers = async () => {
      try {
        const { AdvancedMarkerElement } = (await google.maps.importLibrary(
          "marker",
        )) as google.maps.MarkerLibrary;

        const newMarkers = searchResults.map((result) => {
          const marker = new AdvancedMarkerElement({
            position: result.location,
            map: map,
            content: createMarkerContent(),
          });

          // 마커 클릭 시 동작
          marker.addListener("click", () => {
            onMarkerClick(result, marker);
          });

          return marker;
        });

        markersRef.current = newMarkers;
      } catch (error) {
        toast({
          title: "마커 생성에 실패했습니다.",
          icon: "error",
          position: "top",
        });
      }
    };

    createMarkers();

    return () => {
      markersRef.current.forEach((marker) => (marker.map = null));
      markersRef.current = [];
    };
  }, [searchResults, map]);
}
