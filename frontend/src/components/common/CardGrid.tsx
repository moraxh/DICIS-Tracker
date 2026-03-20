"use client";

import { ReactNode } from "react";

interface CardGridProps {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4 | 6;
}

export default function CardGrid({ 
  children, 
  className = "",
  columns = 3 
}: CardGridProps) {
  
  const colStyles = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
  };

  return (
    <div className={`grid gap-6 ${colStyles[columns]} ${className}`}>
      {children}
    </div>
  );
}
