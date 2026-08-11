"use client";

import { BarChart3, DoorOpen, ShoppingBag } from "lucide-react";
import { useState } from "react";
import LayoutSection from "@/components/common/LayoutSection";
import PageHeader from "@/components/common/PageHeader";
import Tabs from "@/components/common/Tabs";
import AffluenceRadar from "@/components/pages/home/AffluenceRadar";

type InsightView = "occupancy" | "opportunity";

export default function InsightsPage() {
  const [view, setView] = useState<InsightView>("occupancy");

  return (
    <LayoutSection className="mt-6 space-y-5 pb-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <PageHeader title="Insights del campus" icon={BarChart3} />
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            Explora los horarios con mayor actividad y descubre cuándo hay más
            posibilidades de encontrar estudiantes disponibles.
          </p>
        </div>
        <Tabs
          tabs={[
            { id: "occupancy", label: "Ocupación", icon: DoorOpen },
            { id: "opportunity", label: "Oportunidad", icon: ShoppingBag },
          ]}
          activeTab={view}
          onChange={setView}
        />
      </div>

      <AffluenceRadar mode={view} />
    </LayoutSection>
  );
}
