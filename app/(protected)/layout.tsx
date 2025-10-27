// app/(protected)/layout.tsx - Shared layout for protected routes
// This layout checks authentication before rendering any child routes

import { requireAuth } from "@/lib/auth-server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This runs on the server and checks auth before rendering
  // If not authenticated, redirects to /login
  await requireAuth();

  return <>{children}</>;
}
