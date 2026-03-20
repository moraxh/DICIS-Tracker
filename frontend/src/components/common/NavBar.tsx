"use client";

import { BookOpen, DoorOpen, Home, Heart, Users } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const location = usePathname();

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <nav className="flex items-center gap-1 p-1.5 rounded-xl bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md border border-zinc-200 dark:border-white/10 shadow-xl">
        {[
          { route: "/", label: "Inicio", icon: Home },
          { route: "/panel", label: "Mi Panel", icon: Heart },
          { route: "/rooms", label: "Salones", icon: DoorOpen },
          { route: "/professors", label: "Profesores", icon: Users },
          { route: "/subjects", label: "Materias", icon: BookOpen },
        ].map((tab) => {
          const isActive = location === tab.route;
          const Icon = tab.icon;
          return (
            <Link
              href={tab.route}
              key={tab.route}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors z-10 ${
                isActive
                  ? "text-zinc-900 dark:text-white"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-zinc-100 dark:bg-white/10 rounded-lg -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
