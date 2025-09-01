function Loading() {
  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full text-gray-500 transition-colors">
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex space-x-2 mb-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        </div>
        <p className="text-center text-lg font-medium text-gray-600">
          잠시만 기다려주세요
        </p>
      </div>
    </div>
  );
}
export default Loading;
