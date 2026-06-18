"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FormData = { full_name: string; email: string; password: string };

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Registrasi gagal.");
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-sm space-y-3 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-success/20 text-success text-xl">✓</div>
          <h2 className="text-xl font-bold text-text-primary">Cek email kamu</h2>
          <p className="text-sm text-text-muted">Link verifikasi sudah dikirim. Verifikasi dulu sebelum login.</p>
          <Button asChild variant="secondary" className="w-full">
            <Link href="/auth/login">Ke halaman login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.12),transparent_55%)]" />

      <div className="relative w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">K</div>
          <h1 className="text-2xl font-bold text-text-primary">Buat akun Kaiva</h1>
          <p className="text-sm text-text-muted">Gratis, tanpa kartu kredit</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-card border bg-surface p-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Nama lengkap</label>
            <Input placeholder="John Doe" {...register("full_name", { required: true })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Email</label>
            <Input type="email" placeholder="kamu@email.com" {...register("email", { required: true })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">Password</label>
            <Input type="password" placeholder="Min. 6 karakter" {...register("password", { required: true, minLength: 6 })} />
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Memproses..." : "Daftar sekarang"}
          </Button>
        </form>

        <p className="text-center text-sm text-text-muted">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="text-accent hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
