import Link from "next/link";
import {
  BarChart3,
  Dumbbell,
  Home,
  Trophy,
  User,
} from "lucide-react";

const items = [
  {
    label: "Home",
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

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/95 px-2 py-2 backdrop-blur lg:hidden">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 rounded-xl py-2 text-zinc-500 transition hover:text-white"
            >
              <Icon className="h-5 w-5" />

              <span className="text-[9px] font-bold">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}