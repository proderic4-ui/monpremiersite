"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatFCFA } from "@/lib/utils";

const PLANS = [
  {
    name: "Starter Volt",
    tagline: "Idéal pour découvrir",
    min: 5000,
    max: 29000,
    rate: 8,
    days: 7,
    badge: "Débutant",
    gradient: "from-emerald-400 to-teal-500",
    border: "hover:border-emerald-300/50",
  },
  {
    name: "Pro Watt",
    tagline: "Le plus choisi",
    min: 30000,
    max: 99000,
    rate: 10,
    days: 10,
    badge: "Populaire",
    gradient: "from-[#b8f135] to-emerald-500",
    border: "border-[#b8f135]/60",
  },
  {
    name: "Premium Grid",
    tagline: "Rendement accéléré",
    min: 100000,
    max: 499000,
    rate: 12,
    days: 15,
    badge: "Boosté",
    gradient: "from-amber-300 to-orange-500",
    border: "hover:border-amber-300/50",
  },
  {
    name: "Elite Supernova",
    tagline: "Grands investisseurs",
    min: 500000,
    max: 5000000,
    rate: 15,
    days: 20,
    badge: "Elite",
    gradient: "from-violet-400 to-fuchsia-500",
    border: "hover:border-violet-300/50",
  },
];

const PAYOUTS = [
  { name: "Aïcha D.", amount: 84500, method: "Wave CI 🇨🇮", time: "il y a 2 min" },
  { name: "Kossi A.", amount: 152000, method: "TMoney TG 🇹🇬", time: "il y a 5 min" },
  { name: "Fatou S.", amount: 47800, method: "Wave SN 🇸🇳", time: "il y a 9 min" },
  { name: "Jean-Marc B.", amount: 320000, method: "MTN BJ 🇧🇯", time: "il y a 14 min" },
  { name: "Ibrahim T.", amount: 96500, method: "Orange SN 🇸🇳", time: "il y a 18 min" },
  { name: "Grace M.", amount: 210000, method: "Moov TG 🇹🇬", time: "il y a 23 min" },
  { name: "Koffi A.", amount: 63900, method: "MTN CI 🇨🇮", time: "il y a 27 min" },
  { name: "Mariam C.", amount: 128400, method: "Celtiis BJ 🇧🇯", time: "il y a 31 min" },
];

const PAYMENT_SHOWCASE = [
  {
    flag: "🇹🇬",
    country: "Togo",
    dial: "+228",
    ops: [
      { n: "TMoney", c: "#E30613" },
      { n: "Moov Money", c: "#0057A8" },
    ],
  },
  {
    flag: "🇧🇯",
    country: "Bénin",
    dial: "+229",
    ops: [
      { n: "MTN MoMo", c: "#FFCC00" },
      { n: "Moov Money", c: "#0066CC" },
      { n: "Celtiis Cash", c: "#6D28D9" },
    ],
  },
  {
    flag: "🇨🇮",
    country: "Côte d'Ivoire",
    dial: "+225",
    ops: [
      { n: "Wave", c: "#1DC8FF" },
      { n: "Orange Money", c: "#FF7900" },
      { n: "MTN MoMo", c: "#FFCC00" },
      { n: "Moov Money", c: "#0057A8" },
    ],
  },
  {
    flag: "🇸🇳",
    country: "Sénégal",
    dial: "+221",
    ops: [
      { n: "Wave", c: "#1DC8FF" },
      { n: "Orange Money", c: "#FF7900" },
      { n: "Free Money", c: "#E30613" },
      { n: "E-Money", c: "#10B981" },
    ],
  },
];

const TESTIMONIALS = [
  {
    name: "Aïcha Diallo",
    city: "Abidjan",
    text: "J'ai commencé avec 15 000 FCFA pour tester. 7 jours après, gains + capital reçus sur Wave sans discuter. J'ai réinvesti 100 000 FCFA dans Premium.",
    gain: "+126 000 FCFA",
    initial: "AD",
  },
  {
    name: "Yao Kouassi",
    city: "Bouaké",
    text: "Le parrainage change tout : avec 23 filleuls, je touche des commissions chaque jour sans investir plus. Mon lien tourne sur WhatsApp et TikTok.",
    gain: "+342 500 FCFA",
    initial: "YK",
  },
  {
    name: "Fatou Sow",
    city: "Dakar",
    text: "Retrait demandé à 21h14, reçu à 21h29 sur Orange Money. Service client qui répond vraiment. C'est devenu mon complément de revenu principal.",
    gain: "+218 900 FCFA",
    initial: "FS",
  },
];

