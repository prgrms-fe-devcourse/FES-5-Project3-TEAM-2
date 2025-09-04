import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import wrongLocation from "@/assets/icons/wrong-location.png";

const NotFound = () => {
  const imgRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      imgRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" },
    );
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex items-center max-w-4xl p-6">
        <img
          ref={imgRef}
          src={wrongLocation}
          alt="잘못된 위치"
          className="w-40 mr-8"
        />

        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            요청하신 페이지가 존재하지 않거나 <br /> 이동되었을 수 있습니다.
          </p>
          <Link
            to="/"
            className="block w-full text-center bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/80 transition-colors"
          >
            홈으로 이동
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
