import React from "react";

interface ResponsiveWrapperProps {
  children: React.ReactNode;
}

const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({ children }) => {
  return (
    <>
      {/* PC 사용 요청 - 1250px 미만에서만 표시 */}
      <div className="max-[1250px]:flex min-[1250px]:hidden fixed inset-0 bg-white z-50 flex-col items-center justify-center overflow-y-auto">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">💻</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            PC에서 접속해주세요
          </h1>

          <p className="text-gray-600 text-lg mb-6">
            더 나은 경험을 위해
            <br />
            PC에서 접속해주시기 바랍니다.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 mb-4">
            <p className="font-medium mb-2">지원 환경</p>
            <ul className="text-left space-y-1">
              <li>• 데스크톱 브라우저</li>
              <li>• 화면 너비 1250px 이상</li>
            </ul>
          </div>
          <div className="bg-[#fff5f8] border border-primary rounded-lg p-3 text-sm text-primary">
            <p className="font-medium mb-1">💡 PC를 사용 중이신가요?</p>
            <p>브라우저 창을 최대화하거나 크게 조정해보세요.</p>
          </div>
        </div>
      </div>

      {/* 실제 화면 1250px 이상에서만 표시 */}
      <div className="hidden min-[1250px]:block">{children}</div>
    </>
  );
};

export default ResponsiveWrapper;
