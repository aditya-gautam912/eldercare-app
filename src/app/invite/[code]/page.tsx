"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Spinner } from "@/components/ui";

export default function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [elderName, setElderName] = useState<string | null>(null);
  const [elderId, setElderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [alreadyMember, setAlreadyMember] = useState(false);

  useEffect(() => {
    checkInvite();
  }, []);

  async function checkInvite() {
    const { data: invite } = await supabase
      .from("invite_codes")
      .select("*, elder:elder_id(name)")
      .eq("code", code)
      .maybeSingle();

    if (!invite) {
      setError("This invite link is invalid or has expired.");
      setLoading(false);
      return;
    }

    const expires = new Date(invite.expires_at);
    if (expires < new Date()) {
      setError("This invite link has expired.");
      setLoading(false);
      return;
    }

    setElderName(invite.elder.name);
    setElderId(invite.elder_id);

    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    setUser(u);

    if (u) {
      const { data: membership } = await supabase
        .from("family_members")
        .select("id")
        .eq("elder_id", invite.elder_id)
        .eq("user_id", u.id)
        .maybeSingle();

      if (membership) {
        setAlreadyMember(true);
      }
    }

    setLoading(false);
  }

  async function join() {
    if (!user || !elderId) return;
    setJoining(true);

    const { error: err } = await supabase.from("family_members").insert({
      elder_id: elderId,
      user_id: user.id,
      role: "member",
    });

    if (err) {
      setError(err.message);
      setJoining(false);
      return;
    }

    router.push(`/elders/${elderId}`);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="text-center animate-fade-in">
          <Spinner className="mx-auto h-8 w-8" />
          <p className="mt-3 text-sm text-[var(--muted)]">Verifying invite...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-[var(--background)]">
        <div className="w-full max-w-md text-center animate-fade-in">
          <span className="text-5xl">😕</span>
          <h1 className="mt-4 text-2xl font-bold text-[var(--foreground)]">
            Invalid invite
          </h1>
          <p className="mt-2 text-[var(--muted)]">{error}</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-[var(--background)] dark:to-gray-950">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold shadow-sm">
              C
            </div>
          </Link>
        </div>

        <Card className="text-center">
          <span className="text-5xl">❤️</span>
          <h1 className="mt-4 text-2xl font-bold text-[var(--foreground)]">
            You&apos;re invited to join
          </h1>
          <p className="mt-2 text-xl font-semibold text-indigo-600 dark:text-indigo-400">
            {elderName}&apos;s care circle
          </p>
          <p className="mt-2 text-[var(--muted)]">
            Help coordinate care, track medications, and stay connected with the
            family.
          </p>

          {alreadyMember ? (
            <div className="mt-8">
              <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-4">
                You&apos;re already a member of this care circle!
              </p>
              <Button onClick={() => router.push(`/elders/${elderId}`)}>
                Go to {elderName}&apos;s page
              </Button>
            </div>
          ) : user ? (
            <div className="mt-8">
              <Button onClick={join} disabled={joining} size="lg">
                {joining ? "Joining..." : "Join care circle"}
              </Button>
            </div>
          ) : (
            <div className="mt-8 space-y-3">
              <Link
                href={`/signup?redirect=/invite/${code}`}
                className="block w-full rounded-lg bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                Sign up to join
              </Link>
              <Link
                href={`/login?redirect=/invite/${code}`}
                className="block w-full rounded-lg border border-[var(--input-border)] bg-[var(--card-bg)] px-8 py-3 text-base font-medium text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Log in
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
