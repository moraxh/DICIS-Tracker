import { useCallback, useEffect, useState } from "react";

const MY_SUBJECTS_KEY = "dicis_tracker_my_subjects";

export function useMySubjects() {
  const [mySubjectIds, setMySubjectIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  const loadMySubjects = useCallback(() => {
    const stored = localStorage.getItem(MY_SUBJECTS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMySubjectIds(new Set(parsed));
      } catch (error) {
        console.error("Error parsing my subjects from localStorage:", error);
      }
    } else {
      setMySubjectIds(new Set());
    }
  }, []);

  useEffect(() => {
    loadMySubjects();
    setIsLoaded(true);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === MY_SUBJECTS_KEY) {
        loadMySubjects();
      }
    };

    const handleCustomEvent = () => {
      loadMySubjects();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("my-subjects-updated", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("my-subjects-updated", handleCustomEvent);
    };
  }, [loadMySubjects]);

  const getLatestMySubjects = () => {
    const stored = localStorage.getItem(MY_SUBJECTS_KEY);
    if (!stored) return new Set<string>();
    try {
      return new Set<string>(JSON.parse(stored));
    } catch {
      return new Set<string>();
    }
  };

  const addSubject = useCallback((id: string) => {
    const current = getLatestMySubjects();
    if (!current.has(id)) {
      current.add(id);
      localStorage.setItem(MY_SUBJECTS_KEY, JSON.stringify(Array.from(current)));
      window.dispatchEvent(new Event("my-subjects-updated"));
    }
  }, []);

  const removeSubject = useCallback((id: string) => {
    const current = getLatestMySubjects();
    if (current.has(id)) {
      current.delete(id);
      localStorage.setItem(MY_SUBJECTS_KEY, JSON.stringify(Array.from(current)));
      window.dispatchEvent(new Event("my-subjects-updated"));
    }
  }, []);

  const toggleSubject = useCallback((id: string) => {
    const current = getLatestMySubjects();
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    localStorage.setItem(MY_SUBJECTS_KEY, JSON.stringify(Array.from(current)));
    window.dispatchEvent(new Event("my-subjects-updated"));
  }, []);

  const isMySubject = useCallback(
    (id: string) => {
      return mySubjectIds.has(id);
    },
    [mySubjectIds],
  );

  return {
    mySubjectIds,
    addSubject,
    removeSubject,
    toggleSubject,
    isMySubject,
    isLoaded,
  };
}
