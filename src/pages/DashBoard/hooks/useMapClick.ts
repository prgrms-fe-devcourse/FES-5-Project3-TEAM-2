import { useCallback, useEffect, useRef } from "react";

interface UseMapClickProps {
  map: google.maps.Map | null;
  onLocationClick: (location: {
    lat: number;
    lng: number;
    address: string;
    clickEvent: google.maps.MapMouseEvent;
  }) => void;
}

export function useMapClick({ map, onLocationClick }: UseMapClickProps) {
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Geocoder 초기화
  useEffect(() => {
    if (map && !geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }
  }, [map]);

  // 좌표를 주소로 변환(reverseGeocode)
  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<string> => {
      if (!geocoderRef.current) return "주소를 가져올 수 없습니다";

      try {
        const response = await geocoderRef.current.geocode({
          location: { lat, lng },
        });

        if (response.results && response.results.length > 0) {
          console.log(response.results);
          return response.results[0].formatted_address;
        } else {
          return "주소를 찾을 수 없습니다";
        }
      } catch (error) {
        console.error("Reverse geocoding 오류:", error);
        return "주소를 가져오는 중 오류가 발생했습니다";
      }
    },
    [],
  );

  // 지도 클릭 이벤트
  const handleMapClick = useCallback(
    async (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;

      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      console.log("지도 클릭:", { lat, lng });

      const address = await reverseGeocode(lat, lng);

      onLocationClick({
        lat,
        lng,
        address,
        clickEvent: event,
      });
    },
    [reverseGeocode, onLocationClick],
  );

  // 지도 클릭 리스너 등록
  useEffect(() => {
    if (!map) return;

    const listener = map.addListener("click", handleMapClick);

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, handleMapClick]);
}
