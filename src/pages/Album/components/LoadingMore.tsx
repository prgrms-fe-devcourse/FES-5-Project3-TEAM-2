const LoadingMore = () => (
  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-4 py-2">
    <div className="flex items-center space-x-2">
      <span className="text-1 text-gray-600 font-semibold">로딩중</span>
      <div className="flex space-x-1">
        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      </div>
    </div>
  </div>
);

export default LoadingMore;
