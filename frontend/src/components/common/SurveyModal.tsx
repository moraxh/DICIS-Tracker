"use client";

import { Check, MessageSquareHeart, Star, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { getFingerprint } from "@/backend/fingerprint";
import { supabase } from "@/backend/supabase";
import BaseButton from "@/components/common/BaseButton";
import { useSurveyModal } from "@/hooks/useSurveyModal";

type PrimaryUse = "rooms" | "professors" | "both";

const USE_OPTIONS: { value: PrimaryUse; label: string }[] = [
  { value: "rooms", label: "Buscar salones" },
  { value: "professors", label: "Buscar profesores" },
  { value: "both", label: "Ambos" },
];

const ACCURACY_LABELS = [
  "",
  "Muy imprecisa",
  "Imprecisa",
  "Aceptable",
  "Precisa",
  "Muy precisa",
];

export default function SurveyModal() {
  const { isOpen, close, markSubmitted } = useSurveyModal();

  const [primaryUse, setPrimaryUse] = useState<PrimaryUse | null>(null);
  const [accuracy, setAccuracy] = useState(0);
  const [hoverAccuracy, setHoverAccuracy] = useState(0);
  const [bugReport, setBugReport] = useState("");
  const [comments, setComments] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) close();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  const handleSubmit = async () => {
    if (accuracy === 0) {
      setError("Selecciona qué tan precisa es la web con los salones.");
      return;
    }
    if (!supabase) {
      setError("Encuesta no disponible por ahora.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase
      .from("survey_responses")
      .insert({
        primary_use: primaryUse,
        room_accuracy: accuracy,
        bug_report: bugReport.trim() || null,
        comments: comments.trim() || null,
        fingerprint: getFingerprint(),
      });

    setSubmitting(false);

    if (insertError) {
      // 23505 = unique_violation → ya respondió desde este navegador
      if (insertError.code === "23505") {
        markSubmitted();
        return;
      }
      setError("No se pudo enviar. Intenta de nuevo.");
      return;
    }

    setDone(true);
    setTimeout(markSubmitted, 1500);
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg max-h-[90vh] bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-2xl border border-zinc-200 dark:border-white/10 flex flex-col overflow-hidden"
          >
            <div className="relative flex items-center justify-between p-6 border-b border-zinc-200 dark:border-white/10 shrink-0 overflow-hidden">
              <div
                aria-hidden
                className="absolute -top-16 -right-10 w-44 h-44 rounded-full bg-amber-400/20 blur-3xl pointer-events-none"
              />
              <div className="relative flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-400/15 text-amber-500">
                  <MessageSquareHeart className="w-5 h-5" />
                </span>
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight leading-none">
                    Tu opinión
                  </h2>
                  <span className="text-xs text-zinc-500 mt-1">
                    Toma 30 segundos
                  </span>
                </div>
              </div>
              <BaseButton
                variant="ghost"
                size="icon"
                onClick={close}
                className="relative rounded-full"
                aria-label="Cerrar encuesta"
              >
                <X className="w-5 h-5" />
              </BaseButton>
            </div>

            <div className="p-6 overflow-y-auto flex flex-col gap-6">
              {done ? (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500"
                  >
                    <Check className="w-8 h-8" strokeWidth={3} />
                  </motion.span>
                  <div className="flex flex-col gap-1">
                    <p className="text-lg font-bold text-zinc-900 dark:text-white">
                      ¡Gracias por tu feedback!
                    </p>
                    <p className="text-sm text-zinc-500">
                      Tu respuesta nos ayuda a mejorar.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      ¿Para qué usas la web?
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {USE_OPTIONS.map((opt) => (
                        <BaseButton
                          key={opt.value}
                          variant={
                            primaryUse === opt.value ? "primary" : "outline"
                          }
                          size="sm"
                          onClick={() => setPrimaryUse(opt.value)}
                        >
                          {opt.label}
                        </BaseButton>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                      ¿Qué tan precisa es con los salones reales?
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => {
                          const active = n <= (hoverAccuracy || accuracy);
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setAccuracy(n)}
                              onMouseEnter={() => setHoverAccuracy(n)}
                              onMouseLeave={() => setHoverAccuracy(0)}
                              aria-label={`${n} estrellas`}
                              className="p-1 rounded-md transition-transform hover:scale-110 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                            >
                              <Star
                                className={`w-7 h-7 transition-colors ${
                                  active
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-zinc-300 dark:text-zinc-600"
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                      <AnimatePresence mode="wait">
                        {(hoverAccuracy || accuracy) > 0 && (
                          <motion.span
                            key={hoverAccuracy || accuracy}
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-sm font-medium text-amber-500"
                          >
                            {ACCURACY_LABELS[hoverAccuracy || accuracy]}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="survey-bug"
                      className="text-xs font-bold uppercase tracking-wider text-zinc-500"
                    >
                      ¿Encontraste alguna falla? (opcional)
                    </label>
                    <textarea
                      id="survey-bug"
                      value={bugReport}
                      onChange={(e) => setBugReport(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02] p-3 text-sm text-zinc-900 dark:text-white resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="survey-comments"
                      className="text-xs font-bold uppercase tracking-wider text-zinc-500"
                    >
                      Comentarios extra (opcional)
                    </label>
                    <textarea
                      id="survey-comments"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02] p-3 text-sm text-zinc-900 dark:text-white resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-rose-500 font-medium">{error}</p>
                  )}

                  <BaseButton
                    variant="primary"
                    size="lg"
                    onClick={handleSubmit}
                    isLoading={submitting}
                    className="w-full"
                  >
                    Enviar
                  </BaseButton>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
