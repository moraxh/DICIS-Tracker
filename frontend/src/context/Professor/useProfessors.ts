import { useContext } from "react";
import { ProfessorsContext } from "./ProfessorsContext";

export const useProfessors = () => useContext(ProfessorsContext);
