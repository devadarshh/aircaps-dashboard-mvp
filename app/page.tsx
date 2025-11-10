"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;

  if (status === "authenticated") {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <p className="text-lg">Hi, {session.user?.name}!</p>
        {session.user?.image && (
          <Image
            src={session.user.image}
            alt="Profile picture"
            width={50}
            height={50}
            className="rounded-full"
          />
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="px-4 py-2 bg-indigo-600 text-white rounded"
      >
        Sign in with Google
      </button>
    </div>
  );
}
