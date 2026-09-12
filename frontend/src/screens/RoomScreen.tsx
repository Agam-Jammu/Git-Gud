import { useParams } from "react-router-dom";

export function RoomScreen() {
  const { code } = useParams<{ code: string }>();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-8">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Room</p>
      <h1 className="text-4xl font-bold tracking-[0.2em] text-arena-accent">{code}</h1>
    </main>
  );
}
