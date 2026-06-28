"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, Button, EmptyState, Skeleton, Input } from "@/components/ui";
import { Header } from "@/components/header";

type Elder = {
  id: string;
  name: string;
  photo_url: string | null;
  date_of_birth: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [elders, setElders] = useState<Elder[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDob, setNewDob] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data: owned } = (await supabase
      .from("elders")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })) as { data: Elder[] | null };

    const { data: familyLinks } = (await supabase
      .from("family_members")
      .select("elder_id")
      .eq("user_id", user.id)) as { data: { elder_id: string }[] | null };

    let elderList = owned ?? [];
    if (familyLinks) {
      const knownIds = new Set(elderList.map((e) => e.id));
      const newIds = familyLinks
        .map((f) => f.elder_id)
        .filter((id) => !knownIds.has(id));
      if (newIds.length > 0) {
        const { data: extra } = (await supabase
          .from("elders")
          .select("*")
          .in("id", newIds)) as { data: Elder[] | null };
        elderList = [...elderList, ...(extra ?? [])];
      }
    }
    setElders(elderList);
    setUserName(user.email ?? null);
    setLoading(false);
  }

  async function createElder(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("elders")
      .insert({
        name: newName,
        date_of_birth: newDob || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      setCreating(false);
      return;
    }

    await supabase.from("family_members").insert({
      elder_id: data.id,
      user_id: user.id,
      role: "admin",
    });

    setShowForm(false);
    setNewName("");
    setNewDob("");
    setCreating(false);
    loadData();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-8 space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header userName={userName} />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">My family</h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              {elders.length} {elders.length === 1 ? "loved one" : "loved ones"} in your care
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} size="md">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add loved one
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50 dark:from-indigo-950/50 to-white dark:to-[var(--card-bg)] animate-slide-up">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1">
              New loved one
            </h2>
            <p className="text-sm text-[var(--muted)] mb-5">
              Add an elder family member you want to help care for.
            </p>
            <form onSubmit={createElder} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Name"
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Mom, Dad"
                />
                <Input
                  label="Date of birth (optional)"
                  type="date"
                  value={newDob}
                  onChange={(e) => setNewDob(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={creating} size="md">
                  {creating ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                  size="md"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {elders.length === 0 ? (
          <EmptyState
            icon="👴"
            title="Add your first loved one"
            description="Start by adding an elder family member you want to help care for."
            action={
              <Button onClick={() => setShowForm(true)}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add loved one
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 animate-fade-in">
            {elders.map((elder, i) => (
              <Link
                key={elder.id}
                href={`/elders/${elder.id}`}
                className="animate-slide-up group"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <Card className="group-hover:border-indigo-400 group-hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 dark:from-indigo-900/50 to-purple-100 dark:to-purple-900/50 text-2xl shadow-sm group-hover:scale-105 transition-transform">
                      👤
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--foreground)] truncate">
                        {elder.name}
                      </h3>
                      {elder.date_of_birth && (
                        <p className="text-sm text-[var(--muted)]">
                          Born {new Date(elder.date_of_birth).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
