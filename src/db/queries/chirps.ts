import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";
import { SortOption, sortOptions } from "../filters.js";

export async function createChirp(chirp: NewChirp) {
  const [row] = await db
    .insert(chirps)
    .values(chirp)
    .returning();

  return row;
}

export async function getChirps(queries?: { authorId?: string, sort?: SortOption }) {
  const rows = await db
    .select()
    .from(chirps)
    .where(queries?.authorId ? eq(chirps.userId, queries.authorId) : undefined)
    .orderBy(queries?.sort === sortOptions.desc ? desc(chirps.createdAt) : asc(chirps.createdAt));

  return rows;
}

export async function getChirp(id: string) {
  const [row] = await db
    .select()
    .from(chirps).where(eq(chirps.id, id))

  return row;
}

export async function deleteChirp({ chirpId, userId, }: { userId: string, chirpId: string }) {
  const [row] = await db
    .delete(chirps).where(and(eq(chirps.userId, userId), eq(chirps.id, chirpId))).returning()

  return !!row;
}
