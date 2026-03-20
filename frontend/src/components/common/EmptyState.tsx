import { SearchX } from "lucide-react";
import { motion } from "motion/react";

export default function EmptyState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center col-span-full"
    >
      <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center mb-4">
        <SearchX className="w-8 h-8 text-zinc-400" />
      </div>
      <p className="text-zinc-500 dark:text-zinc-400 text-lg">{message}</p>
    </motion.div>
  );
}
