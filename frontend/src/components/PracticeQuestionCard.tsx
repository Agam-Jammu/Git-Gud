import type { PracticeQuestionDto } from "../types";
import { optionOutcome, optionOutcomeClass } from "./optionOutcome";

export interface PracticeQuestionCardProps {
  question: PracticeQuestionDto;
  selectedOptionIndex: number | null;
  onSelect: (optionIndex: number) => void;
}

export function PracticeQuestionCard({
  question,
  selectedOptionIndex,
  onSelect,
}: PracticeQuestionCardProps) {
  const answered = selectedOptionIndex !== null;
  const answeredCorrectly = selectedOptionIndex === question.correctOptionIndex;

  return (
    <section className="w-full max-w-2xl rounded-xl border border-arena-border bg-arena-surface p-6">
      <p className="text-sm uppercase tracking-widest text-arena-accent">{question.category}</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-100">{question.text}</h1>

      {question.codeSnippet ? (
        <pre className="mt-4 overflow-x-auto rounded-md bg-arena-background p-4 text-sm text-slate-300">
          <code>{question.codeSnippet}</code>
        </pre>
      ) : null}

      <ul aria-label="Answer options" className="mt-6 flex flex-col gap-2">
        {question.options.map((option, index) => (
          <li key={`${index}-${option}`}>
            <button
              type="button"
              onClick={() => onSelect(index)}
              disabled={answered}
              aria-pressed={index === selectedOptionIndex}
              className={`w-full rounded-md border px-4 py-3 text-left ${
                answered
                  ? optionOutcomeClass(
                      optionOutcome(index, question.correctOptionIndex, selectedOptionIndex),
                    )
                  : "border-arena-border text-slate-200 hover:border-arena-accent"
              }`}
            >
              {option}
            </button>
          </li>
        ))}
      </ul>

      {answered ? (
        <div className="mt-4 flex flex-col gap-2">
          <p
            className={`text-sm font-semibold ${
              answeredCorrectly ? "text-arena-correct" : "text-arena-wrong"
            }`}
          >
            {answeredCorrectly ? "Correct" : "Not quite"}
          </p>
          <p className="text-sm text-slate-300">{question.explanation}</p>
        </div>
      ) : null}
    </section>
  );
}
