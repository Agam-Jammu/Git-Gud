import { motion } from "motion/react";

import { categoryStyle, categoryTheme } from "../theme/categoryTheme";
import type { PlayerDto, QuestionDto } from "../types";
import { optionOutcome, optionOutcomeClass } from "./optionOutcome";

export interface RoundRevealProps {
  question: QuestionDto | null;
  correctOptionIndex: number;
  explanation: string;
  scoreboard: PlayerDto[];
  selectedOptionIndex: number | null;
}

const ROW_ENTRANCE_SECONDS = 0.38;
const ROW_STAGGER_SECONDS = 0.07;
const CORRECT_ANSWER_EXTRA_DELAY_SECONDS = 0.4;

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
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-6 p-8"
      style={categoryStyle(categoryTheme(question?.category))}
    >
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Round over</p>
        <h1
          className={`mt-2 text-5xl font-bold ${
            answeredCorrectly ? "text-arena-correct" : "text-arena-wrong"
          }`}
        >
          {headline}
        </h1>
      </header>

      {question ? (
        <section className="cat-panel w-full max-w-2xl p-6">
          <p className="cat-accent-text text-sm font-semibold uppercase tracking-widest">
            {question.category}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-100">{question.text}</h2>

          <ul aria-label="Answer options" className="mt-4 flex flex-col gap-2">
            {question.options.map((option, index) => {
              const outcome = optionOutcome(index, correctOptionIndex, selectedOptionIndex);
              const emphasis =
                outcome === "correct" ? " shadow-[0_0_30px_-8px_rgb(47_191_113/0.9)]" : "";
              const delay =
                index * ROW_STAGGER_SECONDS +
                (outcome === "correct" ? CORRECT_ANSWER_EXTRA_DELAY_SECONDS : 0);

              return (
                <motion.li
                  key={`${index}-${option}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: ROW_ENTRANCE_SECONDS, delay, ease: [0.16, 1, 0.3, 1] }}
                  className={`rounded-md border px-4 py-3${emphasis} ${optionOutcomeClass(outcome)}`}
                >
                  {option}
                </motion.li>
              );
            })}
          </ul>

          <p className="mt-4 text-sm text-slate-300">{explanation}</p>
        </section>
      ) : null}

      <section className="cat-panel w-full max-w-2xl p-6">
        <h2 className="text-sm uppercase tracking-widest text-slate-400">Scoreboard</h2>

        <ol aria-label="Scoreboard" className="mt-4 flex flex-col gap-2">
          {scoreboard.map((player, index) => (
            <motion.li
              key={`${index}-${player.name}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: ROW_ENTRANCE_SECONDS,
                delay: index * ROW_STAGGER_SECONDS,
                ease: [0.16, 1, 0.3, 1],
              }}
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
            </motion.li>
          ))}
        </ol>
      </section>
    </main>
  );
}
