import { Link } from "react-router-dom";

import { PracticeQuestionCard } from "../components/PracticeQuestionCard";
import { usePractice } from "../hooks/usePractice";

export function PracticeScreen() {
  const practice = usePractice();

  if (practice.loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-8">
        <p className="text-slate-400">Loading questions...</p>
      </main>
    );
  }

  if (practice.error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <p role="alert" className="text-arena-wrong">
          {practice.error}
        </p>
        <button
          type="button"
          onClick={practice.restart}
          className="rounded-md border border-arena-accent px-6 py-2 font-semibold text-arena-accent"
        >
          Try again
        </button>
      </main>
    );
  }

  if (practice.finished) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Practice complete</p>
        <h1 className="text-4xl font-semibold text-arena-accent">
          {practice.correctCount} / {practice.total}
        </h1>
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={practice.restart}
            className="rounded-md bg-arena-accent px-6 py-2 font-semibold text-arena-background"
          >
            Practise again
          </button>
          <Link to="/" className="text-sm text-slate-400 underline">
            Back to lobby
          </Link>
        </div>
      </main>
    );
  }

  const question = practice.current;

  if (!question) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-8">
        <p className="text-slate-400">No practice questions are available yet.</p>
        <Link to="/" className="text-sm text-slate-400 underline">
          Back to lobby
        </Link>
      </main>
    );
  }

  const lastQuestion = practice.index + 1 >= practice.total;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <header className="flex w-full max-w-2xl items-center justify-between">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Question {practice.index + 1} of {practice.total}
        </p>
        <p className="text-sm text-slate-400">
          Correct: <span className="tabular-nums text-arena-accent">{practice.correctCount}</span>
        </p>
      </header>

      <PracticeQuestionCard
        question={question}
        selectedOptionIndex={practice.selectedOptionIndex}
        onSelect={practice.select}
      />

      {practice.answered ? (
        <button
          type="button"
          onClick={practice.next}
          className="rounded-md bg-arena-accent px-6 py-2 font-semibold text-arena-background"
        >
          {lastQuestion ? "See results" : "Next question"}
        </button>
      ) : null}
    </main>
  );
}
