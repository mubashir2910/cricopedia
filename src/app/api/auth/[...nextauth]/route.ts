import NextAuth, { AuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/User';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            displayName?: string;
            points: number;
            isAdmin?: boolean;
        };
    }
    interface User {
        id: string;
        email: string;
        displayName?: string;
        points: number;
        isAdmin?: boolean;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        email: string;
        displayName?: string;
        points: number;
        isAdmin?: boolean;
    }
}

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'user-login',
            name: 'User Login',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials): Promise<NextAuthUser | null> {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please provide email and password');
                }

                await dbConnect();

                const user = await UserModel.findOne({ email: credentials.email.toLowerCase() });

                if (!user) {
                    throw new Error('Invalid email or password');
                }

                const isPasswordValid = await user.comparePassword(credentials.password);

                if (!isPasswordValid) {
                    throw new Error('Invalid email or password');
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    displayName: user.displayName,
                    points: user.points,
                };
            },
        }),
        CredentialsProvider({
            id: 'admin-login',
            name: 'Admin Login',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials): Promise<NextAuthUser | null> {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please provide email and password');
                }

                const adminEmail = process.env.ADMIN_EMAIL;
                const adminPassword = process.env.ADMIN_PASSWORD;

                if (credentials.email === adminEmail && credentials.password === adminPassword) {
                    return {
                        id: 'admin',
                        email: adminEmail,
                        displayName: 'Admin',
                        points: 0,
                        isAdmin: true,
                    };
                }

                throw new Error('Invalid admin credentials');
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 36 * 60 * 60, // 36 hours
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.displayName = user.displayName;
                token.points = user.points;
                token.isAdmin = user.isAdmin || false;
            }
            return token;
        },
        async session({ session, token }) {
            session.user = {
                id: token.id,
                email: token.email,
                displayName: token.displayName,
                points: token.points,
                isAdmin: token.isAdmin,
            };
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
