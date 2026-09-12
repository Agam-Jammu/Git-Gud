import { useCountUp } from "../hooks/useCountUp";

export interface ScoreCountUpProps {
  value: number;
}

export function ScoreCountUp({ value }: ScoreCountUpProps) {
  const shown = useCountUp(value);

  return <span className="tabular-nums text-slate-300">{shown.toLocaleString("en-US")}</span>;
}
