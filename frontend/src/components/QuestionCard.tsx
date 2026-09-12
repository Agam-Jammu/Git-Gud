import type { QuestionDto } from "../types";

export interface QuestionCardProps {
  question: QuestionDto;
  questionNumber: number;
  totalQuestions: number;
}

export function QuestionCard({ question, questionNumber, totalQuestions }: QuestionCardProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Question {questionNumber} of {totalQuestions}
        </p>
        <p className="mt-1 text-sm uppercase tracking-widest text-arena-accent">
          {question.category}
        </p>
      </header>

      <section className="w-full max-w-2xl rounded-xl border border-arena-border bg-arena-surface p-6">
        <h1 className="text-2xl font-semibold text-slate-100">{question.text}</h1>

        {question.codeSnippet ? (
          <pre className="mt-4 overflow-x-auto rounded-md bg-arena-background p-4 text-sm text-slate-300">
            <code>{question.codeSnippet}</code>
          </pre>
        ) : null}

        <ul className="mt-6 flex flex-col gap-2">
          {question.options.map((option, index) => (
            <li
              key={`${index}-${option}`}
              className="rounded-md border border-arena-border px-4 py-3 text-slate-200"
            >
              {option}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
