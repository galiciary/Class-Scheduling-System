"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  /** Shown as live feedback so the user knows the search is doing something. */
  resultCount: number;
}

/**
 * Controlled search input. Kept controlled (rather than holding its own state)
 * so the page owns the query and can derive the filtered list from it — one
 * source of truth, and the input stays reusable for other filters later.
 */
export function SearchBar({ value, onChange, resultCount }: SearchBarProps) {
  return (
    <div>
      <label htmlFor="course-search" className="sr-only">
        Search courses
      </label>
      <input
        id="course-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by course code, title, or instructor"
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none"
      />
      <p aria-live="polite" className="mt-2 text-xs text-slate-500">
        {resultCount} {resultCount === 1 ? "course" : "courses"}
        {value.trim() ? " matched" : " available"}
      </p>
    </div>
  );
}