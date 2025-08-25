interface SearchResult {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
}

interface SearchResultsProps {
  results: SearchResult[];
  onResultClick: (location: { lat: number; lng: number }) => void;
}

function SearchResults({ results, onResultClick }: SearchResultsProps) {
  if (results.length === 0) return null;

  return (
    <div className="absolute top-24 left-12 right-12 max-h-80 overflow-y-auto bg-white rounded-xl">
      {results.map((result) => (
        <div
          key={result.id}
          className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
          onClick={() => onResultClick(result.location)}
        >
          <div className="font-semibold">{result.name}</div>
          <div className="text-sm text-gray-600">{result.address}</div>
          {result.rating && (
            <div className="text-sm text-yellow-500">⭐ {result.rating}</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default SearchResults;
