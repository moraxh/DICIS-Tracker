"use client";

import { createContext } from "react";

type HeadquartersContextType = {
  availableHeadquarters: string[];
  selectedHeadquarters: string;
  setSelectedHeadquarters: (headquarters: string) => void;
};

export const HeadquartersContext = createContext<HeadquartersContextType>({
  availableHeadquarters: [],
  selectedHeadquarters: "",
  setSelectedHeadquarters: () => {},
});
