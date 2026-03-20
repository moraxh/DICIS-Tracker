import { useEffect, useState } from "react";
import type { Professor } from "@/backend/models/professor.model";
import type { Room } from "@/backend/models/room.model";
import { useFavorites } from "./useFavorites";

interface FavoriteData {
  rooms: Room[];
  professors: Professor[];
  isLoading: boolean;
}

export function useFavoritesData(): FavoriteData {
  const { favorites } = useFavorites();
  const [favoritesData, setFavoritesData] = useState<FavoriteData>({
    rooms: [],
    professors: [],
    isLoading: true,
  });

  useEffect(() => {
    const fetchFavoriteDetails = async () => {
      try {
        setFavoritesData((prev) => ({ ...prev, isLoading: true }));

        // Get all rooms
        const roomsResponse = await fetch("/api/v1/rooms");
        const roomsData = roomsResponse.ok ? await roomsResponse.json() : null;

        // Get all professors
        const professorsResponse = await fetch("/api/v1/professors");
        const professorsData = professorsResponse.ok
          ? await professorsResponse.json()
          : null;

        // Filter favorites
        const allRooms = roomsData
          ? [
              ...roomsData.freeRooms.map((r: { room: Room }) => r.room),
              ...roomsData.occupiedRooms.map((r: { room: Room }) => r.room),
            ]
          : [];

        const allProfessors = professorsData
          ? [
              ...professorsData.freeProfessors.map(
                (p: { professor: Professor }) => p.professor,
              ),
              ...professorsData.occupiedProfessors.map(
                (p: { professor: Professor }) => p.professor,
              ),
            ]
          : [];

        const favoriteRooms = allRooms.filter((room) => favorites.has(room.id));
        const favoriteProfessors = allProfessors.filter((prof) =>
          favorites.has(prof.id),
        );

        setFavoritesData({
          rooms: favoriteRooms,
          professors: favoriteProfessors,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching favorite details:", error);
        setFavoritesData({
          rooms: [],
          professors: [],
          isLoading: false,
        });
      }
    };

    fetchFavoriteDetails();
  }, [Array.from(favorites).sort().join(",")]);

  return favoritesData;
}
