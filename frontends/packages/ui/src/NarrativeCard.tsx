"use client";
import { AnimatePresence, motion } from "framer-motion";

export type NarrativeCardProps = {
  text: string;
  confidence: number;
  visible: boolean;
  className?: string;
};

export function NarrativeCard({ text, confidence, visible, className }: NarrativeCardProps) {
  const pct = Math.round(confidence * 100);
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          data-testid="narrative-card"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.4 }}
          className={`rounded-lg bg-ink/85 px-4 py-3 text-cream backdrop-blur ${className ?? ""}`}
        >
          <div className="font-serif-sc text-body leading-snug">{text}</div>
          <div className="mt-1 text-caption text-cream/70">
            <span>{pct}%</span>
            <span> confidence</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
