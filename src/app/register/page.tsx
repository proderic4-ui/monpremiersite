"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PAYMENT_COUNTRIES, type PaymentCountryCode } from "@/lib/payments";

function RegisterInner() {
  const search = useSearchParams();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", refCode: "" });
  const [country, setCountry] = useState<PaymentCountryCode>("CI");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    const fromUrl = search.get("ref") || "";
    let stored = "";
    try {
      stored = localStorage.getItem("wb_ref") || "";
    } catch {}
    const code = fromUrl || stored;
    if (code) setForm((f) => ({ ...f, refCode: code }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const dial = PAYMENT_COUNTRIES.find((c) => c.code === country)?.dialCode || "";
    const fullPhone = form.phone.trim().startsWith("+") ? form.phone.trim() : `${dial} ${form.phone.trim()}`;
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone: fullPhone, country }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription.");
        setLoading(false);
        return;
      }
      try {
        localStorage.removeItem("wb_ref");
      } catch {}
      router.push("/dashboard");
    } catch {
      setError("Erreur réseau, vérifiez votre connexion.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#060b08] text-white grid lg:grid-cols-2">
      {/* Left branding */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 bg-gradient-to-br from-[#0a1a10] via-[#060b08] to-[#0a1a10]">
        <div className="grid-bg absolute inset-0" />
        <div className="absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-[#b8f135]/15 blur-[120px]" />
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
            Rejoignez <span className="text-[#b8f135]">12 800+</span> investisseurs qui gagnent chaque jour.
          </h1>
          <div className="mt-8 space-y-3">
            {[
              "🎁 Bonus de 1 000 FCFA offert immédiatement",
              "📈 Jusqu'à 15% de gains par jour",
              "👥 10% / 5% / 2% de commissions parrainage",
              "💸 Retraits Mobile Money en ~15 minutes",
            ].map((t) => (
              <div key={t} className="glass rounded-2xl px-5 py-3.5 font-semibold text-[15px]">{t}</div>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-white/40">🔒 Vos données sont chiffrées et protégées.</p>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <a href="/" className="lg:hidden flex items-center gap-2.5 mb-8">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#b8f135] text-xl font-black text-[#060b08]">⚡</span>
            <span className="text-lg font-black">WALLBOX</span>
          </a>
          <h2 className="font-display text-3xl font-black">Créer un compte</h2>
          <p className="mt-1.5 text-sm text-white/55">
            Déjà membre ?{" "}
            <a href="/login" className="font-bold text-[#b8f135] hover:underline">Aller à la connexion →</a>
          </p>

          {form.refCode && (
            <div className="mt-5 rounded-2xl border border-[#b8f135]/30 bg-[#b8f135]/10 px-4 py-3 text-sm font-semibold text-[#d7ff7a]">
              🎁 Code parrain détecté : <span className="font-black uppercase">{form.refCode}</span>
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="text-[13px] font-bold text-white/70">Nom complet</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex : Awa Koné"
                className="mt-1.5 w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3.5 text-[15px] outline-none placeholder:text-white/30 focus:border-[#b8f135]/60 focus:bg-white/8 transition"
              />
            </div>
            <div>
              <label className="text-[13px] font-bold text-white/70">Adresse e-mail</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="vous@exemple.com"
                className="mt-1.5 w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3.5 text-[15px] outline-none placeholder:text-white/30 focus:border-[#b8f135]/60 focus:bg-white/8 transition"
              />
            </div>
            <div>
              <label className="text-[13px] font-bold text-white/70">Pays & numéro Mobile Money</label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {PAYMENT_COUNTRIES.map((c) => (
                  <button
                    type="button"
                    key={c.code}
                    onClick={() => setCountry(c.code)}
                    className={`rounded-2xl border px-3 py-2.5 text-[13px] font-black transition flex items-center gap-2 justify-center ${country === c.code ? "border-[#b8f135] bg-[#b8f135]/10 text-[#d7ff7a]" : "border-white/10 bg-white/5 text-white/60"}`}
                  >
                    <span className="text-base">{c.flag}</span> {c.name}
                  </button>
                ))}
              </div>
              <div className="relative mt-2">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-[#b8f135]">
                  {PAYMENT_COUNTRIES.find((c) => c.code === country)?.dialCode}
                </span>
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder={country === "CI" ? "07 07 07 07 07" : country === "SN" ? "77 123 45 67" : "90 12 34 56"}
                  className="w-full rounded-2xl border border-white/12 bg-white/5 pl-16 pr-4 py-3.5 text-[15px] outline-none placeholder:text-white/30 focus:border-[#b8f135]/60 focus:bg-white/8 transition"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-white/40">
                {country === "TG" && "🇹🇬 Togo : TMoney (90/91/92) • Moov (79/78)"}
                {country === "BJ" && "🇧🇯 Bénin : MTN (96/97) • Moov (94) • Celtiis (41/42)"}
                {country === "CI" && "🇨🇮 Côte d'Ivoire : Wave • Orange • MTN • Moov (10 chiffres)"}
                {country === "SN" && "🇸🇳 Sénégal : Wave • Orange • Free • E-Money (9 chiffres)"}
              </p>
            </div>
            <div>
              <label className="text-[13px] font-bold text-white/70">Mot de passe</label>
              <div className="relative mt-1.5">
                <input
                  required
                  type={showPwd ? "text" : "password"}
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="6 caractères minimum"
                  className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3.5 pr-14 text-[15px] outline-none placeholder:text-white/30 focus:border-[#b8f135]/60 focus:bg-white/8 transition"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-bold">
                  {showPwd ? "Masquer" : "Voir"}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[13px] font-bold text-white/70">Code parrain <span className="font-normal text-white/40">(optionnel)</span></label>
              <input
                value={form.refCode}
                onChange={(e) => setForm({ ...form, refCode: e.target.value })}
                placeholder="Ex : 2a77b5"
                className="mt-1.5 w-full rounded-2xl border border-dashed border-[#b8f135]/40 bg-[#b8f135]/5 px-4 py-3.5 text-[15px] uppercase outline-none placeholder:normal-case placeholder:text-white/30 focus:border-[#b8f135] transition"
              />
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
              {loading ? "Création du compte…" : "🎁 Créer mon compte + 1 000 FCFA"}
            </button>
            <p className="text-center text-xs text-white/40">
              En vous inscrivant, vous acceptez nos conditions d&apos;utilisation.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060b08]" />}>
      <RegisterInner />
    </Suspense>
  );
}
