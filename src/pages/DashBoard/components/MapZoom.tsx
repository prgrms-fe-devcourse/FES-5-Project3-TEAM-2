import { FaPlus, FaMinus } from "react-icons/fa";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

function MapZoom({ onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div className="absolute bottom-12 right-12 flex flex-col gap-6">
      <button
        onClick={onZoomIn}
        className="w-12 h-12 bg-white rounded-xl shadow-[2px_2px_2px_0_rgba(0,0,0,0.25)] flex items-center justify-center cursor-pointer"
      >
        <FaPlus className="text-2xl text-primary" />
      </button>
      <button
        onClick={onZoomOut}
        className="w-12 h-12 bg-white rounded-xl shadow-[2px_2px_2px_0_rgba(0,0,0,0.25)] flex items-center justify-center cursor-pointer"
      >
        <FaMinus className="text-2xl text-primary" />
      </button>
    </div>
  );
}

export default MapZoom;