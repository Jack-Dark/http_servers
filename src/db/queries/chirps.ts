import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
  const [row] = await db
    .insert(chirps)
    .values(chirp)
    .returning();
  return row;
}
