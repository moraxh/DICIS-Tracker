"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { DoorOpen } from "lucide-react";
import AvailableRoomsSection from "./AvailableRooms";
import OccupiedRoomsSection from "./OccupiedRooms";
import PageHeader from "@/components/common/PageHeader";
import Tabs from "@/components/common/Tabs";
import LayoutSection from "@/components/common/LayoutSection";

export default function UnifiedRoomsSection() {
  const [activeTab, setActiveTab] = useState<"available" | "occupied">("available");

  return (
    <LayoutSection className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-4">
        <PageHeader 
          title="Salones" 
          icon={DoorOpen}
          className="border-none pb-0"
        />
        
        <Tabs
          tabs={[
            { id: "available", label: "Libres" },
            { id: "occupied", label: "Ocupados" }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 5 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "available" ? <AvailableRoomsSection hideTitle /> : <OccupiedRoomsSection hideTitle />}
        </motion.div>
      </AnimatePresence>
    </LayoutSection>
  );
}
