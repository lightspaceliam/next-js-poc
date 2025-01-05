import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import sql, { ConnectionPool } from 'mssql';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';

async function getUser(email: string): Promise<User | undefined> {

  const connectionPool: ConnectionPool = await sql.connect(process.env.DB_CONN ?? '');

  try {
    
    const user = await connectionPool
      .request()
      .query<User>`
        SELECT  * 
        FROM    Users 
        WHERE   Email=${email}`;

    console.log(user);
    await connectionPool.close();

    return user.recordset[0];

  } catch (error) {
    await connectionPool.close();
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);


          if (!parsedCredentials.success) {
            return null;
          }
          
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.Password);
          
          if (!passwordsMatch) {
            console.log('Invalid credentials');
            return null;
          }
          
          return user;
      },
    }),
  ],
});