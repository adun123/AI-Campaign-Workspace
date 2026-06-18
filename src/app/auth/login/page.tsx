"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FormData = { email: string; password: string };

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Login gagal.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.12),transparent_55%)]" />

      <div className="relative w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">K</div>
          <h1 className="text-2xl font-bold text-text-primary">Masuk ke Kaiva</h1>
          <p className="text-sm text-text-muted">Lanjutkan workflow campaign kamu</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-card border bg-surface p-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Email</label>
            <Input type="email" placeholder="kamu@email.com" {...register("email", { required: true })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Password</label>
            <Input type="password" placeholder="••••••••" {...register("password", { required: true })} />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Memproses..." : "Masuk"}
          </Button>
        </form>

        <p className="text-center text-sm text-text-muted">
          Belum punya akun?{" "}
          <Link href="/auth/register" className="text-accent hover:underline">
            Daftar gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
