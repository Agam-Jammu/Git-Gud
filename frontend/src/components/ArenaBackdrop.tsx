import { categoryStyle, categoryTheme } from "../theme/categoryTheme";

export interface ArenaBackdropProps {
  category?: string | null;
}

export function ArenaBackdrop({ category }: ArenaBackdropProps) {
  return (
    <div
      aria-hidden="true"
      data-testid="arena-backdrop"
      style={categoryStyle(categoryTheme(category))}
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute -left-1/4 -top-1/4 h-[70vh] w-[70vw] animate-drift rounded-full opacity-40 blur-3xl [animation-duration:26s]"
        style={{
          background:
            "radial-gradient(circle at center, rgb(var(--cat-accent-rgb) / 0.6), transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-1/4 -right-1/4 h-[65vh] w-[65vw] animate-drift rounded-full opacity-35 blur-3xl [animation-delay:-9s] [animation-direction:alternate-reverse] [animation-duration:34s]"
        style={{
          background:
            "radial-gradient(circle at center, rgb(var(--cat-accent-end-rgb) / 0.55), transparent 70%)",
        }}
      />
    </div>
  );
}
