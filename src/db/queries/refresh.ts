import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewToken, tokens } from "../schema.js";
import { config } from "../../config.js";

export async function saveRefreshToken(token: Pick<NewToken, 'token' | 'userId'>) {
  const rows = await db
    .insert(tokens)
    .values({
      ...token,
      expiresAt: new Date(Date.now() + config.jwt.refreshDuration),
      revokedAt: null,
    })
    .returning();

  return rows.length > 0
}

export async function getRefreshToken(token: string) {
  const [row] = await db.select().from(tokens).where(eq(tokens.token, token));

  return row;
}


export async function revokeToken(token: string) {
  const currentTime = new Date();
  return db.update(tokens).set({
    revokedAt: currentTime,
    updatedAt: currentTime
  }).where(eq(tokens.token, token));
}
