import { motion } from "motion/react";

import { fadeRise } from "../motion/presets";
import { categoryStyle, categoryTheme } from "../theme/categoryTheme";
import type { QuestionDto } from "../types";

export interface QuestionCardProps {
  question: QuestionDto;
  selectedOptionIndex: number | null;
  onSelect: (optionIndex: number) => void;
}

const OPTION_ENTRANCE_SECONDS = 0.38;
const OPTION_STAGGER_SECONDS = 0.07;

const OPTION_BASE = "w-full rounded-md border px-4 py-3 text-left transition-colors";

function optionClass(selected: boolean, locked: boolean): string {
  if (selected) {
    return `${OPTION_BASE} border-[color:rgb(var(--cat-accent-rgb))] text-slate-100 shadow-[0_0_28px_-6px_rgb(var(--cat-accent-rgb)/0.8)]`;
  }

  if (locked) {
    return `${OPTION_BASE} border-arena-border text-slate-400 opacity-60`;
  }

  return `${OPTION_BASE} border-arena-border text-slate-200 hover:border-[color:rgb(var(--cat-accent-rgb))]`;
}

export function QuestionCard({ question, selectedOptionIndex, onSelect }: QuestionCardProps) {
  const locked = selectedOptionIndex !== null;

  return (
    <motion.section
      className="cat-panel w-full max-w-2xl p-6"
      style={categoryStyle(categoryTheme(question.category))}
      variants={fadeRise}
      initial="hidden"
      animate="visible"
    >
      <h1 className="text-2xl font-semibold text-slate-100">{question.text}</h1>

      {question.codeSnippet ? (
        <pre className="mt-4 overflow-x-auto rounded-md bg-arena-background/80 p-4 text-sm text-slate-200">
          <code>{question.codeSnippet}</code>
        </pre>
      ) : null}

      <ul aria-label="Answer options" className="mt-6 flex flex-col gap-2">
        {question.options.map((option, index) => {
          const selected = index === selectedOptionIndex;

          return (
            <motion.li
              key={`${index}-${option}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: OPTION_ENTRANCE_SECONDS,
                delay: index * OPTION_STAGGER_SECONDS,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <motion.button
                type="button"
                onClick={() => onSelect(index)}
                disabled={locked}
                aria-pressed={selected}
                animate={{ scale: selected ? 1.03 : 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 22 }}
                className={optionClass(selected, locked)}
              >
                {option}
              </motion.button>
            </motion.li>
          );
        })}
      </ul>

      {locked ? (
        <p className="mt-4 text-sm text-slate-400">Answer locked in. Waiting for the others...</p>
      ) : null}
    </motion.section>
  );
}
