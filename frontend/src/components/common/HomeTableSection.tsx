"use client";

import type { ReactNode } from "react";
import CardGrid from "@/components/common/CardGrid";
import EmptyState from "@/components/common/EmptyState";
import LayoutSection from "@/components/common/LayoutSection";

type HomeTableVariant = "main" | "side";

type HomeTableSectionProps = {
  title: string;
  count?: number;
  countLabel?: string;
  variant?: HomeTableVariant;
  showCount?: boolean;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  skeletonCount?: number;
  skeletonClassName?: string;
  className?: string;
  contentClassName?: string;
  contentLayout?: "grid" | "stack";
  children?: ReactNode;
};

const variantConfig = {
  main: {
    columns: 2 as const,
    skeletonCount: 4,
    skeletonClassName:
      "w-full h-[152px] bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pulse",
  },
  side: {
    columns: 1 as const,
    skeletonCount: 3,
    skeletonClassName:
      "w-full h-[152px] bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pulse",
  },
};

export default function HomeTableSection({
  title,
  count,
  countLabel = "elementos",
  variant = "main",
  showCount = true,
  isLoading = false,
  isEmpty = false,
  emptyMessage = "No hay elementos para mostrar",
  skeletonCount,
  skeletonClassName,
  className = "",
  contentClassName = "",
  contentLayout = "grid",
  children,
}: HomeTableSectionProps) {
  const config = variantConfig[variant];
  const totalSkeletons = skeletonCount ?? config.skeletonCount;
  const skeletonStyles = skeletonClassName ?? config.skeletonClassName;

  return (
    <LayoutSection className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-white">
          {title}
        </h2>
        {showCount && count !== undefined && (
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {count} {countLabel}
          </span>
        )}
      </div>

      {isLoading ? (
        contentLayout === "grid" ? (
          <CardGrid columns={config.columns} className={contentClassName}>
            {Array.from(
              { length: totalSkeletons },
              (_, index) => `${title}-skeleton-${index}`,
            ).map((key) => (
              <div key={key} className={skeletonStyles} />
            ))}
          </CardGrid>
        ) : (
          <div className={contentClassName}>
            {Array.from(
              { length: totalSkeletons },
              (_, index) => `${title}-skeleton-${index}`,
            ).map((key) => (
              <div key={key} className={skeletonStyles} />
            ))}
          </div>
        )
      ) : isEmpty ? (
        <EmptyState message={emptyMessage} />
      ) : contentLayout === "grid" ? (
        <CardGrid columns={config.columns} className={contentClassName}>
          {children}
        </CardGrid>
      ) : (
        <div className={contentClassName}>{children}</div>
      )}
    </LayoutSection>
  );
}
