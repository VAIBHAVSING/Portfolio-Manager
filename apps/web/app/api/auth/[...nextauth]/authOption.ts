import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";
import { ErrorHandler } from '@/lib/error';
import NextAuth, { NextAuthOptions } from "next-auth";
import { compare } from "bcryptjs";
import { Prisma } from "../../../../lib/generateclient";
import { signinSchema } from "@/lib/Validator/siginSchema";

// NextAuth configuration
const authOptions:NextAuthOptions={
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                Email: { type: 'email', placeholder: 'Email', label: 'Email' },
                Password: { type: "password", placeholder: "Password", label: "Password" }
            },
            async authorize(credentials,res) {
                try {
                    const Email=credentials?.Email as string;
                    const Password=credentials?.Password;
                    const response = signinSchema.safeParse({Email,Password});
                    if (!response.success) {
                        throw new ErrorHandler(
                            'Input Validation failed',
                            'VALIDATION_ERROR',
                            {
                                fieldErrors: response.error.flatten().fieldErrors,
                            }
                        );
                    }
                    const user = await Prisma.user.findUnique({
                        where: { email: credentials?.Email },
                        select: {
                            name: true,
                            password: true,
                            email: true,
                            id: true,
                            username: true,
                        }
                    });

                    if (user && credentials) {
                        try {
                            const isValid = await compare(credentials.Password, user.password);
                            if (isValid) {
                                return {
                                    id: user.id,
                                    name: user.name,
                                    email: user.email,
                                    username: user.username // Lowercase for consistency
                                };
                            } else {
                                throw new ErrorHandler(
                                    'Email or password is incorrect',
                                    'AUTHENTICATION_FAILED'
                                );
                            }
                        } catch (error) {
                            console.error("Error comparing passwords:", error);
                            throw new ErrorHandler(
                                'Email or password is incorrect',
                                'AUTHENTICATION_FAILED'
                            );
                        }
                    } else {
                        throw new ErrorHandler(
                            'Email or password is incorrect',
                            'AUTHENTICATION_FAILED'
                        );
                    }
                } catch (error) {
                    console.error("Error authorizing user:", error);
                    return null;
                }
            }
        }),
        // GoogleProvider({
        //     clientId: process.env.GOOGLE_CLIENT_ID as string,
        //     clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        // }),
        // GithubProvider({
        //     clientId: process.env.GITHUB_CLIENT_ID as string,
        //     clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        // }),
        // EmailProvider({
        //     server: process.env.EMAIL_SERVER,
        //     from: process.env.EMAIL_FROM,
        // })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                // Set token properties based on the user object
                token.id = user.id;  // Make sure `user.id` is not undefined
                token.email = user.email;
                token.username = user.username;
                token.name = user.name;
            }
            return token;
        },
        async session({ session, token }) {
            // Pass token data to session.user
            if (token) {
                session.user = {
                    id: token.id,  // Ensure that `token.id` is present here
                    email: token.email,
                    username: token.username,
                    name: token.name,
                    image: token.image || null, // Optional image field
                };
            }
            return session;
        },
    },    
    pages: {
        signIn: "/signin",
        newUser: "/signup"
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: true,
};
export default NextAuth(authOptions);