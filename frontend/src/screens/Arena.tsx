import { QuestionCard } from "../components/QuestionCard";
import type { QuestionStartPayload } from "../types";

export interface ArenaProps {
  question: QuestionStartPayload;
  secondsRemaining: number;
  selectedOptionIndex: number | null;
  onSelect: (optionIndex: number) => void;
}

export function Arena({ question, secondsRemaining, selectedOptionIndex, onSelect }: ArenaProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <header className="flex w-full max-w-2xl items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Question {question.questionNumber} of {question.totalQuestions}
          </p>
          <p className="mt-1 text-sm uppercase tracking-widest text-arena-accent">
            {question.question.category}
          </p>
        </div>

        <p
          aria-label="Seconds remaining"
          className={`text-4xl font-bold tabular-nums ${
            secondsRemaining <= 3 ? "text-arena-wrong" : "text-arena-accent"
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
