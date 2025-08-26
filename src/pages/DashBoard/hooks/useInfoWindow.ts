import { useRef } from "react";

export function useInfoWindow() {
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const showInfo = async (
    map: google.maps.Map, 
    marker: google.maps.marker.AdvancedMarkerElement, 
    content: string
  ) => {
    try {
      // 있으면 재사용
      if (!infoWindowRef.current) {
        const { InfoWindow } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        infoWindowRef.current = new InfoWindow({ maxWidth: 280 });
      }
      
      infoWindowRef.current.setContent(content);
      infoWindowRef.current.open(map, marker);
    } catch (error) {
      console.error('InfoWindow 오류:', error);
    }
  };

  const hideInfo = () => infoWindowRef.current?.close();

  return { showInfo, hideInfo };
}