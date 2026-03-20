import { type ClassWithDetails, DaysOfWeek } from "./types";

export function secondsUntilNextHalfHour(): number {
  const now = new Date();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  let secondsUntilNextHalfHour: number;

  if (minutes < 30) {
    secondsUntilNextHalfHour = (29 - minutes) * 60 + (60 - seconds);
  } else {
    secondsUntilNextHalfHour = (59 - minutes) * 60 + (60 - seconds);
  }

  return secondsUntilNextHalfHour;
}

export function minutesUntilTime(timeString: string): number {
  const currentMinutes = getCurrentMinutes();
  const targetMinutes = timeToMinutes(timeString);
  return targetMinutes - currentMinutes;
}

export function formatTimeRemaining(minutes: number): string {
  if (minutes < 0) return "Ya pasó";
  if (minutes === 0) return "Ahora";
  if (minutes < 60) return `En ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `En ${hours}h ${mins}m` : `En ${hours}h`;
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function getCurrentMinutes(date: Date = new Date()): number {
  return timeToMinutes(
    `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`,
  );
}

export function isClassNow(
  cls: ClassWithDetails,
  currentMinutes: number,
): boolean {
  const startMinutes = timeToMinutes(cls.start);
  const endMinutes = timeToMinutes(cls.end);

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

export function isOutsideSchoolHours(): boolean {
  const now = new Date();
  const hours = now.getHours();
  const day = now.getDay();

  if (day === 0) return true;

  if (hours < 7 || hours >= 22) return true;

  return false;
}

export function getTodayOfWeek(): (typeof DaysOfWeek)[number] {
  const todayName = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toUpperCase();

  if (!DaysOfWeek.includes(todayName as (typeof DaysOfWeek)[number])) {
    throw new Error(`Invalid day of week: ${todayName}`);
  }

  return todayName as (typeof DaysOfWeek)[number];
}

export function removeAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(a.length + 1)
    .fill(null)
    .map(() => Array(b.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

export function fuzzySearch(
  query: string,
  target: string,
  maxDistance: number = 2,
): boolean {
  if (!query) return true;

  const normalizedQuery = removeAccents(query);
  const normalizedTarget = removeAccents(target);

  if (normalizedTarget.includes(normalizedQuery)) return true;

  const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 0);
  const targetWords = normalizedTarget.split(/\s+/).filter((w) => w.length > 0);

  return queryWords.every((qw) => {
    if (qw.length <= 2) {
      return targetWords.some((tw) => tw.includes(qw));
    }
    return targetWords.some((tw) => {
      if (tw.includes(qw)) return true;
      if (Math.abs(tw.length - qw.length) > maxDistance + 1) return false;
      return levenshteinDistance(qw, tw) <= maxDistance;
    });
  });
}

export function getSearchScore(
  query: string,
  target: string,
  maxDistance: number = 2,
): number {
  if (!query) return 100;

  const normalizedQuery = removeAccents(query);
  const normalizedTarget = removeAccents(target);

  if (normalizedTarget === normalizedQuery) return 100;
  if (normalizedTarget.startsWith(normalizedQuery)) return 90;
  if (normalizedTarget.includes(normalizedQuery)) return 80;

  const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 0);
  const targetWords = normalizedTarget.split(/\s+/).filter((w) => w.length > 0);

  let totalScore = 0;
  let allWordsMatch = true;

  for (const qw of queryWords) {
    let bestWordScore = 0;

    for (const tw of targetWords) {
      if (tw === qw) {
        bestWordScore = Math.max(bestWordScore, 70);
      } else if (tw.startsWith(qw)) {
        bestWordScore = Math.max(bestWordScore, 60);
      } else if (tw.includes(qw)) {
        bestWordScore = Math.max(bestWordScore, 50);
      } else if (qw.length > 2) {
        if (Math.abs(tw.length - qw.length) <= maxDistance + 1) {
          const dist = levenshteinDistance(qw, tw);
          if (dist <= maxDistance) {
            bestWordScore = Math.max(bestWordScore, 40 - dist * 10);
          }
        }
      }
    }

    if (bestWordScore === 0) {
      allWordsMatch = false;
      break;
    }
    totalScore += bestWordScore;
  }

  if (!allWordsMatch) return 0;

  return totalScore / queryWords.length;
}
