import { toast } from "@/components/Sweetalert";
import { useCallback, useEffect } from "react";

interface UseMapClickProps {
  map: google.maps.Map | null;
  onLocationClick: (location: {
    lat: number;
    lng: number;
    clickEvent: google.maps.MapMouseEvent;
  }) => void;
}

export function useMapClick({ map, onLocationClick }: UseMapClickProps) {
  // 지도 클릭 이벤트
  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;

      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      onLocationClick({
        lat,
        lng,
        clickEvent: event,
      });
    },
    [onLocationClick],
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

// geocoding 함수
export const reverseGeocode = async (
  lat: number,
  lng: number,
): Promise<string> => {
  const geocoder = new google.maps.Geocoder();

  try {
    const response = await geocoder.geocode({
      location: { lat, lng },
    });

    if (response.results && response.results.length > 0) {
      return response.results[0].formatted_address;
    } else {
      return "주소를 찾을 수 없습니다";
    }
  } catch (error) {
    toast({
      title: "주소를 가져오지 못했습니다.",
      icon: "error",
      position: "top",
    });
    return "주소를 가져오는 중 오류가 발생했습니다";
  }
};
