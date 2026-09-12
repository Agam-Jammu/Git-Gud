import { useContext } from "react";

import { GameSessionContext, type GameSession } from "./gameSessionContext";

export function useGameSession(): GameSession {
  const session = useContext(GameSessionContext);

  if (!session) {
    throw new Error("useGameSession must be used inside a GameSessionProvider");
  }

  return session;
}
