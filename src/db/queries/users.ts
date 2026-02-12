import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";

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

export async function updateUser(updatedUser: Required<Pick<NewUser, 'email' | 'hashedPassword' | 'id'>>) {
  const { email, hashedPassword, id } = updatedUser

  const [user] = await db.update(users).set({ email, hashedPassword }).where(eq(users.id, id)).returning()

  return user
}