"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";

interface LayoutSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function LayoutSection({ 
  children, 
  className = "",
  delay = 0
}: LayoutSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className={`space-y-6 ${className}`}
    >
      {children}
    </motion.section>
  );
}
