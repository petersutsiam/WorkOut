"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { Flame } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      window.location.assign("/");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="mb-2 flex items-center justify-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#d9ff52] text-black">
          <Flame size={21} fill="currentColor" />
        </div>
        <div>
          <div className="text-sm font-bold tracking-[0.2em]">FORGE</div>
          <div className="text-[9px] tracking-[0.15em] text-zinc-500">ATHLETIC SYSTEM</div>
        </div>
      </div>
      <Card className="rounded-2xl border-white/10 bg-[#111317] text-white shadow-2xl shadow-black/30">
        <CardHeader className="gap-2 p-6 pb-5">
          <CardTitle className="text-2xl font-extrabold tracking-tight">Welcome back.</CardTitle>
          <CardDescription className="text-sm leading-5 text-zinc-500">
            Sign in to continue your training.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label className="text-[10px] tracking-widest text-zinc-400" htmlFor="email">EMAIL</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="h-11 border-white/10 bg-[#0b0c0f] text-sm text-white placeholder:text-zinc-700 focus-visible:ring-[#d9ff52]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label className="text-[10px] tracking-widest text-zinc-400" htmlFor="password">PASSWORD</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-xs text-[#d9ff52] underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  className="h-11 border-white/10 bg-[#0b0c0f] text-sm text-white placeholder:text-zinc-700 focus-visible:ring-[#d9ff52]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
              <Button type="submit" className="h-11 w-full bg-[#d9ff52] font-bold text-black hover:bg-[#e5ff78]" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
            <div className="mt-5 text-center text-sm text-zinc-500">
              New to Forge?{" "}
              <Link
                href="/auth/sign-up"
                className="font-semibold text-[#d9ff52] underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
