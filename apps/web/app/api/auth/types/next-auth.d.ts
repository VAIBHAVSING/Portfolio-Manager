import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;                    // User ID
      email: string;                 // User email
      username: string;              // User username
      name?: string | null;          // User name (optional)
      image?: string | null;         // User image (optional)
    };
  }

  interface User {
    id: string;                    // User ID
    email: string;                 // User email
    username: string;              // User username
    name?: string | null;          // User name (optional)
    image?: string | null;         // User image (optional)
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;                    // User ID
    email: string;                 // User email
    username: string;              // User username
    name?: string | null;          // User name (optional)
    image?: string | null;         // User image (optional)
  }
}
