import { useGameSession } from "../session/useGameSession";
import { ArenaBackdrop } from "./ArenaBackdrop";

export function ArenaBackdropLayer() {
  const { question } = useGameSession();

  return <ArenaBackdrop category={question?.question.category} />;
}
