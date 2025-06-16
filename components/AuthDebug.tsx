// components/AuthDebug.tsx - Temporary debug component
"use client";

import { useEffect } from "react";

export function AuthDebug() {
  useEffect(() => {
    const checkAuth = () => {
      console.log("DEBUG - Auth check running");
      console.log("DEBUG - Current URL:", window.location.href);
      console.log("DEBUG - All cookies:", document.cookie);

      const authCookie = document.cookie
        .split(";")
        .find((cookie) => cookie.trim().startsWith("pait_auth="));

      const userCookie = document.cookie
        .split(";")
        .find((cookie) => cookie.trim().startsWith("pait_user="));

      console.log("DEBUG - Auth cookie found:", !!authCookie);
      console.log("DEBUG - User cookie found:", !!userCookie);

      if (authCookie) {
        console.log(
          "DEBUG - Auth cookie value:",
          authCookie.split("=")[1]?.substring(0, 10) + "..."
        );
      }

      // Check if middleware would redirect this page
      const protectedRoutes = ["/messaging", "/contacts"];
      const currentPath = window.location.pathname;
      const isProtected = protectedRoutes.some((route) =>
        currentPath.startsWith(route)
      );

      console.log("DEBUG - Current path:", currentPath);
      console.log("DEBUG - Is protected route:", isProtected);
      console.log(
        "DEBUG - Should be authenticated:",
        isProtected && !!authCookie
      );
    };

    checkAuth();

    // Check again after a short delay
    setTimeout(checkAuth, 1000);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-red-900/90 text-white p-2 text-xs font-mono rounded z-50">
      Auth Debug Active - Check Console
    </div>
  );
}
