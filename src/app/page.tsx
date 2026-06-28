import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <header className="flex items-center justify-between px-6 py-4 bg-[var(--nav-bg)] backdrop-blur-md border-b border-[var(--nav-border)] sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold shadow-sm">
            C
          </div>
          <span className="text-lg font-bold text-[var(--foreground)]">CareCircle</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-all shadow-sm"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden px-6 py-24 sm:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-[var(--background)] dark:to-gray-950" />
          <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-indigo-200/30 dark:bg-indigo-800/10 blur-3xl" />
          <div className="absolute bottom-20 left-20 h-72 w-72 rounded-full bg-purple-200/30 dark:bg-purple-800/10 blur-3xl" />
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              Trusted by families worldwide
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-[var(--foreground)] sm:text-7xl">
              Caring for your loved ones,
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                together
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--muted)] leading-relaxed">
              CareCircle helps families coordinate care for aging parents and loved
              ones. Track medications, share daily check-ins, and keep everyone in
              the loop.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/signup"
                className="rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-medium text-white hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                Start free
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-[var(--input-border)] bg-[var(--card-bg)] px-8 py-3.5 text-base font-medium text-[var(--foreground)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--nav-border)] bg-[var(--card-bg)] px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
                Everything your family needs
              </h2>
              <p className="mt-4 text-[var(--muted)] max-w-xl mx-auto">
                One place to manage care, coordinate schedules, and stay connected.
              </p>
            </div>
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: "💊",
                  title: "Medication tracking",
                  desc: "Set schedules, get reminders, and log when meds are taken.",
                  color: "from-rose-50 to-pink-50 border-rose-100 dark:from-rose-950/30 dark:to-pink-950/30 dark:border-rose-900",
                },
                {
                  icon: "✅",
                  title: "Daily check-ins",
                  desc: "One-tap check-ins so everyone knows your loved one is okay.",
                  color: "from-emerald-50 to-teal-50 border-emerald-100 dark:from-emerald-950/30 dark:to-teal-950/30 dark:border-emerald-900",
                },
                {
                  icon: "👨‍👩‍👧‍👦",
                  title: "Family feed",
                  desc: "A shared timeline of updates, notes, and check-ins.",
                  color: "from-blue-50 to-indigo-50 border-blue-100 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-900",
                },
                {
                  icon: "🚨",
                  title: "Emergency alerts",
                  desc: "One-tap alert notifies all family members instantly.",
                  color: "from-amber-50 to-orange-50 border-amber-100 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-900",
                },
                {
                  icon: "📞",
                  title: "Emergency contacts",
                  desc: "Keep important numbers in one place for everyone.",
                  color: "from-purple-50 to-violet-50 border-purple-100 dark:from-purple-950/30 dark:to-violet-950/30 dark:border-purple-900",
                },
                {
                  icon: "🔗",
                  title: "Invite family",
                  desc: "Share a link to add siblings, kids, or caregivers.",
                  color: "from-cyan-50 to-sky-50 border-cyan-100 dark:from-cyan-950/30 dark:to-sky-950/30 dark:border-cyan-900",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className={`group rounded-xl border bg-gradient-to-br p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${f.color}`}
                >
                  <span className="text-3xl">{f.icon}</span>
                  <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--nav-border)] bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-950 dark:to-gray-950 px-6 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-[var(--muted)]">
              Join thousands of families using CareCircle to stay connected and coordinated.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-base font-medium text-white hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              Create your free account
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--nav-border)] bg-[var(--card-bg)] py-8 text-center text-sm text-[var(--muted)]">
        &copy; {new Date().getFullYear()} CareCircle. All rights reserved.
      </footer>
    </div>
  );
}
