import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewToken, tokens } from "../schema.js";

export type RefreshTokenResponse = {
  token: string;
};

export async function createRefreshToken(token: NewToken) {
  const [row] = await db
    .insert(tokens)
    .values(token)
    .onConflictDoNothing()
    .returning();

  return row satisfies RefreshTokenResponse;
}

export async function getRefreshToken(token: string) {
  const [row] = await db.select().from(tokens).where(eq(tokens.token, token));

  return row;
}

export async function getUserFromRefreshToken(token: string) {
  const [row] = await db.select().from(tokens).where(eq(tokens.token, token));

  return row?.userId;
}

export async function revokeToken(token: string) {
  const currentTime = new Date();
  return db.update(tokens).set({
    revokedAt: currentTime,
    updatedAt: currentTime
  }).where(eq(tokens.token, token));
}
