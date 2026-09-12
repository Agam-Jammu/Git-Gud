import { QuestionCard } from "../components/QuestionCard";
import { categoryStyle, categoryTheme } from "../theme/categoryTheme";
import type { QuestionStartPayload } from "../types";

export interface ArenaProps {
  question: QuestionStartPayload;
  secondsRemaining: number;
  selectedOptionIndex: number | null;
  onSelect: (optionIndex: number) => void;
}

export function Arena({ question, secondsRemaining, selectedOptionIndex, onSelect }: ArenaProps) {
  const urgent = secondsRemaining <= 3;

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-6 p-8"
      style={categoryStyle(categoryTheme(question.question.category))}
    >
      <header className="flex w-full max-w-2xl items-end justify-between">
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
      </header>

      <QuestionCard
        question={question.question}
        selectedOptionIndex={selectedOptionIndex}
        onSelect={onSelect}
      />
    </main>
  );
}
