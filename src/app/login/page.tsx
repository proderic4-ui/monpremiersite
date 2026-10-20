"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Connexion impossible.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Erreur réseau, vérifiez votre connexion.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#060b08] text-white grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 bg-gradient-to-br from-[#0a1a10] via-[#060b08] to-[#0a1a10]">
        <div className="grid-bg absolute inset-0" />
        <div className="absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="relative">
          <a href="/" className="flex items-center gap-2.5">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#b8f135] text-2xl font-black text-[#060b08]">⚡</span>
            <span className="leading-none">
              <span className="block text-xl font-black">WALLBOX</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-[#b8f135]">Energy Earnings</span>
            </span>
          </a>
        </div>
        <div className="relative">
          <h1 className="font-display text-5xl font-black leading-[1.02]">
            Bon retour parmi nous. Vos gains vous attendaient. 💰
          </h1>
          <div className="glass mt-8 rounded-3xl p-6">
            <div className="text-sm text-white/55 font-semibold">Gains versés aujourd&apos;hui</div>
            <div className="font-display text-4xl font-black text-[#b8f135]">18 420 500 FCFA</div>
            <div className="mt-3 flex items-end gap-1 h-16">
              {[40, 65, 50, 78, 62, 88, 74, 96, 84, 100].map((h, i) => (
                <div key={i} style={{ height: `${h}%` }} className="flex-1 rounded-t-md bg-[#b8f135]/70" />
              ))}
            </div>
          </div>
        </div>
        <p className="relative text-sm text-white/40">⚡ Connectez-vous pour réclamer vos gains du jour.</p>
      </div>

      <div className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <a href="/" className="lg:hidden flex items-center gap-2.5 mb-8">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#b8f135] text-xl font-black text-[#060b08]">⚡</span>
            <span className="text-lg font-black">WALLBOX</span>
          </a>
          <h2 className="font-display text-3xl font-black">Aller à la connexion</h2>
          <p className="mt-1.5 text-sm text-white/55">
            Pas encore de compte ?{" "}
            <a href="/register" className="font-bold text-[#b8f135] hover:underline">Créer un compte gratuit →</a>
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="text-[13px] font-bold text-white/70">Adresse e-mail</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="vous@exemple.com"
                className="mt-1.5 w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3.5 text-[15px] outline-none placeholder:text-white/30 focus:border-[#b8f135]/60 transition"
              />
            </div>
            <div>
              <label className="text-[13px] font-bold text-white/70">Mot de passe</label>
              <div className="relative mt-1.5">
                <input
                  required
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Votre mot de passe"
                  className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3.5 pr-14 text-[15px] outline-none placeholder:text-white/30 focus:border-[#b8f135]/60 transition"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-bold">
                  {showPwd ? "Masquer" : "Voir"}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="btn-shine w-full rounded-2xl bg-[#b8f135] py-4 font-black text-[#060b08] hover:bg-[#c9ff4d] transition disabled:opacity-60"
            >
              {loading ? "Connexion…" : "Se connecter →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
