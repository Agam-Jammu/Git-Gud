export type OptionOutcome = "correct" | "chosen" | "neutral";

export function optionOutcome(
  index: number,
  correctOptionIndex: number,
  selectedOptionIndex: number | null,
): OptionOutcome {
  if (index === correctOptionIndex) {
    return "correct";
  }

  if (index === selectedOptionIndex) {
    return "chosen";
  }

  return "neutral";
}

export function optionOutcomeClass(outcome: OptionOutcome): string {
  switch (outcome) {
    case "correct":
      return "border-arena-correct bg-arena-correct/10 text-arena-correct";
    case "chosen":
      return "border-arena-wrong bg-arena-wrong/10 text-arena-wrong";
    default:
      return "border-[color:rgb(var(--cat-accent-rgb)/0.22)] bg-[rgb(var(--cat-surface-rgb)/0.4)] text-slate-300";
  }
}
