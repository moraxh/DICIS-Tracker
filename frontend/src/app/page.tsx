"use client";

import { motion } from "motion/react";
import dynamic from "next/dynamic";

const AvailableRoomsSection = dynamic(
  () => import("@/components/pages/home/AvailableRooms"),
  { ssr: false },
);
const FavoritesSection = dynamic(
  () => import("@/components/pages/home/Favorites"),
  { ssr: false },
);
const UnifiedRoomsSection = dynamic(
  () => import("@/components/pages/home/UnifiedRoomsSection"),
  { ssr: false },
);
const UnifiedProfessorsSection = dynamic(
  () => import("@/components/pages/home/UnifiedProfessorsSection"),
  { ssr: false },
);

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-12"
    >
      <motion.div layout className="space-y-12">
        <FavoritesSection />
        <UnifiedRoomsSection />
      </motion.div>

      <motion.div layout className="space-y-12">
        <UnifiedProfessorsSection />
      </motion.div>
    </motion.div>
  );
}
