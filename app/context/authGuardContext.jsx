"use client";

import { SessionProvider, useSession } from "next-auth/react";

function AuthGuard({ children }) {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="spinner" /> {/* lehet egy CSS spinner */}
      </div>
    );
  }

  return <>{children}</>;
}

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <AuthGuard>{children}</AuthGuard>
    </SessionProvider>
  );
}
