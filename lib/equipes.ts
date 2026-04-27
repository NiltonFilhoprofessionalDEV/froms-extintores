export const EQUIPES = ["ALFA", "BRAVO", "CHARLIE", "DELTA"] as const;

export type Equipe = (typeof EQUIPES)[number];

export function isEquipe(value: unknown): value is Equipe {
  return typeof value === "string" && (EQUIPES as readonly string[]).includes(value);
}
