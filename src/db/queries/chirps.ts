import { asc, eq } from "drizzle-orm";
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
  const rows = await db
    .select()
    .from(chirps).where(eq(chirps.id, id))

  if (rows.length === 0) {
    return;
  }

  return rows[0];
}