const FAQS = [
  {
    q: "Comment fonctionne WALLBOX ?",
    a: "Vous déposez des fonds via Mobile Money, vous choisissez un plan (8% à 15% par jour), vos gains s'accumulent quotidiennement et vous les réclamez depuis votre tableau de bord. À la fin du cycle, votre capital vous est restitué intégralement.",
  },
  {
    q: "Quel est le dépôt minimum et le retrait minimum ?",
    a: "Le dépôt minimum est de 5 000 FCFA et le retrait minimum de 3 000 FCFA. Les dépôts sont crédités instantanément, les retraits sont traités en 15 minutes en moyenne, 24h/24 et 7j/7.",
  },
  {
    q: "Comment marche le parrainage ?",
    a: "Chaque membre reçoit un lien unique. Vous gagnez 10% sur les investissements de vos filleuls directs (niveau 1), 5% au niveau 2 et 2% au niveau 3. Les commissions sont créditées instantanément sur votre solde retirable.",
  },
  {
    q: "Puis-je retirer mon capital avant la fin ?",
    a: "Les gains quotidiens sont retirables à tout moment après réclamation. Le capital investi est restitué automatiquement à la fin du cycle du plan (7 à 20 jours selon le plan).",
  },
  {
    q: "Quels moyens de paiement acceptez-vous ?",
    a: "Nous supportons 4 pays : Togo 🇹🇬 (TMoney, Moov Money), Bénin 🇧🇯 (MTN MoMo, Moov Money, Celtiis Cash), Côte d'Ivoire 🇨🇮 (Wave, Orange Money, MTN MoMo, Moov Money) et Sénégal 🇸🇳 (Wave, Orange Money, Free Money, E-Money) + carte bancaire. Les retraits se font vers le numéro Mobile Money de votre choix, dans votre pays.",
  },
];

