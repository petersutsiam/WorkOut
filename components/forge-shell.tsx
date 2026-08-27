import {
  Activity,
  BarChart3,
  Dumbbell,
  Flame,
  Home,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const menu = [
  { label: "Dashboard", href: "/", icon: BarChart3 },
  { label: "Workout", href: "/workout", icon: Dumbbell },
  { label: "Skills", href: "/skills", icon: Zap },
  { label: "Exercises", href: "/exercises", icon: Activity },
  { label: "Progress", href: "/progress", icon: Trophy },
];

export async function ForgeShell({
  title,
  eyebrow,
  active,
  children,
}: {
  title: string;
  eyebrow: string;
  active: string;
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : "Athlete";

  return (
    <main className="min-h-screen bg-[#090a0c] pb-20 text-white md:pb-0">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-white/10 bg-[#0b0c0f] p-5 md:block">
        <div className="flex h-full flex-col">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#d9ff52] text-black">
              <Flame size={19} fill="currentColor" />
            </div>
            <div><div className="text-sm font-bold tracking-[0.2em]">FORGE</div><div className="text-[9px] tracking-[0.15em] text-zinc-500">ATHLETIC SYSTEM</div></div>
          </Link>
          <nav className="mt-10 space-y-2">
            {menu.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${active === item.label ? "bg-[#17191d] text-white" : "text-zinc-500 hover:bg-[#15171a] hover:text-white"}`}><Icon size={18} />{item.label}</Link>; })}
          </nav>
          <div className="mt-auto rounded-xl border border-white/10 bg-[#111317] p-4"><div className="text-[9px] tracking-widest text-zinc-500">CURRENT PHASE</div><div className="mt-2 text-xs font-semibold">Foundation -&gt; Athletic</div><div className="mt-4 h-1 overflow-hidden rounded-full bg-zinc-800"><div className="h-full w-[42%] rounded-full bg-[#d9ff52]" /></div><div className="mt-2 text-[10px] text-zinc-500">Week 5 of 12</div></div>
        </div>
      </aside>
      <div className="min-w-0 md:pl-64">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090a0c]/95 px-4 backdrop-blur md:px-10"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between"><div><p className="text-[9px] tracking-[0.18em] text-zinc-500">{eyebrow}</p><h1 className="text-lg font-bold md:text-xl">{title}</h1></div><Link href="/profile" aria-label={`Open profile for ${email}`} title={email} className="hidden h-9 w-9 place-items-center rounded-full border border-white/10 text-xs font-bold md:grid">{email.slice(0, 1).toUpperCase()}</Link></div></header>
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 md:px-10 md:py-10">{children}</div>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0b0c0f]/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"><div className="mx-auto flex h-16 max-w-md items-center justify-around"><MobileItem href="/" icon={<Home size={20} />} label="Home" active={active === "Dashboard"} /><MobileItem href="/workout" icon={<Dumbbell size={20} />} label="Workout" active={active === "Workout"} /><MobileItem href="/skills" icon={<Zap size={20} />} label="Skills" active={active === "Skills"} /><MobileItem href="/progress" icon={<Trophy size={20} />} label="Progress" active={active === "Progress"} /><MobileItem href="/profile" icon={<User size={20} />} label="Profile" active={active === "Profile"} /></div></nav>
    </main>
  );
}

function MobileItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return <Link href={href} className={`flex min-w-[56px] flex-col items-center justify-center gap-1 ${active ? "text-[#d9ff52]" : "text-zinc-600"}`}>{icon}<span className="text-[9px] font-medium">{label}</span></Link>;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] tracking-[0.15em] text-zinc-500">{children}</p>;
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-white/10 bg-[#111317] p-5 sm:p-6 ${className}`}>{children}</section>;
}

export function ProgressBar({ value }: { value: number }) {
  return <div className="h-1.5 rounded-full bg-zinc-800"><div className="h-full rounded-full bg-[#d9ff52]" style={{ width: `${value}%` }} /></div>;
}