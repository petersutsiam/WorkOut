import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-[#090a0c] p-6 text-white md:p-10">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-[#394120] opacity-30" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full border border-white/5" />
      <div className="relative w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
