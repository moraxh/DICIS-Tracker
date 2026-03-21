import { useCallback, useEffect, useState } from "react";

const FAVORITES_KEY = "dicis_tracker_favorites";

const getLatestFavorites = () => {
  const stored = localStorage.getItem(FAVORITES_KEY);
  if (!stored) return new Set<string>();
  try {
    return new Set<string>(JSON.parse(stored));
  } catch {
    return new Set<string>();
  }
};

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  const loadFavorites = useCallback(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFavorites(new Set(parsed));
      } catch (error) {
        console.error("Error parsing favorites from localStorage:", error);
      }
    } else {
      setFavorites(new Set());
    }
  }, []);

  // Load favorites from localStorage on mount and listen to changes
  useEffect(() => {
    loadFavorites();
    setIsLoaded(true);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === FAVORITES_KEY) {
        loadFavorites();
      }
    };

    const handleCustomEvent = () => {
      loadFavorites();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("favorites-updated", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("favorites-updated", handleCustomEvent);
    };
  }, [loadFavorites]);

  const addFavorite = useCallback((id: string) => {
    const current = getLatestFavorites();
    if (!current.has(id)) {
      current.add(id);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(current)));
      window.dispatchEvent(new Event("favorites-updated"));
    }
  }, []);

  const removeFavorite = useCallback((id: string) => {
    const current = getLatestFavorites();
    if (current.has(id)) {
      current.delete(id);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(current)));
      window.dispatchEvent(new Event("favorites-updated"));
    }
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    const current = getLatestFavorites();
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(current)));
    window.dispatchEvent(new Event("favorites-updated"));
  }, []);

  const isFavorite = useCallback(
    (id: string) => {
      return favorites.has(id);
    },
    [favorites],
  );

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    isLoaded,
  };
}
