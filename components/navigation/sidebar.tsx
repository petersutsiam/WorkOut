import Link from "next/link";
import {
  Activity,
  BarChart3,
  Dumbbell,
  Home,
  Trophy,
  User,
} from "lucide-react";

import { Logo } from "./logo";

const items = [
  {
    label: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    label: "Workout",
    href: "/workout",
    icon: Dumbbell,
  },
  {
    label: "Skills",
    href: "/skills",
    icon: Trophy,
  },
  {
    label: "Progress",
    href: "/progress",
    icon: BarChart3,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-white/10 bg-black lg:block">
      <div className="sticky top-0 flex h-screen flex-col p-5">
        <Logo />

        <nav className="mt-10 space-y-2">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-zinc-500 transition hover:bg-white/5 hover:text-white"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-[#d9ff52]/10 bg-[#d9ff52]/5 p-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#d9ff52]" />

            <span className="text-xs font-bold text-[#d9ff52]">
              FOUNDATION
            </span>
          </div>

          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Build the fundamentals before chasing advanced skills.
          </p>
        </div>
      </div>
    </aside>
  );
}