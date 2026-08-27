import {
  Activity,
  BarChart3,
  Dumbbell,
  Flame,
  Home as HomeIcon,
  Play,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { getActivityMiles, getCurrentUser, getProfile, getSessionCount, getUnlockedSkillCount } from "@/lib/supabase/forge-data";

export const instant = false;

const workout = [
  { number: "01", name: "Warm-up", description: "Wrist, shoulder, hip + ankle mobility", duration: "10 min" },
  { number: "02", name: "Skill Block", description: "Pull-up + L-sit technique", duration: "20 min" },
  { number: "03", name: "Strength", description: "Pull, push, legs and core", duration: "35 min" },
  { number: "04", name: "Run", description: "2.0 mi easy aerobic", duration: "25 min" },
  { number: "05", name: "Mobility", description: "Full-body cooldown", duration: "15 min" },
];

const skills = [
  { name: "Pull-up", level: "Foundation", progress: 82, next: "Chest-to-bar" },
  { name: "L-sit", level: "Foundation", progress: 64, next: "V-sit" },
  { name: "Handstand", level: "Developing", progress: 48, next: "Freestanding" },
];

export default async function Home() {
  const { supabase, userId, email } = await getCurrentUser();
  const [profile, sessionCount, skillCount, activityMiles] = await Promise.all([
    getProfile(supabase, userId),
    getSessionCount(supabase, userId),
    getUnlockedSkillCount(supabase, userId),
    getActivityMiles(supabase, userId),
  ]);
  const dashboardStats = [
    { label: "STREAK", value: String(profile?.current_streak ?? 12), icon: Flame },
    { label: "SESSIONS", value: `${sessionCount}/5`, icon: Dumbbell },
    { label: "MILES", value: activityMiles ? activityMiles.toFixed(1) : "0.0", icon: Activity },
    { label: "SKILLS", value: String(skillCount), icon: Trophy },
  ];

  return (
    <main className="min-h-screen bg-[#090a0c] pb-20 text-white md:pb-0">
      <div className="flex min-h-screen">
        <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-white/10 bg-[#0b0c0f] p-5 md:block">
          <div className="flex h-full flex-col">
            <Logo />
            <nav className="mt-10 space-y-2">
              <SideItem href="/" icon={<BarChart3 size={18} />} active>Dashboard</SideItem>
              <SideItem href="/workout" icon={<Dumbbell size={18} />}>Workout</SideItem>
              <SideItem href="/skills" icon={<Zap size={18} />}>Skills</SideItem>
              <SideItem href="/exercises" icon={<Activity size={18} />}>Exercises</SideItem>
              <SideItem href="/progress" icon={<Trophy size={18} />}>Progress</SideItem>
            </nav>
            <div className="mt-auto rounded-xl border border-white/10 bg-[#111317] p-4">
              <div className="text-[9px] tracking-widest text-zinc-500">CURRENT PHASE</div>
              <div className="mt-2 text-xs font-semibold">Foundation -&gt; Athletic</div>
              <div className="mt-4 h-1 overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full w-[42%] rounded-full bg-[#d9ff52]" />
              </div>
              <div className="mt-2 text-[10px] text-zinc-500">Week 5 of 12</div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 md:pl-64">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090a0c]/95 px-4 backdrop-blur md:px-10">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
              <div>
                <p className="text-[9px] tracking-[0.18em] text-zinc-500">THURSDAY - AUG 27</p>
                <h1 className="text-lg font-bold md:text-xl">Dashboard</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 text-xs text-zinc-400 sm:flex">
                  <Flame size={15} className="text-[#d9ff52]" />
                  <strong className="text-white">12</strong> day streak
                </div>
                <Link href="/profile" aria-label={`Open profile for ${email}`} title={email} className="hidden h-9 w-9 place-items-center rounded-full border border-white/10 text-xs font-bold md:grid">{email.slice(0, 1).toUpperCase()}</Link>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 md:px-10 md:py-10">
            <section className="grid gap-4 lg:grid-cols-[1.7fr_.75fr]">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#11140e] p-6 sm:p-8 md:p-10">
                <div className="relative z-10">
                  <span className="rounded-full border border-[#3c4820] bg-[#1a1e12] px-3 py-1.5 text-[8px] tracking-wider text-[#d9ff52]">WEEK 5 - FOUNDATION</span>
                  <h2 className="mt-6 text-[38px] font-extrabold leading-[.95] tracking-[-0.055em] sm:text-5xl">Build the base.<br /><span className="text-[#d9ff52]">Earn the skills.</span></h2>
                  <p className="mt-5 max-w-xl text-sm leading-6 text-zinc-400">Strength, mobility and running work together. Today is a focused skill and strength session.</p>
                  <Link href="/workout" className="mt-7 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#d9ff52] px-5 text-sm font-bold text-black transition hover:bg-[#e5ff78] active:scale-[0.98] sm:w-auto"><Play size={16} fill="currentColor" />Start today&apos;s workout</Link>
                </div>
                <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full border border-[#394120] opacity-30" />
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111317] p-6">
                <p className="text-[9px] tracking-[0.15em] text-zinc-500">NEXT MILESTONE</p>
                <div className="mt-5 flex items-center justify-between"><div><h3 className="text-lg font-bold">Strict Pull-up</h3><p className="mt-1 text-xs text-zinc-500">5-8 clean reps</p></div><div className="text-3xl text-[#d9ff52]">↑</div></div>
                <div className="mt-6 h-1.5 rounded-full bg-zinc-800"><div className="h-full w-[82%] rounded-full bg-[#d9ff52]" /></div>
                <p className="mt-2 text-[10px] text-zinc-500">82% ready - Chest-to-bar next</p>
              </div>
            </section>

            <section className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              {dashboardStats.map((stat) => { const Icon = stat.icon; return <div key={stat.label} className="rounded-xl border border-white/10 bg-[#101114] p-4"><div className="flex items-center gap-3"><Icon size={16} className="text-zinc-500" /><div><div className="text-base font-bold sm:text-lg">{stat.value}</div><div className="text-[8px] tracking-wider text-zinc-600">{stat.label}</div></div></div></div>; })}
            </section>

            <section className="mt-8"><div className="mb-4"><p className="text-[9px] tracking-[0.15em] text-zinc-500">TODAY&apos;S PLAN</p><h2 className="mt-1 text-xl font-bold">Train with intent.</h2></div>
              <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-5">
                {workout.map((item, index) => <div key={item.number} className={`min-w-[180px] snap-start rounded-xl border p-5 sm:min-w-0 ${index === 1 ? "border-[#3d4722] bg-[#151810]" : "border-white/10 bg-[#101114]"}`}><div className="text-[10px] font-mono text-zinc-600">{item.number}</div><div className="my-6 text-xl text-[#d9ff52]">{["⚡", "◎", "◆", "↗", "◌"][index]}</div><h3 className="text-sm font-bold">{item.name}</h3><p className="mt-2 min-h-8 text-[10px] leading-4 text-zinc-500">{item.description}</p><div className="mt-5 text-[10px] text-zinc-600">{item.duration}</div></div>)}
              </div>
            </section>

            <section className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
              <div className="rounded-2xl border border-white/10 bg-[#111317] p-5 sm:p-6"><p className="text-[9px] tracking-[0.15em] text-zinc-500">SKILL TREE</p><h3 className="mt-1 text-base font-bold">Active progressions</h3><div className="mt-5 space-y-5">{skills.map((skill) => <div key={skill.name}><div className="mb-2 flex justify-between"><div><span className="text-xs font-semibold">{skill.name}</span><span className="ml-2 text-[9px] text-zinc-600">{skill.level}</span></div><span className="text-[10px] text-zinc-500">{skill.progress}%</span></div><div className="h-1 rounded-full bg-zinc-800"><div className="h-full rounded-full bg-[#d9ff52]" style={{ width: `${skill.progress}%` }} /></div><p className="mt-2 text-[9px] text-zinc-600">Next -&gt; {skill.next}</p></div>)}</div></div>
              <div className="rounded-2xl border border-white/10 bg-[#111317] p-5 sm:p-6"><p className="text-[9px] tracking-[0.15em] text-zinc-500">RECOVERY</p><h3 className="mt-1 text-base font-bold">Ready to train</h3><div className="mt-5"><span className="text-5xl font-extrabold">86</span><span className="text-xs text-zinc-600"> / 100</span></div><div className="mt-6 flex gap-1"><div className="h-2 flex-1 rounded bg-[#d9ff52]" /><div className="h-2 flex-1 rounded bg-[#d9ff52]" /><div className="h-2 flex-1 rounded bg-[#d9ff52]" /></div><div className="mt-2 flex justify-between text-[8px] text-zinc-600"><span>Sleep 92%</span><span>Mobility 81%</span><span>Load 74%</span></div></div>
            </section>
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0b0c0f]/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"><div className="mx-auto flex h-16 max-w-md items-center justify-around"><MobileNav href="/" icon={<HomeIcon size={20} />} label="Home" active /><MobileNav href="/workout" icon={<Dumbbell size={20} />} label="Workout" /><MobileNav href="/skills" icon={<Zap size={20} />} label="Skills" /><MobileNav href="/progress" icon={<Trophy size={20} />} label="Progress" /><MobileNav href="/profile" icon={<User size={20} />} label="Profile" /></div></nav>
    </main>
  );
}

function Logo() {
  return <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-[#d9ff52] text-black"><Flame size={19} fill="currentColor" /></div><div><div className="text-sm font-bold tracking-[0.2em]">FORGE</div><div className="text-[9px] tracking-[0.15em] text-zinc-500">ATHLETIC SYSTEM</div></div></div>;
}

function SideItem({ children, href, icon, active = false }: { children: React.ReactNode; href: string; icon: React.ReactNode; active?: boolean }) {
  return <Link href={href} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition ${active ? "bg-[#17191d] text-white" : "text-zinc-500 hover:bg-[#15171a] hover:text-white"}`}>{icon}{children}</Link>;
}

function MobileNav({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return <Link href={href} className={`flex min-w-[56px] flex-col items-center justify-center gap-1 ${active ? "text-[#d9ff52]" : "text-zinc-600"}`}>{icon}<span className="text-[9px] font-medium">{label}</span></Link>;
}
