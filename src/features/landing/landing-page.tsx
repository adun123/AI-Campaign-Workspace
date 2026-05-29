"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays, ImageIcon, Layers, Pencil, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const slides = [
  { icon: Sparkles, title: "AI Chat Workspace", description: "Buat visual dan copy campaign lewat percakapan natural dengan AI. Tinggal ketik, AI yang kerjain.", color: "text-primary-soft", glow: "bg-primary/20" },
  { icon: TrendingUp, title: "Trend Discovery", description: "Cari tahu apa yang lagi viral di Instagram, TikTok, dan LinkedIn. Langsung jadikan brief campaign.", color: "text-accent", glow: "bg-accent/20" },
  { icon: Layers, title: "Template Gallery", description: "Mulai dari format yang sudah terbukti — carousel, story, ads, script. Tinggal isi, langsung generate.", color: "text-success", glow: "bg-success/20" },
  { icon: Pencil, title: "AI Masking & Edit", description: "Coret area yang mau diubah, tulis instruksi, AI regenerate bagian itu saja. Editing tanpa ribet.", color: "text-warning", glow: "bg-warning/20" },
  { icon: ImageIcon, title: "Asset Library", description: "Semua hasil generate tersimpan rapi. Filter, cari, download, schedule, atau hapus dalam satu tempat.", color: "text-primary-soft", glow: "bg-primary/20" },
  { icon: CalendarDays, title: "Smart Scheduler", description: "Jadwalkan post ke Instagram, LinkedIn, TikTok, dan Email. Tinggal pilih tanggal dan waktu, beres.", color: "text-accent", glow: "bg-accent/20" },
];

export function LandingPage() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const isLast = current === slides.length - 1;
  const isFirst = current === 0;

  function go(to: number) {
    setDirection(to > current ? 1 : -1);
    setCurrent(to);
  }

  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.12),transparent_55%),radial-gradient(circle_at_80%_90%,rgba(96,165,250,0.08),transparent_45%)]" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">K</div>
          <span className="text-lg font-semibold text-text-primary">Kaiva</span>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">Skip</Link>
        </Button>
      </header>

      {/* Content — centered, fixed zone so layout never jumps */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              {/* Icon with glow */}
              <div className="relative flex h-32 w-32 items-center justify-center">
                <div className={`absolute inset-0 rounded-full ${slide.glow} blur-2xl`} />
                <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl border bg-surface/80 backdrop-blur-xl">
                  <Icon className={`h-12 w-12 ${slide.color}`} />
                </div>
              </div>

              <p className="mt-8 text-xs font-medium uppercase tracking-widest text-text-muted">
                {current + 1} / {slides.length}
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary">{slide.title}</h2>
              <p className="mt-4 min-h-16 text-sm leading-7 text-text-muted">{slide.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer — dots + controls (fixed) */}
      <footer className="relative z-10 px-6 pb-10">
        <div className="mx-auto w-full max-w-md space-y-6">
          {/* Dots */}
          <div className="flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === current ? "w-8 bg-primary" : "w-2 bg-border-strong hover:bg-text-muted"}`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={() => go(current - 1)} disabled={isFirst} className={isFirst ? "invisible" : ""}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            {isLast ? (
              <Button asChild>
                <Link href="/dashboard">Get Started <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            ) : (
              <Button onClick={() => go(current + 1)}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
