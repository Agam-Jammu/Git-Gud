import type { PlayerDto, QuestionDto } from "../types";

export interface RoundRevealProps {
  question: QuestionDto | null;
  correctOptionIndex: number;
  explanation: string;
  scoreboard: PlayerDto[];
  selectedOptionIndex: number | null;
}

function optionClass(index: number, correctOptionIndex: number, selectedOptionIndex: number | null): string {
  if (index === correctOptionIndex) {
    return "border-arena-correct text-arena-correct";
  }
  if (index === selectedOptionIndex) {
    return "border-arena-wrong text-arena-wrong";
  }
  return "border-arena-border text-slate-400";
}

export function RoundReveal({
  question,
  correctOptionIndex,
  explanation,
  scoreboard,
  selectedOptionIndex,
}: RoundRevealProps) {
  const answered = selectedOptionIndex !== null;
  const answeredCorrectly = selectedOptionIndex === correctOptionIndex;
  const headline = !answered ? "Time up" : answeredCorrectly ? "Correct" : "Not quite";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Round over</p>
        <h1
          className={`mt-2 text-4xl font-semibold ${
            answeredCorrectly ? "text-arena-correct" : "text-arena-wrong"
          }`}
        >
          {headline}
        </h1>
      </header>

      {question ? (
        <section className="w-full max-w-2xl rounded-xl border border-arena-border bg-arena-surface p-6">
          <p className="text-sm uppercase tracking-widest text-arena-accent">{question.category}</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-100">{question.text}</h2>

          <ul aria-label="Answer options" className="mt-4 flex flex-col gap-2">
            {question.options.map((option, index) => (
              <li
                key={`${index}-${option}`}
                className={`rounded-md border px-4 py-3 ${optionClass(
                  index,
                  correctOptionIndex,
                  selectedOptionIndex,
                )}`}
              >
                {option}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-sm text-slate-300">{explanation}</p>
        </section>
      ) : null}

      <section className="w-full max-w-2xl rounded-xl border border-arena-border bg-arena-surface p-6">
        <h2 className="text-sm uppercase tracking-widest text-slate-400">Scoreboard</h2>

        <ol aria-label="Scoreboard" className="mt-4 flex flex-col gap-2">
          {scoreboard.map((player, index) => (
            <li
              key={`${index}-${player.name}`}
              className="flex items-center justify-between rounded-md border border-arena-border px-3 py-2"
            >
              <span className="text-slate-100">{player.name}</span>
              <span className="flex items-center gap-2 tabular-nums">
                <span className="text-slate-300">{player.score.toLocaleString("en-US")}</span>
                {player.streak > 1 ? (
                  <span className="text-xs uppercase tracking-widest text-arena-accent">
                    {player.streak} streak
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
