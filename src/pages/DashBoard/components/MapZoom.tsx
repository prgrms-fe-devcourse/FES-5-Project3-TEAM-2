import { FaPlus, FaMinus } from "react-icons/fa";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

function MapZoom({ onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 md:bottom-12 md:right-12 flex flex-col gap-3 sm:gap-4 md:gap-6">
      <button
        onClick={onZoomIn}
        className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-[2px_2px_2px_0_rgba(0,0,0,0.25)] flex items-center justify-center cursor-pointer"
      >
        <FaPlus className="text-base sm:text-lg md:text-2xl text-primary" />
      </button>
      <button
        onClick={onZoomOut}
        className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-[2px_2px_2px_0_rgba(0,0,0,0.25)] flex items-center justify-center cursor-pointer"
      >
        <FaMinus className="text-base sm:text-lg md:text-2xl text-primary" />
      </button>
    </div>
  );
}

export default MapZoom;
