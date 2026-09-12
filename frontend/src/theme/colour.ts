const CALM_THRESHOLD_SECONDS = 3;

export function blendRgb(fromRgb: string, toRgb: string, amount: number): string {
  const clamped = Math.min(1, Math.max(0, amount));
  const [fromRed, fromGreen, fromBlue] = fromRgb.split(" ").map(Number);
  const [toRed, toGreen, toBlue] = toRgb.split(" ").map(Number);

  const mix = (from: number, to: number) => Math.round(from + (to - from) * clamped);

  return `${mix(fromRed, toRed)} ${mix(fromGreen, toGreen)} ${mix(fromBlue, toBlue)}`;
}

export function cssRgb(triplet: string): string {
  const [red, green, blue] = triplet.split(" ");

  return `rgb(${red}, ${green}, ${blue})`;
}

export function urgencyBlend(secondsRemaining: number): number {
  if (secondsRemaining >= CALM_THRESHOLD_SECONDS) {
    return 0;
  }

  if (secondsRemaining <= 1) {
    return 1;
  }

  return 0.5;
}
