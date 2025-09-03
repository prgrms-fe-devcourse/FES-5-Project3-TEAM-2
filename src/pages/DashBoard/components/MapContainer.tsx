import { Wrapper } from "@googlemaps/react-wrapper";
import Map from "./Map";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function MapContainer() {
  return (
    <div className="flex-1 relative">
      <Wrapper
        apiKey={GOOGLE_MAPS_API_KEY}
        libraries={["places"]}
        version="weekly"
      >
        <Map />
      </Wrapper>
    </div>
  );
}

export default MapContainer;