function LandingInner() {
  const search = useSearchParams();
  const ref = search.get("ref") || "";
  const [calcAmount, setCalcAmount] = useState(50000);
  const [calcPlan, setCalcPlan] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [countUp, setCountUp] = useState(0);

  useEffect(() => {
    if (ref) {
      try {
        localStorage.setItem("wb_ref", ref);
      } catch {}
    }
  }, [ref]);

  useEffect(() => {
    const target = 12847;
    const start = Date.now();
    const dur = 2200;
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setCountUp(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const registerHref = useMemo(
    () => (ref ? `/register?ref=${encodeURIComponent(ref)}` : "/register"),
    [ref]
  );

  const calc = PLANS[calcPlan];
  const daily = Math.round((calcAmount * calc.rate) / 100);
  const total = daily * calc.days;
  const withCapital = total + calcAmount;

  return (
    <div className="min-h-screen bg-[#060b08] text-white overflow-x-hidden">
      {/* Announcement */}
      <div className="bg-[#b8f135] text-[#060b08] text-center text-[13px] font-bold py-2 px-4 tracking-wide">
        ⚡ Bonus de bienvenue : 1 000 FCFA offerts à l&apos;inscription — retraits Mobile Money en ~15 min
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#060b08]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#b8f135] text-xl font-black text-[#060b08] shadow-[0_0_30px_rgba(184,241,53,0.5)]">
              ⚡
            </span>
            <span className="leading-none">
              <span className="block text-lg font-black tracking-tight">WALLBOX</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-[#b8f135]">
                Energy Earnings
              </span>
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium text-white/70 lg:flex">
            <a href="#plans" className="hover:text-white transition">Plans</a>
            <a href="#simulateur" className="hover:text-white transition">Simulateur</a>
            <a href="#paiements" className="hover:text-white transition">Paiements 🌍</a>
            <a href="#parrainage" className="hover:text-white transition">Parrainage</a>
            <a href="#avis" className="hover:text-white transition">Avis</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <a
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-bold text-white/80 hover:text-white transition"
            >
              Connexion
            </a>
            <a
              href={registerHref}
              className="btn-shine rounded-full bg-[#b8f135] px-5 py-2.5 text-sm font-black text-[#060b08] hover:bg-[#c9ff4d] transition shadow-[0_8px_30px_rgba(184,241,53,0.35)]"
            >
              Créer un compte
            </a>
          </div>
        </div>
        {ref && (
          <div className="border-t border-[#b8f135]/20 bg-[#b8f135]/10 px-5 py-2 text-center text-[13px] font-semibold text-[#d7ff7a]">
            🎁 Vous avez été invité par un membre — votre code parrain :{" "}
            <span className="font-black uppercase">{ref}</span> (bonus appliqué à l&apos;inscription)
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="top" className="relative">
        <div className="grid-bg absolute inset-0" />
        <div className="absolute -top-32 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-[#b8f135]/15 blur-[140px]" />
        <div className="absolute top-40 -left-32 h-96 w-96 rounded-full bg-emerald-500/15 blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#b8f135]/30 bg-[#b8f135]/10 px-4 py-1.5 text-[13px] font-bold text-[#d7ff7a]">
              <span className="live-dot h-2 w-2 rounded-full bg-[#b8f135]" />
              {countUp.toLocaleString("fr-FR")} investisseurs actifs en ce moment
            </div>
            <h1 className="font-display mt-6 text-[clamp(2.4rem,6vw,4.6rem)] font-black leading-[0.98]">
              Faites travailler
              <br />
              votre argent.
              <br />
              <span className="bg-gradient-to-r from-[#b8f135] via-emerald-300 to-[#b8f135] bg-clip-text text-transparent text-glow">
                Jusqu&apos;à 15% / jour.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/65">
              WALLBOX transforme vos dépôts en revenus quotidiens. Choisissez un plan
              de <strong className="text-white">8% à 15% par jour</strong>, réclamez vos
              gains chaque jour et parrainez pour toucher{" "}
              <strong className="text-white">10% / 5% / 2%</strong> sur 3 niveaux.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={registerHref}
                className="btn-shine animate-pulse-ring rounded-2xl bg-[#b8f135] px-8 py-4 text-base font-black text-[#060b08] hover:bg-[#c9ff4d] transition"
              >
                ⚡ Commencer — bonus 1 000 FCFA
              </a>
              <a
                href="#plans"
                className="rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-base font-bold text-white hover:bg-white/10 transition"
              >
                Voir les plans
              </a>
            </div>
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-4">
              {[
                { v: "482 M", l: "FCFA déjà versés" },
                { v: "98,4 %", l: "Retraits réussis" },
                { v: "~15 min", l: "Délai de retrait" },
              ].map((s) => (
                <div key={s.l} className="glass rounded-2xl px-4 py-3.5 text-center">
                  <div className="text-xl font-black text-[#b8f135]">{s.v}</div>
                  <div className="mt-0.5 text-[11px] font-medium text-white/55">{s.l}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-white/50">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">🇹🇬 Togo • TMoney • Moov</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">🇧🇯 Bénin • MTN • Moov • Celtiis</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">🇨🇮 CI • Wave • Orange • MTN • Moov</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">🇸🇳 Sénégal • Wave • Orange • Free</span>
              <span className="rounded-full border border-[#b8f135]/30 bg-[#b8f135]/10 px-3 py-1 text-[#d7ff7a]">💳 Carte bancaire</span>
            </div>
          </div>

          {/* Hero mock dashboard */}
          <div className="relative">
            <div className="animate-float glass-strong relative rounded-[28px] p-6 shadow-[0_40px_120px_-30px_rgba(184,241,53,0.3)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#b8f135] to-emerald-500 text-lg font-black text-[#060b08]">Y</span>
                  <div>
                    <div className="text-sm font-bold">Yao K. — Pro Watt</div>
                    <div className="text-xs text-emerald-300 font-semibold">● Compte vérifié</div>
                  </div>
                </div>
                <span className="rounded-full bg-[#b8f135]/15 border border-[#b8f135]/30 px-3 py-1 text-xs font-black text-[#b8f135]">+10% / jour</span>
              </div>
              <div className="mt-5 rounded-2xl bg-gradient-to-br from-[#b8f135] to-emerald-500 p-5 text-[#060b08]">
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-70">Solde disponible</div>
                <div className="font-display text-4xl font-black">286 500 <span className="text-lg">FCFA</span></div>
                <div className="mt-1 text-[13px] font-bold opacity-75">+ 9 900 FCFA aujourd&apos;hui 📈</div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Gains totaux</div>
                  <div className="text-lg font-black text-white">154 200 F</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">Équipe</div>
                  <div className="text-lg font-black text-white">47 filleuls</div>
                </div>
              </div>
              <div className="mt-4 flex items-end gap-1.5 h-20">
                {[35, 55, 42, 68, 58, 80, 72, 95, 84, 100, 92, 110].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`flex-1 rounded-t-md ${i === 11 ? "bg-[#b8f135]" : "bg-white/12"}`}
                  />
                ))}
              </div>
              <button className="mt-4 w-full rounded-2xl bg-white py-3.5 text-sm font-black text-[#060b08] hover:bg-[#b8f135] transition">
                Réclamer mes gains du jour →
              </button>
            </div>

            <div className="animate-float absolute -left-4 top-16 hidden rounded-2xl border border-white/10 bg-[#0c140f]/95 p-3.5 shadow-2xl backdrop-blur md:block" style={{ animationDelay: "1.2s" }}>
              <div className="text-[11px] font-semibold text-white/55">Retrait approuvé ✅</div>
              <div className="text-sm font-black text-[#b8f135]">152 000 FCFA → MTN</div>
            </div>
            <div className="animate-float absolute -right-3 bottom-20 hidden rounded-2xl border border-white/10 bg-[#0c140f]/95 p-3.5 shadow-2xl backdrop-blur md:block" style={{ animationDelay: "2.1s" }}>
              <div className="text-[11px] font-semibold text-white/55">Commission parrainage 🎁</div>
              <div className="text-sm font-black text-white">+ 12 000 FCFA (niveau 1)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="border-y border-white/10 bg-black/40 py-3.5 overflow-hidden">
        <div className="animate-marquee flex w-max gap-4 pr-4">
          {[...PAYOUTS, ...PAYOUTS].map((p, i) => (
            <div key={i} className="flex shrink-0 items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px]">
              <span className="live-dot h-2 w-2 rounded-full bg-emerald-400" />
              <strong>{p.name}</strong>
              <span className="text-[#b8f135] font-black">+{p.amount.toLocaleString("fr-FR")} F</span>
              <span className="text-white/50">{p.method} • {p.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <p className="text-center text-[12px] font-black uppercase tracking-[0.3em] text-[#b8f135]">Simple comme 1-2-3</p>
        <h2 className="font-display mt-3 text-center text-4xl font-black md:text-5xl">Comment ça marche ?</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { n: "01", t: "Créez votre compte", d: "Inscrivez-vous en 30 secondes avec votre code parrain et recevez 1 000 FCFA de bonus de bienvenue.", icon: "👤" },
            { n: "02", t: "Déposez & investissez", d: "Déposez via Mobile Money (dès 5 000 FCFA) puis activez un plan de 8% à 15% par jour.", icon: "💳" },
            { n: "03", t: "Gagnez chaque jour", d: "Réclamez vos gains quotidiens, retirez en ~15 min et parrainez pour des commissions à vie.", icon: "🚀" },
          ].map((s) => (
            <div key={s.n} className="card-hover glass rounded-3xl p-7">
              <div className="flex items-center justify-between">
                <span className="text-4xl">{s.icon}</span>
                <span className="font-display text-5xl font-black text-white/10">{s.n}</span>
              </div>
              <h3 className="mt-4 text-xl font-black">{s.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-white/60">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="relative border-t border-white/5 bg-black/30 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <p className="text-center text-[12px] font-black uppercase tracking-[0.3em] text-[#b8f135]">Plans d&apos;investissement</p>
          <h2 className="font-display mt-3 text-center text-4xl font-black md:text-5xl">Choisissez votre puissance ⚡</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-white/60">Capital restitué à 100% en fin de cycle. Gains réclamables chaque jour, retirables à tout moment.</p>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((p) => (
              <div key={p.name} className={`card-hover relative rounded-3xl border border-white/10 bg-[#0c140f] p-6 ${p.border}`}>
                {p.badge === "Populaire" && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#b8f135] px-4 py-1 text-[11px] font-black uppercase tracking-wider text-[#060b08]">
                    ★ Le plus choisi
                  </span>
                )}
                <div className={`inline-block rounded-full bg-gradient-to-r ${p.gradient} px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#060b08]`}>
                  {p.badge}
                </div>
                <h3 className="mt-4 text-2xl font-black">{p.name}</h3>
                <p className="text-sm text-white/55">{p.tagline}</p>
                <div className="mt-5 flex items-end gap-1">
                  <span className="font-display text-5xl font-black text-[#b8f135]">{p.rate}%</span>
                  <span className="pb-1.5 text-sm font-bold text-white/55">/ jour</span>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-white/55">Dépôt</span><strong>{p.min.toLocaleString("fr-FR")} – {p.max >= 1000000 ? (p.max / 1000000) + " M" : p.max.toLocaleString("fr-FR")} F</strong></div>
                  <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-white/55">Durée</span><strong>{p.days} jours</strong></div>
                  <div className="flex justify-between"><span className="text-white/55">Retour total</span><strong className="text-[#b8f135]">+{p.rate * p.days}%</strong></div>
                </div>
                <a href={registerHref} className={`mt-6 block rounded-2xl py-3.5 text-center text-sm font-black transition ${p.badge === "Populaire" ? "bg-[#b8f135] text-[#060b08] hover:bg-[#c9ff4d]" : "border border-white/15 bg-white/5 hover:bg-white/10"}`}>
                  Investir maintenant →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simulateur */}
      <section id="simulateur" className="mx-auto max-w-7xl px-5 py-20">
        <div className="glass rounded-[32px] p-8 md:p-12 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.3em] text-[#b8f135]">Simulateur de gains</p>
            <h2 className="font-display mt-3 text-4xl font-black">Combien pouvez-vous gagner ?</h2>
            <div className="mt-8">
              <div className="flex justify-between text-sm font-bold"><span>Montant investi</span><span className="text-[#b8f135]">{formatFCFA(calcAmount)}</span></div>
              <input
                type="range"
                min={5000}
                max={1000000}
                step={5000}
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="mt-3 w-full accent-[#b8f135]"
              />
              <div className="mt-6 grid grid-cols-2 gap-2.5">
                {PLANS.map((p, i) => (
                  <button
                    key={p.name}
                    onClick={() => setCalcPlan(i)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${calcPlan === i ? "border-[#b8f135] bg-[#b8f135]/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                  >
                    <div className="text-sm font-black">{p.name}</div>
                    <div className="text-xs text-white/55">{p.rate}% / jour • {p.days} j</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-[#b8f135] to-emerald-500 p-8 text-[#060b08] flex flex-col justify-center">
            <div className="text-[12px] font-black uppercase tracking-[0.25em] opacity-70">Projection — {calc.name}</div>
            <div className="font-display mt-2 text-5xl font-black">{formatFCFA(withCapital)}</div>
            <div className="mt-1 text-sm font-bold opacity-75">dont {formatFCFA(total)} de gains purs en {calc.days} jours</div>
            <div className="mt-6 space-y-2.5 text-sm font-bold">
              <div className="flex justify-between border-b border-black/10 pb-2"><span>Investi</span><span>{formatFCFA(calcAmount)}</span></div>
              <div className="flex justify-between border-b border-black/10 pb-2"><span>Gain quotidien</span><span>{formatFCFA(daily)}</span></div>
              <div className="flex justify-between"><span>Capital restitué</span><span>Oui, 100% ✅</span></div>
            </div>
            <a href={registerHref} className="mt-7 rounded-2xl bg-[#060b08] py-4 text-center font-black text-white hover:bg-black transition">
              Réclamer ces gains →
            </a>
          </div>
        </div>
      </section>

      {/* Parrainage */}
      <section id="parrainage" className="border-t border-white/5 bg-black/30 py-20">
        <div className="mx-auto max-w-7xl px-5 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.3em] text-[#b8f135]">Programme parrainage</p>
            <h2 className="font-display mt-3 text-4xl font-black md:text-5xl">Gagnez sur 3 niveaux, à vie.</h2>
            <p className="mt-4 text-white/60 leading-relaxed">Partagez votre lien unique. Dès qu&apos;un filleul investit, vous touchez une commission instantanée — et aussi sur ses propres filleuls, jusqu&apos;au 3ᵉ niveau.</p>
            <div className="mt-8 space-y-3">
              {[
                { n: "Niveau 1 — Directs", r: "10%", d: "Chaque personne que vous invitez directement", c: "text-[#b8f135]" },
                { n: "Niveau 2", r: "5%", d: "Les filleuls de vos filleuls", c: "text-emerald-300" },
                { n: "Niveau 3", r: "2%", d: "Le troisième niveau de votre réseau", c: "text-amber-300" },
              ].map((l) => (
                <div key={l.n} className="glass flex items-center gap-4 rounded-2xl p-4">
                  <span className={`font-display text-3xl font-black ${l.c}`}>{l.r}</span>
                  <div><div className="font-black">{l.n}</div><div className="text-sm text-white/55">{l.d}</div></div>
                </div>
              ))}
            </div>
            <a href={registerHref} className="btn-shine mt-8 inline-block rounded-2xl bg-[#b8f135] px-8 py-4 font-black text-[#060b08] hover:bg-[#c9ff4d] transition">
              Obtenir mon lien de parrainage →
            </a>
          </div>
          <div className="glass rounded-[28px] p-7">
            <div className="text-sm font-black uppercase tracking-widest text-white/50">Exemple concret 💡</div>
            <div className="mt-4 space-y-3 text-[15px]">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">Vous invitez <strong>Awa</strong> qui investit <strong className="text-[#b8f135]">200 000 F</strong> → vous gagnez <strong className="text-[#b8f135]">20 000 F</strong> (10%)</div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">Awa invite <strong>Moussa</strong> qui investit <strong className="text-emerald-300">200 000 F</strong> → vous gagnez <strong className="text-emerald-300">10 000 F</strong> (5%)</div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">Moussa invite <strong>Kadi</strong> qui investit <strong className="text-amber-300">200 000 F</strong> → vous gagnez <strong className="text-amber-300">4 000 F</strong> (2%)</div>
              <div className="rounded-2xl bg-[#b8f135]/10 border border-[#b8f135]/30 p-4 font-black text-center">Total : 34 000 FCFA sans investir un franc de plus 🎉</div>
            </div>
          </div>
        </div>
      </section>

      {/* Paiements 4 pays */}
      <section id="paiements" className="border-t border-white/5 bg-black/30 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <p className="text-center text-[12px] font-black uppercase tracking-[0.3em] text-[#b8f135]">Dépôts & retraits locaux</p>
          <h2 className="font-display mt-3 text-center text-4xl font-black md:text-5xl">4 pays, 13 opérateurs 📱</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-white/60">Déposez et retirez dans votre monnaie locale (FCFA), avec votre opérateur habituel. Crédit instantané, retrait en ~15 min.</p>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {PAYMENT_SHOWCASE.map((c) => (
              <div key={c.country} className="card-hover glass rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <span className="text-4xl">{c.flag}</span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/60">{c.dial}</span>
                </div>
                <h3 className="mt-3 text-xl font-black">{c.country}</h3>
                <div className="mt-4 space-y-2">
                  {c.ops.map((o) => (
                    <div key={o.n} className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-bold">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ background: o.c }} />
                      {o.n}
                    </div>
                  ))}
                </div>
                <a href={registerHref} className="mt-5 block rounded-2xl border border-white/12 bg-white/5 py-2.5 text-center text-[13px] font-black hover:bg-white/10 transition">
                  Déposer avec {c.ops[0].n} →
                </a>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-2 text-center text-[13px] font-bold text-white/55">
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-emerald-200">✅ Dépôt instantané</span>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-emerald-200">⚡ Retrait ~15 min</span>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-emerald-200">🔒 100% sécurisé</span>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-emerald-200">💳 Carte bancaire acceptée</span>
          </div>
        </div>
      </section>

      {/* Avis */}
      <section id="avis" className="mx-auto max-w-7xl px-5 py-20">
        <p className="text-center text-[12px] font-black uppercase tracking-[0.3em] text-[#b8f135]">Ils gagnent déjà</p>
        <h2 className="font-display mt-3 text-center text-4xl font-black">+12 800 avis vérifiés ⭐ 4,9/5</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="card-hover glass rounded-3xl p-7">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#b8f135] to-emerald-500 font-black text-[#060b08]">{t.initial}</span>
                <div><div className="font-black">{t.name}</div><div className="text-xs text-white/50">{t.city} • Membre vérifié ✓</div></div>
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-white/70">&ldquo;{t.text}&rdquo;</p>
              <div className="mt-4 inline-block rounded-full bg-[#b8f135]/12 border border-[#b8f135]/25 px-4 py-1.5 text-sm font-black text-[#b8f135]">{t.gain}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-4xl px-5 pb-20">
        <h2 className="font-display text-center text-4xl font-black">Questions fréquentes</h2>
        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => (
            <div key={i} className={`glass rounded-2xl overflow-hidden transition ${openFaq === i ? "border-[#b8f135]/40" : ""}`}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-bold">
                {f.q}
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition ${openFaq === i ? "bg-[#b8f135] text-black rotate-45" : "bg-white/10"}`}>+</span>
              </button>
              {openFaq === i && <p className="px-6 pb-6 text-[15px] leading-relaxed text-white/65">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#b8f135] via-[#9fe870] to-emerald-500 p-10 text-center text-[#060b08] md:p-16">
          <div className="grid-bg absolute inset-0 opacity-40" />
          <div className="relative">
            <div className="text-6xl">⚡</div>
            <h2 className="font-display mx-auto mt-4 max-w-2xl text-4xl font-black md:text-6xl">Vos gains de demain commencent aujourd&apos;hui.</h2>
            <p className="mx-auto mt-4 max-w-xl font-semibold opacity-75">Inscription gratuite en 30 secondes • Bonus 1 000 FCFA immédiat • Premier gain sous 24 h.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={registerHref} className="rounded-2xl bg-[#060b08] px-10 py-4 font-black text-white hover:bg-black transition text-lg">
                Créer mon compte gratuit →
              </a>
            </div>
            <p className="mt-4 text-[13px] font-bold opacity-60">🔒 Données protégées • Support 7j/7 sur WhatsApp • Paiements sécurisés</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/50 px-5 py-12">
        <div className="mx-auto max-w-7xl grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#b8f135] text-xl font-black text-[#060b08]">⚡</span>
              <span className="text-lg font-black">WALLBOX</span>
            </div>
            <p className="mt-4 text-sm text-white/50 leading-relaxed">La plateforme énergie-revenus qui fait travailler votre argent, avec des retraits Mobile Money ultra-rapides.</p>
          </div>
          <div>
            <div className="text-sm font-black uppercase tracking-widest text-white/40">Plateforme</div>
            <div className="mt-4 space-y-2.5 text-sm text-white/65">
              <a href="#plans" className="block hover:text-white">Plans d&apos;investissement</a>
              <a href="#parrainage" className="block hover:text-white">Programme parrainage</a>
              <a href="/register" className="block hover:text-white">Créer un compte</a>
              <a href="/login" className="block hover:text-white">Se connecter</a>
            </div>
          </div>
          <div>
            <div className="text-sm font-black uppercase tracking-widest text-white/40">Aide</div>
            <div className="mt-4 space-y-2.5 text-sm text-white/65">
              <a href="#faq" className="block hover:text-white">Questions fréquentes</a>
              <a href="#avis" className="block hover:text-white">Avis membres</a>
              <a href="#simulateur" className="block hover:text-white">Simulateur</a>
            </div>
          </div>
          <div>
            <div className="text-sm font-black uppercase tracking-widest text-white/40">Paiements • 4 pays</div>
            <div className="mt-4 space-y-2 text-xs font-bold text-white/60">
              <div>🇹🇬 Togo : TMoney, Moov Money</div>
              <div>🇧🇯 Bénin : MTN MoMo, Moov, Celtiis</div>
              <div>🇨🇮 Côte d&apos;Ivoire : Wave, Orange, MTN, Moov</div>
              <div>🇸🇳 Sénégal : Wave, Orange, Free, E-Money</div>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">💳 Carte bancaire</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Visa • Mastercard</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-xs text-white/35">
          © 2026 WALLBOX Energy Earnings — Tous droits réservés. Les investissements comportent des risques : n&apos;investissez que ce que vous pouvez vous permettre.
        </div>
      </footer>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060b08]" />}>
      <LandingInner />
    </Suspense>
  );
}
