// app/opt-in/page.tsx - Complete clean version
"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasOptedIn, setOptInStatus } from "@/lib/storage";

function OptInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (hasOptedIn()) {
      window.location.href = redirectTo;
    }
  }, [redirectTo]);

  const handleOptIn = () => {
    setIsLoading(true);

    console.log("Opt-in starting, redirect to:", redirectTo);

    // Set localStorage
    setOptInStatus(true);

    // Set cookie for middleware
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `pait_optin=true; path=/; expires=${expires.toUTCString()}; samesite=lax; secure=${
      window.location.protocol === "https:"
    }`;

    console.log("Cookies set:", document.cookie);

    // Use window.location for reliable redirect
    setTimeout(() => {
      console.log("Redirecting to:", redirectTo);
      window.location.href = redirectTo;
    }, 500);
  };

  const handleDecline = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-zinc-900 border-primary/30">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">📱</div>
          <CardTitle className="text-primary font-mono text-2xl">
            SMS Messaging Consent
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-2">
            Required for PAIT messaging features
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
            <h3 className="text-primary font-mono text-sm font-bold">
              What you&apos;re agreeing to:
            </h3>
            <div className="text-xs text-muted-foreground space-y-2">
              <p>✓ Receive SMS messages through PAIT messaging system</p>
              <p>✓ Messages sent only to your approved family contacts</p>
              <p>✓ All communications are family-safe and monitored</p>
              <p>✓ Standard SMS rates may apply from your carrier</p>
              <p>✓ You can opt out anytime by replying STOP</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleOptIn}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-black font-mono font-bold py-3"
            >
              {isLoading ? "Processing..." : "I Agree to SMS Messaging"}
            </Button>

            <Button
              onClick={handleDecline}
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 font-mono"
            >
              No Thanks, Go Back
            </Button>
          </div>

          <div className="text-center pt-4 border-t border-primary/20">
            <p className="text-xs text-muted-foreground/70">
              This consent is stored securely and required for family messaging
              safety.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OptInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-primary font-mono">Loading opt-in...</div>
        </div>
      }
    >
      <OptInForm />
    </Suspense>
  );
}
