import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { useState } from "react";
import SearchBox from "./SearchBox";
import { FaPlus, FaMinus } from "react-icons/fa";

function Map() {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const handleZoom = (zoomChange: number) => {
    if (!map) return;

    const currentZoom = map.getZoom();
    if (currentZoom === undefined) return;

    map.setZoom(currentZoom + zoomChange);
  };

  const zoomIn = () => handleZoom(1);
  const zoomOut = () => handleZoom(-1);

  return (
    <div className="flex-1 relative">
      <LoadScript googleMapsApiKey="google_api_key">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={{ lat: 37.5665, lng: 126.978 }}
          zoom={12}
          options={{
            disableDefaultUI: true,
          }}
          onLoad={setMap}
        />
        <div className="absolute top-12 left-12 right-12">
          <SearchBox />
        </div>
        {map && (
          <div className="absolute bottom-12 right-12 flex flex-col gap-6">
            <button
              onClick={zoomIn}
              className="w-12 h-12 bg-white rounded-xl shadow-[2px_2px_2px_0_rgba(0,0,0,0.25)] flex items-center justify-center cursor-pointer"
            >
              <FaPlus className="text-2xl text-primary" />
            </button>
            <button
              onClick={zoomOut}
              className="w-12 h-12 bg-white rounded-xl shadow-[2px_2px_2px_0_rgba(0,0,0,0.25)] flex items-center justify-center cursor-pointer"
            >
              <FaMinus className="text-2xl text-primary" />
            </button>
          </div>
        )}
      </LoadScript>
    </div>
  );
}
export default Map;
