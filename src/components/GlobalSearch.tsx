"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface SearchResult {
  id: string;
  type: "child" | "teacher" | "classroom" | "parent";
  title: string;
  subtitle: string;
  link: string;
}

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const debounce = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(debounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function performSearch(searchQuery: string) {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockResults: SearchResult[] = [
        {
          id: "1",
          type: "child" as const,
          title: "Emma Johnson",
          subtitle: "Age 4 • Sunflower Room",
          link: "/dashboard/children/1",
        },
        {
          id: "2",
          type: "teacher" as const,
          title: "Sarah Johnson",
          subtitle: "Teacher • Sunflower Room",
          link: "/dashboard/teachers/1",
        },
        {
          id: "3",
          type: "classroom" as const,
          title: "Sunflower Room",
          subtitle: "18/20 enrolled • Toddlers",
          link: "/dashboard/classrooms/1",
        },
        {
          id: "4",
          type: "parent" as const,
          title: "Michael Johnson",
          subtitle: "Parent of Emma Johnson",
          link: "/dashboard/parents/1",
        },
      ].filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setResults(mockResults);
      setIsOpen(true);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case "child":
        return "👶";
      case "teacher":
        return "👩‍🏫";
      case "classroom":
        return "🏫";
      case "parent":
        return "👨‍👩‍👧";
      default:
        return "📄";
    }
  }

  function getTypeBadge(type: string) {
    const colors = {
      child: "bg-blue-100 text-blue-800",
      teacher: "bg-purple-100 text-purple-800",
      classroom: "bg-green-100 text-green-800",
      parent: "bg-orange-100 text-orange-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  }

  return (
    <div ref={searchRef} className="relative flex-1 max-w-xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search children, teachers, classrooms..."
          className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-600">
              Found {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {results.map((result) => (
              <Link
                key={result.id}
                href={result.link}
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl">{getTypeIcon(result.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 truncate">{result.title}</p>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeBadge(result.type)}`}>
                      {result.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{result.subtitle}</p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && results.length === 0 && query.length >= 2 && !loading && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
