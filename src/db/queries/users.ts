import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";
import { checkPasswordHash, hashPassword } from "../auth.js";

export async function createUser(user: NewUser) {
  const [{ hashedPassword: _hashedPassword, ...newUserData }] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return newUserData;
}

export async function reset() {
  await db.delete(users);
}

export async function loginUser(data: { email: string, password: string; }) {
  const { email, password, } = data;
  const matchingUsers = await db
    .select()
    .from(users).where(eq(users.email, email))

  if (matchingUsers.length === 0) {
    return;
  }

  const [{ hashedPassword, ...userData }] = matchingUsers;


  const isValidCredentials = await checkPasswordHash(password, hashedPassword);

  if (!isValidCredentials) {
    return;
  }

  return userData
}
