import { Heart } from "lucide-react";
import { motion } from "motion/react";

export default function FavoriteButton({
  isFavorite,
  onClick,
  className = "",
  iconClassName = "w-4 h-4",
}: {
  isFavorite: boolean;
  onClick: () => void;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`rounded-full transition-colors ${
        isFavorite
          ? "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
          : "text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
      } ${className}`}
    >
      <Heart
        className={`${iconClassName} transition-transform ${isFavorite ? "fill-rose-500 scale-110" : "scale-100"}`}
      />
    </motion.button>
  );
}
