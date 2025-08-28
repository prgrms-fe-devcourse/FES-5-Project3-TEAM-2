import { useRef, useEffect } from "react";

interface GoogleMapProps {
  onMapLoad: (map: google.maps.Map) => void;
}

function GoogleMap({ onMapLoad }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 37.5665, lng: 126.978 },
      zoom: 12,
      restriction: {
        latLngBounds: {
          north: 85,
          south: -85,
          west: -180,
          east: 180,
        },
        strictBounds: true,
      },
      minZoom: 3,
      disableDefaultUI: true,
      mapId: "DEMO_MAP_ID",
      clickableIcons: false,
    });

    onMapLoad(map);
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}

export default GoogleMap;
