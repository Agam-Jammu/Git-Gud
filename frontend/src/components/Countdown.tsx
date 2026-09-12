export interface CountdownProps {
  secondsRemaining: number;
}

export function Countdown({ secondsRemaining }: CountdownProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Get ready</p>
      <p className="text-8xl font-bold tabular-nums text-arena-accent">{secondsRemaining}</p>
    </main>
  );
}
