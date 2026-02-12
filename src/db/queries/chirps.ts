import { and, asc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
  const [row] = await db
    .insert(chirps)
    .values(chirp)
    .returning();

  return row;
}

export async function getChirps() {
  const rows = await db
    .select()
    .from(chirps).orderBy(asc(chirps.createdAt));

  return rows;
}

export async function getChirp(id: string) {
  const [row] = await db
    .select()
    .from(chirps).where(eq(chirps.id, id))

  return row;
}

/** If chirp belongs to user, returns the deleted chirp. If chirp exists, but belongs to other user, returns the chirp's details. */
export async function deleteChirp({ chirpId, userId, }: { userId: string, chirpId: string }) {
  const [row] = await db
    .delete(chirps).where(and(eq(chirps.userId, userId), eq(chirps.id, chirpId))).returning()

  if (row) {
    return row;
  }

  return getChirp(chirpId)
}
