"use client";

import { motion } from "motion/react";
import dynamic from "next/dynamic";

const sectionLoading = (height: string) => (
  <div
    className={`w-full ${height} bg-zinc-100 dark:bg-zinc-800/20 animate-pulse rounded-2xl border border-zinc-200 dark:border-white/5`}
  />
);

const FavoritesSection = dynamic(
  () => import("@/components/pages/home/Favorites"),
  { ssr: false, loading: () => sectionLoading("h-[150px]") },
);
const AvailableRoomsSection = dynamic(
  () => import("@/components/pages/home/AvailableRooms"),
  { ssr: false, loading: () => sectionLoading("h-[400px]") },
);
const OccupiedRoomsSection = dynamic(
  () => import("@/components/pages/home/OccupiedRooms"),
  { ssr: false, loading: () => sectionLoading("h-[300px]") },
);
const ProfessorsSection = dynamic(
  () => import("@/components/pages/home/Professors"),
  { ssr: false, loading: () => sectionLoading("h-[300px]") },
);

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      <motion.div layout className="space-y-8 lg:col-span-8">
        <FavoritesSection />
        <AvailableRoomsSection />
      </motion.div>

      <motion.div layout className="space-y-6 lg:col-span-4">
        <OccupiedRoomsSection />
        <ProfessorsSection />
      </motion.div>
    </motion.div>
  );
}
