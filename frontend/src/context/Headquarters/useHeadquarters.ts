"use client";

import { useContext } from "react";
import { HeadquartersContext } from "./HeadquartersContext";

export const useHeadquarters = () => useContext(HeadquartersContext);
