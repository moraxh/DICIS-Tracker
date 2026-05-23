import { useCallback, useEffect, useState } from "react";

const VISITS_KEY = "survey_visits";
const SUBMITTED_KEY = "survey_submitted";
const DISMISSED_KEY = "survey_dismissed_at";

const VISITS_THRESHOLD = 3;
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

export function useSurveyModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(SUBMITTED_KEY) === "true") return;

    const dismissedAt = Number(localStorage.getItem(DISMISSED_KEY) ?? 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) return;

    const visits = Number(localStorage.getItem(VISITS_KEY) ?? 0) + 1;
    localStorage.setItem(VISITS_KEY, String(visits));

    if (visits >= VISITS_THRESHOLD) setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setIsOpen(false);
  }, []);

  const markSubmitted = useCallback(() => {
    localStorage.setItem(SUBMITTED_KEY, "true");
    setIsOpen(false);
  }, []);

  return { isOpen, close, markSubmitted };
}
