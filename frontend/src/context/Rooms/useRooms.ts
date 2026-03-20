import { useContext } from "react";
import { RoomsContext } from "./RoomsContext";

export const useRooms = () => useContext(RoomsContext);
