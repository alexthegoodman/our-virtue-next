import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./SearchBar.module.css";

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
  showButton?: boolean;
  buttonText?: string;
}

export default function SearchBar({
  currentLanguage = "en",
  placeholder = "Search poems...",
  showButton = false,
  buttonText = "Search",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const search = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setIsOpen(false);
        setSelectedIndex(-1);
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
          setSelectedIndex(-1);
        } else {
          console.error("Search error:", data.error);
          setResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentLanguage]
  );

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      search(query);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query, search]);

  const handleResultClick = (result: SearchResult) => {
    router.push(result.path);
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  if (showButton && !isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className={styles.searchButton}
      >
        <svg
          className={styles.searchIcon}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {buttonText}
        <kbd className={styles.buttonKbd}>⌘K</kbd>
      </button>
    );
  }

  return (
    <>
      {isOpen && <div className={styles.backdrop} />}

      <div
        ref={overlayRef}
        className={`${styles.container} ${isOpen ? styles.containerOpen : ""}`}
      >
        <div className={isOpen ? styles.searchWrapper : ""}>
          <div className={styles.inputWrapper}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`${styles.input} ${
                isOpen ? styles.inputOpen : styles.inputClosed
              }`}
              onFocus={() => query && setIsOpen(true)}
            />
            {isLoading && (
              <div className={styles.loadingSpinner}>
                <div className={styles.spinner}></div>
              </div>
            )}
            {!isLoading && query && (
              <div className={styles.escIndicator}>
                <kbd className={styles.kbd}>esc</kbd>
              </div>
            )}
          </div>

          {isOpen && results.length > 0 && (
            <div className={styles.resultsContainer}>
              {results.map((result, index) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className={`${styles.resultItem} ${
                    index === selectedIndex ? styles.resultItemSelected : ""
                  }`}
                >
                  <div className={styles.resultHeader}>
                    <h4
                      className={styles.resultTitle}
                      dangerouslySetInnerHTML={{
                        // __html: result._formatted?.title || result.title
                        __html: result.title,
                      }}
                    />
                    <span className={styles.resultLanguage}>
                      {result.language}
                    </span>
                  </div>
                  <p className={styles.resultChapter}>{result.chapter}</p>
                  <p
                    className={styles.resultContent}
                    dangerouslySetInnerHTML={{
                      // __html: result._formatted?.content?.substring(0, 150) + '...' ||
                      //         result.content.substring(0, 150) + '...'
                      __html: result.content.substring(0, 150) + "...",
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {isOpen && query && results.length === 0 && !isLoading && (
            <div className={styles.noResults}>
              <p className={styles.noResultsText}>
                No results found for "{query}"
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
