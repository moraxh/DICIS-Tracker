import { motion } from "motion/react";

export default function GlowCard({
  children,
  onClick,
  className,
  delay = 0,
  ...motionProps
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  delay?: number;
} & React.ComponentProps<typeof motion.div>) {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty(
      "--mouse-x",
      `${e.clientX - rect.left}px`,
    );
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };
  return (
    <motion.div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden group cursor-pointer h-full ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      {...motionProps}
    >
      <div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(0,0,0,0.06),transparent_40%)] dark:bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.08),transparent_40%)]" />
      <div className="relative z-10 h-full flex flex-col">{children}</div>
    </motion.div>
  );
}
