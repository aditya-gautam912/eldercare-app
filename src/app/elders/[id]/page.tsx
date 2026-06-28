"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, Button, Input, Badge, Skeleton, ConfirmDialog, Tooltip } from "@/components/ui";
import { Header } from "@/components/header";

type Tab = "checkins" | "medications" | "contacts" | "invite" | "feed";

export default function ElderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [elder, setElder] = useState<any>(null);
  const [medications, setMedications] = useState<any[]>([]);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [inviteCodes, setInviteCodes] = useState<any[]>([]);
  const [familyMembers, setFamilyMembers] = useState<{ name: string | null; role: string }[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("checkins");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: "", message: "", onConfirm: () => {} });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editingElder, setEditingElder] = useState(false);
  const [editElderName, setEditElderName] = useState("");
  const [editElderDob, setEditElderDob] = useState("");
  const [checkInOffset, setCheckInOffset] = useState(0);
  const [checkInHasMore, setCheckInHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 10;
  const currentUserId = useRef<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
    loadData();
  }, []);

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`elder-${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "check_ins", filter: `elder_id=eq.${id}` },
        async (payload) => {
          const record = payload.new as any;
          if (record.user_id === currentUserId.current) return;
          const { data: profile } = await supabase.from("profiles").select("name").eq("id", record.user_id).single();
          const name = profile?.name ?? "Someone";
          setCheckIns((prev) =>
            prev.some((c) => c.id === record.id) ? prev : [{ ...record, profile: { name } }, ...prev]
          );
          const status = record.status === "needs_help" ? "⚠️ Needs help" : "✅ All good";
          showToast(`${name} checked in: ${status}`, record.status === "needs_help" ? "error" : "success");
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "medications", filter: `elder_id=eq.${id}` },
        (payload) => {
          const record = payload.new as any;
          setMedications((prev) => {
            if (prev.some((m) => m.id === record.id)) return prev;
            return [...prev, record];
          });
          showToast(`💊 New medication added: ${record.name}`);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function validateFields(fields: Record<string, string>): boolean {
    const errors: Record<string, string> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (!value.trim()) errors[key] = `${key} is required`;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function openConfirm(title: string, message: string, onConfirm: () => void) {
    setConfirmDialog({ open: true, title, message, onConfirm });
  }

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    currentUserId.current = user.id;

    const { data: elderData } = await supabase.from("elders").select("*").eq("id", id).single();
    if (!elderData) { router.push("/dashboard"); return; }
    setElder(elderData);

    const { data: myMembership } = await supabase.from("family_members").select("role").eq("elder_id", id).eq("user_id", user.id).maybeSingle();
    setUserRole(myMembership?.role ?? null);

    const { data: creator } = await supabase.from("profiles").select("name").eq("id", elderData.created_by).single();
    const memberList: { name: string | null; role: string }[] = [];
    if (creator) memberList.push({ name: creator.name ?? "Unknown", role: "creator" });
    if (myMembership) memberList.push({ name: user.email ?? "You", role: myMembership.role });
    setFamilyMembers(memberList);

    const { data: meds } = await supabase.from("medications").select("*").eq("elder_id", id).order("created_at");
    setMedications(meds ?? []);

    const { data: checks } = await supabase.from("check_ins").select("*, profile:user_id(name)").eq("elder_id", id).order("created_at", { ascending: false }).limit(PAGE_SIZE + 1);
    const hasMore = (checks ?? []).length > PAGE_SIZE;
    setCheckIns(hasMore ? (checks ?? []).slice(0, PAGE_SIZE) : (checks ?? []));
    setCheckInHasMore(hasMore);
    setCheckInOffset(PAGE_SIZE);

    const { data: c } = await supabase.from("emergency_contacts").select("*").eq("elder_id", id).order("created_at");
    setContacts(c ?? []);

    const { data: invites } = await supabase.from("invite_codes").select("*").eq("elder_id", id).order("created_at", { ascending: false });
    setInviteCodes(invites ?? []);

    setLoading(false);
  }

  async function loadMoreCheckIns() {
    setLoadingMore(true);
    const { data: checks } = await supabase
      .from("check_ins")
      .select("*, profile:user_id(name)")
      .eq("elder_id", id)
      .order("created_at", { ascending: false })
      .range(checkInOffset, checkInOffset + PAGE_SIZE);
    const batch = checks ?? [];
    const hasMore = batch.length > PAGE_SIZE;
    setCheckIns((prev) => [...prev, ...(hasMore ? batch.slice(0, PAGE_SIZE) : batch)]);
    setCheckInHasMore(hasMore);
    setCheckInOffset((prev) => prev + PAGE_SIZE);
    setLoadingMore(false);
  }

  async function updateElder(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const name = fd.get("name") as string;
    const dob = fd.get("date_of_birth") as string;
    if (!validateFields({ name })) return;
    const { error } = await supabase.from("elders").update({ name, date_of_birth: dob || null }).eq("id", id);
    if (error) { showToast(error.message, "error"); return; }
    setEditingElder(false);
    setFieldErrors({});
    loadData();
    showToast("Profile updated");
  }

  async function addMedication(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const name = fd.get("name") as string;
    const dosage = fd.get("dosage") as string;
    const frequency = fd.get("frequency") as string;
    const time = fd.get("time") as string;
    if (!validateFields({ name, dosage, time })) return;
    const { error } = await supabase.from("medications").insert({
      elder_id: id, name, dosage, frequency,
      time_of_day: [time],
      notes: (fd.get("notes") as string) || null,
    });
    if (error) { showToast(error.message, "error"); return; }
    form.reset();
    setFieldErrors({});
    loadData();
    showToast("Medication added");
  }

  async function updateMedication(medId: string, e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const name = fd.get("name") as string;
    const dosage = fd.get("dosage") as string;
    const frequency = fd.get("frequency") as string;
    const time = fd.get("time") as string;
    if (!validateFields({ name, dosage, time })) return;
    const { error } = await supabase.from("medications").update({
      name, dosage, frequency, time_of_day: [time],
      notes: (fd.get("notes") as string) || null,
    }).eq("id", medId);
    if (error) { showToast(error.message, "error"); return; }
    setEditingMedId(null);
    setFieldErrors({});
    loadData();
    showToast("Medication updated");
  }

  async function deleteMedication(medId: string) {
    await supabase.from("medications").delete().eq("id", medId);
    loadData();
    showToast("Medication removed");
  }

  async function addCheckIn(status: "ok" | "needs_help") {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("check_ins").insert({ elder_id: id, user_id: user.id, status });
    loadData();
    showToast(status === "ok" ? "Checked in!" : "Alert sent to family");
  }

  async function addContact(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const name = fd.get("name") as string;
    const phone = fd.get("phone") as string;
    const relationship = fd.get("relationship") as string;
    if (!validateFields({ name, phone, relationship })) return;
    const { error } = await supabase.from("emergency_contacts").insert({ elder_id: id, name, phone, relationship });
    if (error) { showToast(error.message, "error"); return; }
    form.reset();
    setFieldErrors({});
    loadData();
    showToast("Contact added");
  }

  async function updateContact(contactId: string, e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const name = fd.get("name") as string;
    const phone = fd.get("phone") as string;
    const relationship = fd.get("relationship") as string;
    if (!validateFields({ name, phone, relationship })) return;
    const { error } = await supabase.from("emergency_contacts").update({ name, phone, relationship }).eq("id", contactId);
    if (error) { showToast(error.message, "error"); return; }
    setEditingContactId(null);
    setFieldErrors({});
    loadData();
    showToast("Contact updated");
  }

  async function deleteContact(contactId: string) {
    await supabase.from("emergency_contacts").delete().eq("id", contactId);
    loadData();
    showToast("Contact removed");
  }

  async function generateInvite() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const code = Array.from({ length: 8 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
    const { error } = await supabase.from("invite_codes").insert({ elder_id: id, code, created_by: user.id });
    if (error) { showToast(error.message, "error"); return; }
    loadData();
    showToast("Invite link created!");
  }

  async function copyInvite(code: string, inviteId: string) {
    const link = `${origin}/invite/${code}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(inviteId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { prompt("Copy this link:", link); }
  }

  async function revokeInvite(inviteId: string) {
    await supabase.from("invite_codes").delete().eq("id", inviteId);
    loadData();
    showToast("Invite revoked");
  }

  async function triggerAlert() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("check_ins").insert({ elder_id: id, user_id: user.id, status: "needs_help", notes: "🚨 Emergency alert triggered!" });
    openConfirm("Emergency alert sent", "All family members have been notified.", () => {});
    showToast("Emergency alert sent to all family members!");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-8 space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full" />
        </main>
      </div>
    );
  }

  if (!elder) return null;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "checkins", label: "Check-ins", icon: "✅" },
    { key: "medications", label: "Medications", icon: "💊" },
    { key: "contacts", label: "Contacts", icon: "📞" },
    { key: "invite", label: "Invite", icon: "🔗" },
    { key: "feed", label: "Feed", icon: "📋" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel="OK"
        variant="primary"
        onConfirm={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
      />

      {toast && (
        <div className={`animate-slide-up fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-5 py-3 shadow-lg ${
          toast.type === "success" ? "bg-emerald-50 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200" : "bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
        }`}>
          <span>{toast.type === "success" ? "✅" : "❌"}</span>
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      <Header backHref="/dashboard" />

      <main className="mx-auto max-w-4xl px-4 py-8 animate-fade-in">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 dark:from-indigo-900/50 to-purple-100 dark:to-purple-900/50 text-3xl shadow-sm">
              👤
            </div>
            <div className="min-w-0">
              {editingElder ? (
                <form onSubmit={updateElder} className="space-y-3">
                  <div className="flex gap-3 flex-wrap">
                    <Input name="name" label="Name" required defaultValue={elder.name} error={fieldErrors.name} className="min-w-40" />
                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Date of birth</label>
                      <input name="date_of_birth" type="date" defaultValue={elder.date_of_birth ?? ""} className="block w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--foreground)] px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">Save</Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => { setEditingElder(false); setFieldErrors({}); }}>Cancel</Button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-[var(--foreground)] truncate">{elder.name}</h1>
                  {elder.date_of_birth && <p className="text-sm text-[var(--muted)]">Born {new Date(elder.date_of_birth).toLocaleDateString()}</p>}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {familyMembers.map((m, i) => (
                      <Badge key={i} color={m.role === "creator" ? "blue" : m.role === "admin" ? "green" : "gray"}>
                        {m.name} ({m.role})
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0 ml-4">
            {!editingElder && userRole === "admin" && (
              <Button variant="secondary" size="sm" onClick={() => { setEditElderName(elder.name); setEditElderDob(elder.date_of_birth ?? ""); setEditingElder(true); }}>
                Edit
              </Button>
            )}
            {userRole === "admin" && (
              <Tooltip text="Notifies all family members instantly">
                <Button variant="danger" onClick={triggerAlert} size="sm">
                  🚨 Emergency
                </Button>
              </Tooltip>
            )}
          </div>
        </div>

        <div className="mb-6 flex gap-1 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-1.5 shadow-sm">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                tab === t.key
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <span className="hidden sm:inline">{t.icon} </span>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "checkins" && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1">Today&apos;s check-in</h2>
              <p className="text-sm text-[var(--muted)] mb-5">Let your family know how things are going.</p>
              <div className="flex gap-3">
                <Button variant="primary" size="lg" className="flex-1" onClick={() => addCheckIn("ok")}>
                  ✅ All good
                </Button>
                <Button variant="danger" size="lg" className="flex-1" onClick={() => addCheckIn("needs_help")}>
                  ⚠️ Needs help
                </Button>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Recent check-ins</h2>
              {checkIns.length === 0 ? (
                <p className="text-sm text-[var(--muted)] py-4 text-center">No check-ins yet. Do the first one above!</p>
              ) : (
                <>
                  <div className="space-y-2">
                    {checkIns.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                        <span className="text-lg">{c.status === "ok" ? "✅" : c.status === "needs_help" ? "⚠️" : "❌"}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-[var(--foreground)]">{c.profile?.name ?? "Someone"}</span>
                          {c.notes && <p className="text-xs text-[var(--muted)] truncate">{c.notes}</p>}
                        </div>
                        <span className="text-xs text-[var(--muted)] whitespace-nowrap">{new Date(c.created_at).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  {checkInHasMore && (
                    <div className="mt-4 text-center">
                      <Button variant="secondary" size="sm" onClick={loadMoreCheckIns} disabled={loadingMore}>
                        {loadingMore ? "Loading..." : `Load more (${checkInOffset - PAGE_SIZE}+ shown)`}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        )}

        {tab === "medications" && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50 dark:from-indigo-950/50 to-white dark:to-[var(--card-bg)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1">Add medication</h2>
              <p className="text-sm text-[var(--muted)] mb-5">Track a new medication schedule.</p>
              <form onSubmit={addMedication} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Medication name" name="name" required placeholder="e.g. Aspirin" error={fieldErrors.name} />
                  <Input label="Dosage" name="dosage" required placeholder="e.g. 100mg" error={fieldErrors.dosage} />
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Frequency <span className="text-red-500">*</span></label>
                    <select name="frequency" required className="block w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--foreground)] px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                      <option value="daily">Daily</option>
                      <option value="twice_daily">Twice daily</option>
                      <option value="three_times">Three times daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="as_needed">As needed</option>
                    </select>
                  </div>
                  <Input label="Time" name="time" type="time" required error={fieldErrors.time} />
                  <div className="sm:col-span-2">
                    <Input label="Notes (optional)" name="notes" placeholder="e.g. Take with food" />
                  </div>
                </div>
                <Button type="submit">Add medication</Button>
              </form>
            </Card>

            {medications.length > 0 && (
              <Card>
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Current medications</h2>
                <div className="space-y-2">
                  {medications.map((med) => (
                    <div key={med.id}>
                      {editingMedId === med.id ? (
                        <form onSubmit={(e) => updateMedication(med.id, e)} className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 space-y-3">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Input name="name" label="Name" required defaultValue={med.name} error={fieldErrors.name} />
                            <Input name="dosage" label="Dosage" required defaultValue={med.dosage} error={fieldErrors.dosage} />
                            <div>
                              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Frequency</label>
                              <select name="frequency" defaultValue={med.frequency} required className="block w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--foreground)] px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                <option value="daily">Daily</option>
                                <option value="twice_daily">Twice daily</option>
                                <option value="three_times">Three times daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="as_needed">As needed</option>
                              </select>
                            </div>
                            <Input name="time" label="Time" type="time" required defaultValue={med.time_of_day?.[0] ?? ""} error={fieldErrors.time} />
                          </div>
                          <Input name="notes" label="Notes (optional)" defaultValue={med.notes ?? ""} />
                          <div className="flex gap-2">
                            <Button type="submit" size="sm">Save</Button>
                            <Button type="button" variant="secondary" size="sm" onClick={() => { setEditingMedId(null); setFieldErrors({}); }}>Cancel</Button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-start justify-between rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                          <div>
                            <span className="font-medium text-[var(--foreground)]">💊 {med.name}</span>
                            <span className="ml-2 text-sm text-[var(--muted)]">{med.dosage} &middot; {med.frequency}</span>
                            <span className="ml-2 text-xs text-[var(--muted)]">@ {med.time_of_day.join(", ")}</span>
                            {med.notes && <p className="mt-1 text-sm text-[var(--muted)]">{med.notes}</p>}
                          </div>
                          <div className="flex gap-2 shrink-0 ml-4">
                            {userRole === "admin" && <button onClick={() => setEditingMedId(med.id)} className="text-sm text-indigo-500 hover:text-indigo-700 transition-colors">Edit</button>}
                            <button onClick={() => openConfirm("Remove medication", `Remove ${med.name} from the schedule?`, () => deleteMedication(med.id))} className="text-sm text-red-500 hover:text-red-700 transition-colors">Remove</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {tab === "contacts" && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50 dark:from-indigo-950/50 to-white dark:to-[var(--card-bg)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1">Add emergency contact</h2>
              <p className="text-sm text-[var(--muted)] mb-5">Keep important numbers handy.</p>
              <form onSubmit={addContact} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input label="Name" name="name" required placeholder="Dr. Smith" error={fieldErrors.name} />
                  <Input label="Phone" name="phone" type="tel" required placeholder="+1 555-0123" error={fieldErrors.phone} />
                  <Input label="Relationship" name="relationship" required placeholder="Doctor" error={fieldErrors.relationship} />
                </div>
                <Button type="submit">Add contact</Button>
              </form>
            </Card>

            {contacts.length > 0 && (
              <Card>
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Emergency contacts</h2>
                <div className="space-y-2">
                  {contacts.map((c) => (
                    <div key={c.id}>
                      {editingContactId === c.id ? (
                        <form onSubmit={(e) => updateContact(c.id, e)} className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 space-y-3">
                          <div className="grid gap-3 sm:grid-cols-3">
                            <Input name="name" label="Name" required defaultValue={c.name} error={fieldErrors.name} />
                            <Input name="phone" label="Phone" type="tel" required defaultValue={c.phone} error={fieldErrors.phone} />
                            <Input name="relationship" label="Relationship" required defaultValue={c.relationship} error={fieldErrors.relationship} />
                          </div>
                          <div className="flex gap-2">
                            <Button type="submit" size="sm">Save</Button>
                            <Button type="button" variant="secondary" size="sm" onClick={() => { setEditingContactId(null); setFieldErrors({}); }}>Cancel</Button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">📞</span>
                            <div>
                              <span className="font-medium text-[var(--foreground)]">{c.name}</span>
                              <span className="ml-2 text-sm text-[var(--muted)]">({c.relationship})</span>
                              <p className="text-sm text-[var(--muted)]">{c.phone}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0 ml-4">
                            {userRole === "admin" && <button onClick={() => setEditingContactId(c.id)} className="text-sm text-indigo-500 hover:text-indigo-700 transition-colors">Edit</button>}
                            <button onClick={() => openConfirm("Remove contact", `Remove ${c.name} from emergency contacts?`, () => deleteContact(c.id))} className="text-sm text-red-500 hover:text-red-700 transition-colors">Remove</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {tab === "invite" && (
          <div className="space-y-6 animate-fade-in">
            {userRole === "admin" ? (
              <>
                <Card className="border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50 dark:from-indigo-950/50 to-white dark:to-[var(--card-bg)]">
                  <h2 className="text-lg font-semibold text-[var(--foreground)] mb-1">Invite family members</h2>
                  <p className="text-sm text-[var(--muted)] mb-5">Generate a link to share with family so they can join {elder.name}&apos;s care circle.</p>
                  <Button onClick={generateInvite}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Generate invite link
                  </Button>
                </Card>

                {inviteCodes.length > 0 && (
                  <Card>
                    <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Invite links</h2>
                    <div className="space-y-2">
                      {inviteCodes.map((inv) => {
                        const expired = new Date(inv.expires_at) < new Date();
                        return (
                          <div key={inv.id} className={`rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${expired ? "opacity-50" : ""}`}>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <code className="text-sm font-mono text-indigo-600 dark:text-indigo-400 break-all">{origin}/invite/{inv.code}</code>
                                <p className="text-xs text-[var(--muted)] mt-1">
                                  Created {new Date(inv.created_at).toLocaleDateString()}
                                  {expired ? " · Expired" : ` · Expires ${new Date(inv.expires_at).toLocaleDateString()}`}
                                </p>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                <Button variant="secondary" size="sm" onClick={() => copyInvite(inv.code, inv.id)}>
                                  {copiedId === inv.id ? "Copied!" : "Copy"}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => openConfirm("Revoke invite", "This invite link will no longer work.", () => revokeInvite(inv.id))} className="text-red-500 hover:text-red-700">
                                  Revoke
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}
              </>
            ) : (
              <Card className="text-center py-8">
                <p className="text-[var(--muted)]">Only admins can manage invites. Ask the person who created this care circle to generate an invite link.</p>
              </Card>
            )}
          </div>
        )}

        {tab === "feed" && (
          <Card className="animate-fade-in">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Family activity feed</h2>
            {checkIns.length === 0 && medications.length === 0 ? (
              <p className="text-sm text-[var(--muted)] py-8 text-center">No activity yet. Start with a check-in or add medications!</p>
            ) : (
              <>
                <div className="space-y-4">
                  {checkIns.map((c) => (
                    <div key={c.id} className="flex gap-3 border-l-2 border-indigo-200 dark:border-indigo-800 pl-4">
                      <div>
                        <span className="text-sm font-medium text-[var(--foreground)]">{c.profile?.name ?? "Someone"}</span>
                        <span className="text-sm text-[var(--muted)]"> checked in: {c.status === "ok" ? "All good ✅" : "Needs help ⚠️"}</span>
                        {c.notes && <p className="text-sm text-[var(--muted)]">{c.notes}</p>}
                        <p className="text-xs text-[var(--muted)] mt-1">{new Date(c.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {medications.map((m) => (
                    <div key={m.id} className="flex gap-3 border-l-2 border-emerald-200 dark:border-emerald-800 pl-4">
                      <div>
                        <span className="text-sm text-[var(--muted)]">💊 Medication added: <span className="font-medium text-[var(--foreground)]">{m.name}</span> {m.dosage} ({m.frequency})</span>
                        <p className="text-xs text-[var(--muted)] mt-1">{new Date(m.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {checkInHasMore && (
                  <div className="mt-4 text-center">
                    <Button variant="secondary" size="sm" onClick={loadMoreCheckIns} disabled={loadingMore}>
                      {loadingMore ? "Loading..." : `Load more (${checkInOffset - PAGE_SIZE}+ shown)`}
                    </Button>
                  </div>
                )}
              </>
            )}
          </Card>
        )}
      </main>
    </div>
  );
}
