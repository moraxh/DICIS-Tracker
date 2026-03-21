import { useEffect, useState } from "react";

export type ScheduleModalItem = {
  id: string;
  name: string;
  type: "room" | "professor";
  location?: string;
};

let currentItem: ScheduleModalItem | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function openScheduleModal(item: ScheduleModalItem) {
  currentItem = item;
  notify();
}

export function closeScheduleModal() {
  currentItem = null;
  notify();
}

export function useScheduleModal() {
  const [selectedItem, setSelectedItem] = useState<ScheduleModalItem | null>(
    currentItem,
  );

  useEffect(() => {
    const listener = () => setSelectedItem(currentItem);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { selectedItem, openScheduleModal, closeScheduleModal };
}
