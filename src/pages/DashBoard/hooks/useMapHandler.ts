import { useState, useCallback } from "react";

export function useMapHandlers() {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const handleZoom = useCallback(
    (zoomChange: number) => {
      if (!map) return;
      const currentZoom = map.getZoom();
      if (currentZoom === undefined) return;
      map.setZoom(currentZoom + zoomChange);
    },
    [map],
  );

  const handleResultClick = useCallback(
    (location: google.maps.LatLngLiteral) => {
      if (!map) return;
      map.panTo(location);
      map.setZoom(15);
    },
    [map],
  );

  return { map, handleMapLoad, handleZoom, handleResultClick };
}
