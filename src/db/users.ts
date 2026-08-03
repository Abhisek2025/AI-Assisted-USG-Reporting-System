import { db } from './index.ts';
import { users } from './schema.ts';

export async function getOrCreateUser(uid: string, email: string, roleName = 'RADIOLOGIST', firstName = '', lastName = '') {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        roleName,
        firstName,
        lastName,
        status: 'ACTIVE',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(firstName ? { firstName } : {}),
          ...(lastName ? { lastName } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Error in getOrCreateUser:", error);
    throw new Error("Failed to get or create user record in database", { cause: error });
  }
}
