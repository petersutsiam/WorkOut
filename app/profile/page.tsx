import { Bell, ChevronRight, ShieldCheck, UserRound } from "lucide-react";
import { ForgeShell, Panel, SectionLabel } from "@/components/forge-shell";
import { getCurrentUser, getProfile } from "@/lib/supabase/forge-data";
import { LogoutButton } from "@/components/logout-button";

export const instant = false;

export default async function ProfilePage() {
	const { supabase, userId, email } = await getCurrentUser();
	const profile = await getProfile(supabase, userId);
	const initial = email.slice(0, 1).toUpperCase();
	const displayName = profile?.display_name || email.split("@")[0];

	return <ForgeShell title="Profile" eyebrow="YOUR FORGE" active="Profile"><div className="grid gap-4 lg:grid-cols-[.75fr_1.25fr]"><Panel className="bg-[#11140e]"><div className="grid h-16 w-16 place-items-center rounded-full bg-[#d9ff52] text-2xl font-extrabold text-black">{initial}</div><h2 className="mt-5 text-2xl font-bold">{displayName}</h2><p className="mt-1 text-sm text-zinc-500">{email}</p><div className="mt-8 border-t border-white/10 pt-5"><SectionLabel>MEMBER STATUS</SectionLabel><p className="mt-2 text-sm font-semibold text-[#d9ff52]">Level {profile?.current_level ?? 1} · {profile?.total_xp ?? 0} XP</p><p className="mt-1 text-xs text-zinc-500">{profile?.current_streak ?? 0} day current streak · {profile?.longest_streak ?? 0} best</p></div></Panel><Panel><SectionLabel>ACCOUNT SETTINGS</SectionLabel><div className="mt-4 divide-y divide-white/10">{[[UserRound, "Personal details", "Name, goals and experience"], [Bell, "Notifications", "Training reminders and updates"], [ShieldCheck, "Privacy and security", "Manage your account access"]].map(([Icon, label, detail]) => <button key={label as string} type="button" className="flex w-full items-center gap-4 py-4 text-left"><span className="text-zinc-500"><Icon size={18} /></span><span className="flex-1"><strong className="block text-sm">{label as string}</strong><small className="mt-1 block text-xs text-zinc-600">{detail as string}</small></span><ChevronRight size={16} className="text-zinc-600" /></button>)}</div><LogoutButton /></Panel></div></ForgeShell>;
}