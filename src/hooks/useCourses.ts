import { useEffect, useState } from "react";
import type { Course, CourseData } from "@/types/course";
import mockCourseData from "@/data/mockCourses.json";

interface UseCoursesResult {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Loads the course catalog.
 *
 * The mock data is a static bundled JSON file, so there's nothing to actually
 * "load" here — but this hook is shaped as if the data came from a network
 * request (isLoading/error states, a short artificial delay) so that:
 *   1. Downstream components (course list, filters) already handle loading/
 *      empty/error states correctly, as the assessment brief asks for.
 *   2. Swapping this for a real `fetch("/api/courses")` later is a one-line
 *      change inside this hook — nothing else in the app needs to change.
 */
export function useCourses(): UseCoursesResult {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;

    const timer = setTimeout(() => {
      if (canceled) return;
      try {
        const data = mockCourseData as CourseData;
        setCourses(data.courses);
      } catch {
        setError("Failed to load courses. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      canceled = true;
      clearTimeout(timer);
    };
  }, []);

  return { courses, isLoading, error };
}