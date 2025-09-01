import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface EndMessageProps {
  showEndMessage: boolean;
  onHide: () => void;
  text?: string;
}

export const EndMessage = ({
  showEndMessage,
  onHide,
  text = "모든 사진을 불러왔습니다.",
}: EndMessageProps) => {
  const endMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showEndMessage) {
      const timer = setTimeout(() => {
        if (endMessageRef.current) {
          gsap.to(endMessageRef.current, {
            opacity: 0,
            y: 20,
            scale: 0.95,
            duration: 0.5,
            ease: "power2.in",
            onComplete: onHide,
          });
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [showEndMessage, onHide]);

  if (!showEndMessage) return null;

  return (
    <div
      ref={endMessageRef}
      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-4 py-2"
    >
      <div className="flex items-center space-x-2">
        <span className="text-1 text-gray-600 font-semibold">{text}</span>
      </div>
    </div>
  );
};
