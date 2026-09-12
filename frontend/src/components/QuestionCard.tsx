import type { QuestionDto } from "../types";

export interface QuestionCardProps {
  question: QuestionDto;
  selectedOptionIndex: number | null;
  onSelect: (optionIndex: number) => void;
}

export function QuestionCard({ question, selectedOptionIndex, onSelect }: QuestionCardProps) {
  const locked = selectedOptionIndex !== null;

  return (
    <section className="w-full max-w-2xl rounded-xl border border-arena-border bg-arena-surface p-6">
      <h1 className="text-2xl font-semibold text-slate-100">{question.text}</h1>

      {question.codeSnippet ? (
        <pre className="mt-4 overflow-x-auto rounded-md bg-arena-background p-4 text-sm text-slate-300">
          <code>{question.codeSnippet}</code>
        </pre>
      ) : null}

      <ul className="mt-6 flex flex-col gap-2">
        {question.options.map((option, index) => {
          const selected = index === selectedOptionIndex;

          return (
            <li key={`${index}-${option}`}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                disabled={locked}
                aria-pressed={selected}
                className={`w-full rounded-md border px-4 py-3 text-left ${
                  selected
                    ? "border-arena-accent bg-arena-accent/10 text-arena-accent"
                    : "border-arena-border text-slate-200 hover:border-arena-accent"
                }`}
              >
                {option}
              </button>
            </li>
          );
        })}
      </ul>

      {locked ? (
        <p className="mt-4 text-sm text-slate-400">Answer locked in. Waiting for the others...</p>
      ) : null}
    </section>
  );
}
