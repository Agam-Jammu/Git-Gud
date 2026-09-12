import type { PlayerDto } from "../types";

export function isNameTaken(players: PlayerDto[], playerName: string): boolean {
  const wanted = playerName.trim().toLowerCase();

  return players.some((player) => player.name.toLowerCase() === wanted);
}
