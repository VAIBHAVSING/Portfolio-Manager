"use client";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { UserAtom } from "@/lib/store/atom";
import { useRecoilState } from "recoil";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session, status } = useSession();
  const [User, setUser] = useRecoilState(UserAtom);

  useEffect(() => {
    // Redirect if unauthenticated and session is not loading
    if (status === "unauthenticated") {
      redirect('/');
    }

    // Once session is available and if UserAtom is not already set
    if (session?.user && !User.id) {
      const {
        id,
        name = '', // Provide default value
        username,
        email,
        image = '', // Provide default value
      }: { id: string; name?: string | null; username: string; email: string; image?: string | null } = session.user;

      // Set user info in Recoil state
      setUser({
        id,
        email,
        name:name ||"",
        username,
        image:image ||"",
      });
    }
  }, [session, status, User.id, setUser]);

  // Render only when the session status is known
  if (status === "loading") {
    return <p>Loading...</p>; // Show loading state if session is still being fetched
  }

  return (
    <div>
      <div className="sticky top-0">
        <Navbar />
      </div>
      {children}
    </div>
  );
}
