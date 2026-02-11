import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";
import { checkPasswordHash, hashPassword } from "../../auth.js";

export async function createUser(user: NewUser) {
  const [newUser] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return newUser;
}

export async function reset() {
  await db.delete(users);
}


export const getUserByEmail = async (email: string) => {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}
