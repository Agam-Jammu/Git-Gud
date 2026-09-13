import { motion } from "motion/react";

import { QuestionCard } from "../components/QuestionCard";
import { categoryStyle, categoryTheme } from "../theme/categoryTheme";
import type { QuestionStartPayload } from "../types";

export interface ArenaProps {
  question: QuestionStartPayload;
  secondsRemaining: number;
  selectedOptionIndex: number | null;
  onSelect: (optionIndex: number) => void;
}

const ENTRANCE_SECONDS = 0.4;

export function Arena({ question, secondsRemaining, selectedOptionIndex, onSelect }: ArenaProps) {
  const urgent = secondsRemaining <= 3;

  return (
    <motion.main
      className="flex min-h-screen flex-col items-center justify-center gap-6 p-8"
      style={categoryStyle(categoryTheme(question.question.category))}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: ENTRANCE_SECONDS, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.header
        className="flex w-full max-w-2xl items-end justify-between"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: ENTRANCE_SECONDS, ease: [0.16, 1, 0.3, 1] }}
      >
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Question {question.questionNumber} of {question.totalQuestions}
          </p>
          <p className="cat-accent-text mt-1 text-sm font-semibold uppercase tracking-widest">
            {question.question.category}
          </p>
        </div>

        <p
          aria-label="Seconds remaining"
          className={`text-4xl font-bold tabular-nums transition-colors ${
            urgent ? "animate-pulse text-arena-wrong" : "cat-accent-text"
          }`}
        >
          {secondsRemaining}
        </p>
      </motion.header>

      <QuestionCard
        question={question.question}
        selectedOptionIndex={selectedOptionIndex}
        onSelect={onSelect}
      />
    </motion.main>
  );
}
