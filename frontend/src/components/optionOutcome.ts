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
      return "border-arena-correct text-arena-correct";
    case "chosen":
      return "border-arena-wrong text-arena-wrong";
    default:
      return "border-arena-border text-slate-400";
  }
}
