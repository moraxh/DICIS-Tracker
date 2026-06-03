"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import coursesData from "@/data/courses.json";
import { HeadquartersContext } from "./HeadquartersContext";

const STORAGE_KEY = "dicis-tracker:selected-headquarters";

type CourseRecord = {
  headquarters?: string;
};

export function HeadquartersProvider({ children }: { children: ReactNode }) {
  const availableHeadquarters = useMemo(() => {
    const unique = new Set(
      (coursesData as CourseRecord[])
        .map((course) => course.headquarters)
        .filter((headquarters): headquarters is string =>
          Boolean(headquarters),
        ),
    );

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, []);

  const [selectedHeadquarters, setSelectedHeadquartersState] = useState(
    () => availableHeadquarters[0] ?? "",
  );

  useEffect(() => {
    if (typeof window === "undefined" || availableHeadquarters.length === 0) {
      return;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && availableHeadquarters.includes(stored)) {
      setSelectedHeadquartersState(stored);
      return;
    }

    setSelectedHeadquartersState(availableHeadquarters[0]);
  }, [availableHeadquarters]);

  const setSelectedHeadquarters = (headquarters: string) => {
    setSelectedHeadquartersState(headquarters);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, headquarters);
    }
  };

  return (
    <HeadquartersContext.Provider
      value={{
        availableHeadquarters,
        selectedHeadquarters,
        setSelectedHeadquarters,
      }}
    >
      {children}
    </HeadquartersContext.Provider>
  );
}
