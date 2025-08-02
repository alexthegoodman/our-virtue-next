import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  chapter: string;
  language: string;
  path: string;
  _formatted?: {
    title: string;
    content: string;
  };
}

interface SearchBarProps {
  currentLanguage?: string;
  placeholder?: string;
}

export default function SearchBar({ currentLanguage = 'en', placeholder = 'Search poems...' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        language: currentLanguage,
      });

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data.hits || []);
        setIsOpen(true);
      } else {
        console.error('Search error:', data.error);
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      search(query);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query, search]);

  const handleResultClick = (result: SearchResult) => {
    router.push(result.path);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onFocus={() => query && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        {isLoading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {results.map((result) => (
            <div
              key={result.id}
              onClick={() => handleResultClick(result)}
              className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex justify-between items-start mb-1">
                <h4 
                  className="font-medium text-gray-900 truncate"
                  dangerouslySetInnerHTML={{ 
                    __html: result._formatted?.title || result.title 
                  }}
                />
                <span className="text-xs text-gray-500 ml-2 uppercase">
                  {result.language}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{result.chapter}</p>
              <p 
                className="text-sm text-gray-500 line-clamp-2"
                dangerouslySetInnerHTML={{ 
                  __html: result._formatted?.content?.substring(0, 150) + '...' || 
                          result.content.substring(0, 150) + '...'
                }}
              />
            </div>
          ))}
        </div>
      )}

      {isOpen && query && results.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <p className="text-gray-500 text-sm">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}