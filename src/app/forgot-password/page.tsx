"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Spinner } from "@/components/ui";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const origin = window.location.origin;

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/update-password`,
    });

    setLoading(false);
    if (err) { setError(err.message); return; }
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-[var(--background)] dark:to-gray-950">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold shadow-sm">C</div>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-[var(--foreground)]">Reset your password</h1>
          <p className="mt-1 text-[var(--muted)]">We&apos;ll send you a recovery link</p>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 shadow-sm">
          {sent ? (
            <div className="text-center animate-fade-in">
              <span className="text-4xl">📬</span>
              <p className="mt-4 text-sm text-[var(--foreground)] font-medium">Check your email</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                If an account exists for <strong>{email}</strong>, you&apos;ll receive a password reset link shortly.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="animate-fade-in rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />

              <Button type="submit" disabled={loading || !email} className="w-full" size="lg">
                {loading ? <Spinner /> : null}
                {loading ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
