import { useRef } from "react";
import { addInfoWindowStyles } from "../utils/addInfoWindowStyles";

export function useInfoWindow() {
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const showInfo = async (
    map: google.maps.Map,
    target:
      | google.maps.marker.AdvancedMarkerElement
      | google.maps.LatLng
      | google.maps.LatLngLiteral,
    content: string | HTMLElement,
  ) => {
    try {
      addInfoWindowStyles();
      // InfoWindow 생성/재사용
      if (!infoWindowRef.current) {
        const { InfoWindow } = (await google.maps.importLibrary(
          "maps",
        )) as google.maps.MapsLibrary;
        infoWindowRef.current = new InfoWindow({ maxWidth: 280 });
      }

      // 콘텐츠 설정
      infoWindowRef.current.setContent(content);

      // 타입에 따라 처리
      if (target instanceof google.maps.marker.AdvancedMarkerElement) {
        infoWindowRef.current.open(map, target);
      } else {
        infoWindowRef.current.setPosition(target);
        infoWindowRef.current.open(map);
      }
    } catch (error) {
      console.error("InfoWindow 오류:", error);
    }
  };

  const hideInfo = () => infoWindowRef.current?.close();

  return { showInfo, hideInfo };
}
