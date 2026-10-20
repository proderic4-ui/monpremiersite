"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatFCFA, timeAgo } from "@/lib/utils";
import {
  PAYMENT_COUNTRIES,
  PAYMENT_OPERATORS,
  operatorsByCountry,
  type PaymentCountryCode,
} from "@/lib/payments";

type Plan = {
  id: number;
  name: string;
  tagline: string;
  minAmount: number;
  maxAmount: number;
  dailyRate: number;
  durationDays: number;
  badge: string | null;
};

type Investment = {
  id: string;
  amount: number;
  dailyProfit: number;
  daysClaimed: number;
  totalClaimed: number;
  status: string;
  startDate: string;
  plan: Plan | null;
  readyDays: number;
  readyAmount: number;
  progress: number;
};

type Tx = {
  id: string;
  type: string;
  amount: number;
  status: string;
  method: string | null;
  label: string;
  createdAt: string;
};

const TABS = [
  { id: "apercu", label: "🏠 Aperçu" },
  { id: "investir", label: "⚡ Investir" },
  { id: "investissements", label: "📊 Mes investissements" },
  { id: "portefeuille", label: "💳 Portefeuille" },
  { id: "parrainage", label: "👥 Parrainage" },
];

const QUICK_AMOUNTS = [10000, 30000, 50000, 100000, 500000];

function txIcon(type: string) {
  switch (type) {
    case "deposit": return "💰";
    case "withdrawal": return "💸";
    case "investment": return "⚡";
    case "earning": return "📈";
    case "referral": return "🎁";
    case "bonus": return "✨";
    default: return "•";
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tab, setTab] = useState("apercu");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // forms — paiements multi-pays TG / BJ / CI / SN
  const [depAmount, setDepAmount] = useState("50000");
  const [depCountry, setDepCountry] = useState<PaymentCountryCode>("CI");
  const [depMethod, setDepMethod] = useState("wave-ci");
  const [wdAmount, setWdAmount] = useState("10000");
  const [wdCountry, setWdCountry] = useState<PaymentCountryCode>("CI");
  const [wdMethod, setWdMethod] = useState("wave-ci");
  const [wdAccount, setWdAccount] = useState("");
  const [invAmounts, setInvAmounts] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [d, p] = await Promise.all([
        fetch("/api/dashboard").then((r) => r.json()),
        fetch("/api/plans").then((r) => r.json()),
      ]);
      if (d.error) {
        router.push("/login");
        return;
      }
      setData(d);
      setPlans(p.plans || []);
    } catch {
      setMsg({ ok: false, text: "Erreur de chargement, réessayez." });
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  function flash(ok: boolean, text: string) {
    setMsg({ ok, text });
    setTimeout(() => setMsg(null), 5000);
  }

  const depOperators = useMemo(() => operatorsByCountry(depCountry), [depCountry]);
  const wdOperators = useMemo(() => operatorsByCountry(wdCountry), [wdCountry]);
  const depOp = useMemo(
    () => PAYMENT_OPERATORS.find((o) => o.id === depMethod) || depOperators[0],
    [depMethod, depOperators]
  );
  const wdOp = useMemo(
    () => PAYMENT_OPERATORS.find((o) => o.id === wdMethod) || wdOperators[0],
    [wdMethod, wdOperators]
  );

  function pickDepCountry(c: PaymentCountryCode) {
    setDepCountry(c);
    const list = operatorsByCountry(c);
    if (list.length > 0) setDepMethod(list[0].id);
  }
  function pickWdCountry(c: PaymentCountryCode) {
    setWdCountry(c);
    const list = operatorsByCountry(c);
    if (list.length > 0) setWdMethod(list[0].id);
  }

  async function doDeposit() {
    setBusy("dep");
    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(depAmount), method: depMethod, countryCode: depCountry }),
      });
      const j = await res.json();
      if (!res.ok) flash(false, j.error);
      else {
        flash(true, `✅ Dépôt de ${formatFCFA(Number(depAmount))} crédité via ${depOp?.name || depMethod} !`);
        load();
      }
    } catch {
      flash(false, "Erreur réseau.");
    } finally {
      setBusy(null);
    }
  }

  async function doWithdraw() {
    setBusy("wd");
    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(wdAmount), method: wdMethod, account: wdAccount, countryCode: wdCountry }),
      });
      const j = await res.json();
      if (!res.ok) flash(false, j.error);
      else {
        flash(true, `✅ Retrait de ${formatFCFA(j.net)} initié vers ${wdAccount} — reçu sous ~15 min.`);
        setWdAccount("");
        load();
      }
    } catch {
      flash(false, "Erreur réseau.");
    } finally {
      setBusy(null);
    }
  }

  async function doInvest(plan: Plan) {
    const raw = invAmounts[plan.id] || String(plan.minAmount);
    setBusy(`inv-${plan.id}`);
    try {
      const res = await fetch("/api/invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, amount: Number(raw) }),
      });
      const j = await res.json();
      if (!res.ok) flash(false, j.error);
      else {
        flash(true, `⚡ Investissement ${formatFCFA(Number(raw))} activé sur ${plan.name} (+${formatFCFA(j.dailyProfit)}/jour) !`);
        setTab("investissements");
        load();
      }
    } catch {
      flash(false, "Erreur réseau.");
    } finally {
      setBusy(null);
    }
  }

  async function doClaim(id: string) {
    setBusy(`claim-${id}`);
    try {
      const res = await fetch("/api/invest/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investmentId: id }),
      });
      const j = await res.json();
      if (!res.ok) flash(false, j.error);
      else {
        flash(true, j.finished
          ? `🎉 ${formatFCFA(j.gain)} réclamés + capital ${formatFCFA(j.capitalReturned)} restitué !`
          : `📈 ${formatFCFA(j.gain)} réclamés (${j.claimDays} jour(s)) !`);
        load();
      }
    } catch {
      flash(false, "Erreur réseau.");
    } finally {
      setBusy(null);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  const referralLink = useMemo(() => {
    if (typeof window === "undefined" || !data?.user?.referralCode) return "";
    return `${window.location.origin}/register?ref=${data.user.referralCode}`;
  }, [data]);

  function copyLink() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(
      () => flash(true, "🔗 Lien de parrainage copié ! Partagez-le partout."),
      () => flash(false, "Copie impossible, copiez manuellement.")
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060b08] grid place-items-center text-white">
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#b8f135] text-3xl font-black text-black animate-pulse">⚡</div>
          <p className="mt-4 font-bold text-white/60">Chargement de votre espace…</p>
        </div>
      </div>
    );
  }

  const s = data?.stats;
  const user = data?.user;
  const investments: Investment[] = data?.investments || [];
  const txs: Tx[] = data?.transactions || [];

  return (
    <div className="min-h-screen bg-[#060b08] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#060b08]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <a href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#b8f135] text-lg font-black text-[#060b08]">⚡</span>
            <span className="font-black tracking-tight">WALLBOX</span>
          </a>
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:block rounded-full border border-[#b8f135]/30 bg-[#b8f135]/10 px-4 py-1.5 text-sm font-black text-[#b8f135]">
              {formatFCFA(user?.balance || 0)}
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#b8f135] to-emerald-500 font-black text-[#060b08] text-sm">
              {(user?.name || "M")[0].toUpperCase()}
            </div>
            <button onClick={logout} className="rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-bold text-white/70 hover:bg-white/10 transition">
              Déconnexion
            </button>
          </div>
        </div>
        {/* tabs */}
        <div className="mx-auto max-w-7xl px-4 pb-3">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-bold transition ${tab === t.id ? "bg-[#b8f135] text-[#060b08]" : "border border-white/12 bg-white/5 text-white/65 hover:bg-white/10"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {msg && (
        <div className="mx-auto max-w-7xl px-4 pt-4">
          <div className={`rounded-2xl border px-4 py-3 text-sm font-bold ${msg.ok ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-red-400/30 bg-red-500/10 text-red-200"}`}>
            {msg.text}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 pb-20">
        {tab === "apercu" && (
          <div className="space-y-5">
            <div className="rounded-[28px] bg-gradient-to-br from-[#b8f135] to-emerald-500 p-6 md:p-8 text-[#060b08]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Solde disponible • {user?.name}</div>
                  <div className="font-display text-4xl md:text-5xl font-black">{formatFCFA(s?.balance || 0)}</div>
                  <div className="mt-1 text-sm font-bold opacity-75">
                    🎁 Gains réclamables : {formatFCFA(s?.claimable || 0)} • Équipe : {s?.team?.total || 0} filleuls
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setTab("portefeuille")} className="rounded-2xl bg-[#060b08] px-5 py-3 text-sm font-black text-white hover:bg-black transition">+ Dépôt</button>
                  <button onClick={() => setTab("investir")} className="rounded-2xl border-2 border-[#060b08]/20 px-5 py-3 text-sm font-black hover:bg-[#060b08]/10 transition">⚡ Investir</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { l: "Investi actif", v: formatFCFA(s?.activeInvested || 0), e: "⚡" },
                { l: "Gains réclamables", v: formatFCFA(s?.claimable || 0), e: "📈" },
                { l: "Total gagné", v: formatFCFA(s?.totalEarned || 0), e: "💰" },
                { l: "Gains parrainage", v: formatFCFA(s?.referralEarnings || 0), e: "🎁" },
              ].map((k) => (
                <div key={k.l} className="glass rounded-3xl p-5">
                  <div className="text-2xl">{k.e}</div>
                  <div className="mt-2 text-lg md:text-xl font-black">{k.v}</div>
                  <div className="text-xs font-semibold text-white/50">{k.l}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="glass rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-lg">⚡ Investissements actifs</h3>
                  <button onClick={() => setTab("investissements")} className="text-xs font-bold text-[#b8f135] hover:underline">Tout voir →</button>
                </div>
                <div className="mt-4 space-y-3">
                  {investments.filter((i) => i.status === "active").slice(0, 3).map((inv) => (
                    <div key={inv.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex justify-between text-sm font-bold">
                        <span>{inv.plan?.name} • {formatFCFA(inv.amount)}</span>
                        <span className="text-[#b8f135]">+{formatFCFA(inv.dailyProfit)}/j</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#b8f135] to-emerald-400" style={{ width: `${inv.progress}%` }} />
                      </div>
                      <div className="mt-2 flex justify-between items-center text-xs">
                        <span className="text-white/50">Jour {inv.daysClaimed}/{inv.plan?.durationDays}</span>
                        {inv.readyAmount > 0 ? (
                          <button onClick={() => doClaim(inv.id)} disabled={busy === `claim-${inv.id}`} className="rounded-full bg-[#b8f135] px-3.5 py-1.5 font-black text-[#060b08] text-xs hover:bg-[#c9ff4d] disabled:opacity-50">
                            Réclamer {formatFCFA(inv.readyAmount)}
                          </button>
                        ) : (
                          <span className="text-white/40 font-semibold">Prochain gain dans ~24h</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {investments.filter((i) => i.status === "active").length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-white/50">
                      Aucun investissement actif.{" "}
                      <button onClick={() => setTab("investir")} className="font-bold text-[#b8f135]">Lancez votre premier plan →</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-lg">🕘 Activité récente</h3>
                  <button onClick={() => setTab("portefeuille")} className="text-xs font-bold text-[#b8f135] hover:underline">Historique →</button>
                </div>
                <div className="mt-4 space-y-2.5">
                  {txs.slice(0, 6).map((t) => (
                    <div key={t.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.04] border border-white/5 px-4 py-3">
                      <span className="text-xl">{txIcon(t.type)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-semibold text-white/85">{t.label}</div>
                        <div className="text-[11px] text-white/40">{timeAgo(t.createdAt)}</div>
                      </div>
                      <span className={`text-sm font-black shrink-0 ${t.amount >= 0 ? "text-emerald-300" : "text-white/70"}`}>
                        {t.amount >= 0 ? "+" : ""}{t.amount.toLocaleString("fr-FR")} F
                      </span>
                    </div>
                  ))}
                  {txs.length === 0 && <p className="text-sm text-white/40">Aucune transaction pour le moment.</p>}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#b8f135]/25 bg-[#b8f135]/[0.07] p-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div>
                <div className="font-black text-lg">👥 Votre lien de parrainage rapporte 10% / 5% / 2%</div>
                <div className="mt-1 truncate text-sm text-[#d7ff7a] font-mono bg-black/30 rounded-xl px-3 py-2">{referralLink}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={copyLink} className="rounded-2xl bg-[#b8f135] px-5 py-3 text-sm font-black text-[#060b08] hover:bg-[#c9ff4d]">📋 Copier</button>
                <button onClick={() => setTab("parrainage")} className="rounded-2xl border border-white/15 px-5 py-3 text-sm font-bold hover:bg-white/10">Détails →</button>
              </div>
            </div>
          </div>
        )}

        {tab === "investir" && (
          <div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 flex flex-wrap justify-between items-center gap-3">
              <div>
                <h2 className="font-black text-xl">⚡ Activer un plan</h2>
                <p className="text-sm text-white/55">Solde disponible : <strong className="text-[#b8f135]">{formatFCFA(user?.balance || 0)}</strong> — capital restitué à 100% en fin de cycle.</p>
              </div>
              <button onClick={() => setTab("portefeuille")} className="rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/15">+ Recharger mon solde</button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {plans.map((p) => (
                <div key={p.id} className="glass rounded-3xl p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-full bg-[#b8f135]/15 border border-[#b8f135]/30 px-3 py-1 text-[11px] font-black uppercase text-[#b8f135]">{p.badge}</span>
                      <h3 className="mt-2.5 text-2xl font-black">{p.name}</h3>
                      <p className="text-sm text-white/50">{p.tagline}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-4xl font-black text-[#b8f135]">{p.dailyRate}%</div>
                      <div className="text-xs font-bold text-white/50">par jour • {p.durationDays} j</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[13px]">
                    <div className="rounded-xl bg-white/5 border border-white/10 py-2.5"><div className="font-black">{p.minAmount.toLocaleString("fr-FR")}</div><div className="text-[11px] text-white/45">Min (F)</div></div>
                    <div className="rounded-xl bg-white/5 border border-white/10 py-2.5"><div className="font-black">{p.maxAmount >= 1000000 ? (p.maxAmount / 1000000) + " M" : p.maxAmount.toLocaleString("fr-FR")}</div><div className="text-[11px] text-white/45">Max (F)</div></div>
                    <div className="rounded-xl bg-[#b8f135]/10 border border-[#b8f135]/25 py-2.5"><div className="font-black text-[#b8f135]">+{p.dailyRate * p.durationDays}%</div><div className="text-[11px] text-white/45">Total</div></div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <input
                      type="number"
                      min={p.minAmount}
                      max={p.maxAmount}
                      value={invAmounts[p.id] ?? String(p.minAmount)}
                      onChange={(e) => setInvAmounts({ ...invAmounts, [p.id]: e.target.value })}
                      className="w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm font-bold outline-none focus:border-[#b8f135]/60"
                      placeholder={`Montant (${p.minAmount} – ${p.maxAmount})`}
                    />
                    <button
                      onClick={() => doInvest(p)}
                      disabled={busy === `inv-${p.id}`}
                      className="shrink-0 rounded-2xl bg-[#b8f135] px-5 py-3 text-sm font-black text-[#060b08] hover:bg-[#c9ff4d] disabled:opacity-50"
                    >
                      {busy === `inv-${p.id}` ? "…" : "Investir →"}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-white/40">
                    Gain estimé : {formatFCFA(Math.floor((Number(invAmounts[p.id] || p.minAmount) * p.dailyRate) / 100))}/jour • Total {formatFCFA(Math.floor((Number(invAmounts[p.id] || p.minAmount) * p.dailyRate) / 100) * p.durationDays)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "investissements" && (
          <div className="space-y-4">
            <h2 className="font-black text-xl">📊 Mes investissements ({investments.length})</h2>
            {investments.map((inv) => (
              <div key={inv.id} className="glass rounded-3xl p-5 md:p-6">
                <div className="flex flex-wrap justify-between gap-3 items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black">{inv.plan?.name || "Plan"}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-black ${inv.status === "active" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30" : "bg-white/10 text-white/60 border border-white/15"}`}>
                        {inv.status === "active" ? "● ACTIF" : "✓ TERMINÉ"}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-white/55">
                      Investi {formatFCFA(inv.amount)} • +{formatFCFA(inv.dailyProfit)}/jour • Jour {inv.daysClaimed}/{inv.plan?.durationDays} • Déjà touché {formatFCFA(inv.totalClaimed)}
                    </div>
                  </div>
                  {inv.status === "active" && inv.readyAmount > 0 && (
                    <button onClick={() => doClaim(inv.id)} disabled={busy === `claim-${inv.id}`} className="rounded-2xl bg-[#b8f135] px-5 py-3 text-sm font-black text-[#060b08] hover:bg-[#c9ff4d] disabled:opacity-50">
                      {busy === `claim-${inv.id}` ? "…" : `Réclamer ${formatFCFA(inv.readyAmount)} 🎉`}
                    </button>
                  )}
                </div>
                <div className="mt-3 h-2.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#b8f135] to-emerald-400 transition-all" style={{ width: `${inv.progress}%` }} />
                </div>
                <div className="mt-2 text-xs text-white/40">Démarré le {new Date(inv.startDate).toLocaleDateString("fr-FR")} {inv.status === "active" && inv.readyAmount <= 0 ? "• Prochain gain disponible sous ~24h" : ""}</div>
              </div>
            ))}
            {investments.length === 0 && (
              <div className="glass rounded-3xl p-10 text-center">
                <div className="text-5xl">⚡</div>
                <p className="mt-3 font-bold">Aucun investissement pour le moment.</p>
                <button onClick={() => setTab("investir")} className="mt-4 rounded-2xl bg-[#b8f135] px-6 py-3 text-sm font-black text-[#060b08]">Voir les plans →</button>
              </div>
            )}
          </div>
        )}

        {tab === "portefeuille" && (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-5">
              <div className="glass rounded-3xl p-6">
                <h3 className="font-black text-lg">💰 Dépôt instantané</h3>
                <p className="text-sm text-white/50">Crédité immédiatement. Min 5 000 FCFA • 4 pays supportés 🇹🇬 🇧🇯 🇨🇮 🇸🇳</p>
                <label className="mt-4 block text-xs font-bold text-white/60">1️⃣ CHOISISSEZ VOTRE PAYS</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {PAYMENT_COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => pickDepCountry(c.code)}
                      className={`rounded-2xl border px-3 py-2.5 text-[13px] font-black transition flex items-center gap-2 justify-center ${depCountry === c.code ? "border-[#b8f135] bg-[#b8f135]/15 text-[#d7ff7a]" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"}`}
                    >
                      <span className="text-lg">{c.flag}</span> {c.name}
                    </button>
                  ))}
                </div>
                <label className="mt-4 block text-xs font-bold text-white/60">2️⃣ OPÉRATEUR — {PAYMENT_COUNTRIES.find((c) => c.code === depCountry)?.dialCode}</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {depOperators.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setDepMethod(o.id)}
                      className={`rounded-2xl border p-3 text-left transition ${depMethod === o.id ? "border-[#b8f135] bg-[#b8f135]/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ background: o.color }} />
                        <span className="text-[13px] font-black">{o.short}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-white/45">{o.prefixHint}</div>
                    </button>
                  ))}
                </div>
                {depOp && (
                  <div className="mt-2.5 rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-xs text-white/55">
                    💡 <strong className="text-white">{depOp.name}</strong> — composez votre dépôt vers le marchand WALLBOX puis validez ici. Format : {depOp.placeholder} ({depOp.prefixHint})
                  </div>
                )}
                <label className="mt-4 block text-xs font-bold text-white/60">3️⃣ MONTANT (FCFA)</label>
                <input type="number" value={depAmount} onChange={(e) => setDepAmount(e.target.value)} className="mt-1.5 w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3.5 font-black text-lg outline-none focus:border-[#b8f135]/60" />
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {QUICK_AMOUNTS.map((a) => (
                    <button key={a} onClick={() => setDepAmount(String(a))} className="rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-xs font-bold hover:bg-white/10">{a.toLocaleString("fr-FR")}</button>
                  ))}
                </div>
                <button onClick={doDeposit} disabled={busy === "dep"} className="btn-shine mt-5 w-full rounded-2xl bg-[#b8f135] py-4 font-black text-[#060b08] hover:bg-[#c9ff4d] disabled:opacity-50">
                  {busy === "dep" ? "Traitement…" : `Déposer ${formatFCFA(Number(depAmount) || 0)} via ${depOp?.short || ""} →`}
                </button>
              </div>

              <div className="glass rounded-3xl p-6">
                <h3 className="font-black text-lg">💸 Retrait rapide (~15 min)</h3>
                <p className="text-sm text-white/50">Min 3 000 FCFA • Frais 3% • Solde : <strong className="text-white">{formatFCFA(user?.balance || 0)}</strong></p>
                <label className="mt-4 block text-xs font-bold text-white/60">1️⃣ PAYS DE RÉCEPTION</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {PAYMENT_COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => pickWdCountry(c.code)}
                      className={`rounded-2xl border px-3 py-2.5 text-[13px] font-black transition flex items-center gap-2 justify-center ${wdCountry === c.code ? "border-[#b8f135] bg-[#b8f135]/15 text-[#d7ff7a]" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"}`}
                    >
                      <span className="text-lg">{c.flag}</span> {c.name}
                    </button>
                  ))}
                </div>
                <label className="mt-4 block text-xs font-bold text-white/60">2️⃣ OPÉRATEUR</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {wdOperators.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setWdMethod(o.id)}
                      className={`rounded-2xl border p-3 text-left transition ${wdMethod === o.id ? "border-[#b8f135] bg-[#b8f135]/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ background: o.color }} />
                        <span className="text-[13px] font-black">{o.short}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-white/45">{o.prefixHint}</div>
                    </button>
                  ))}
                </div>
                <label className="mt-4 block text-xs font-bold text-white/60">3️⃣ NUMÉRO DE RÉCEPTION ({PAYMENT_COUNTRIES.find((c) => c.code === wdCountry)?.dialCode} {wdOp ? `• ${wdOp.prefixHint}` : ""})</label>
                <input value={wdAccount} onChange={(e) => setWdAccount(e.target.value)} placeholder={wdOp?.placeholder || "Votre numéro"} className="mt-1.5 w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3.5 text-[15px] outline-none placeholder:text-white/30 focus:border-[#b8f135]/60" />
                <label className="mt-4 block text-xs font-bold text-white/60">4️⃣ MONTANT (FCFA)</label>
                <input type="number" value={wdAmount} onChange={(e) => setWdAmount(e.target.value)} className="mt-1.5 w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3.5 font-black text-lg outline-none focus:border-[#b8f135]/60" />
                <button onClick={doWithdraw} disabled={busy === "wd"} className="mt-5 w-full rounded-2xl border border-[#b8f135]/50 bg-[#b8f135]/10 py-4 font-black text-[#b8f135] hover:bg-[#b8f135]/20 disabled:opacity-50">
                  {busy === "wd" ? "Traitement…" : `Retirer vers ${wdOp?.short || ""} →`}
                </button>
              </div>
            </div>

            <div className="glass rounded-3xl p-6 h-fit">
              <h3 className="font-black text-lg">🕘 Historique des transactions</h3>
              <div className="mt-4 space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
                {txs.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.04] border border-white/5 px-4 py-3">
                    <span className="text-xl">{txIcon(t.type)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-white/85 leading-snug">{t.label}</div>
                      <div className="text-[11px] text-white/40">{timeAgo(t.createdAt)}{t.method ? ` • ${t.method}` : ""}</div>
                    </div>
                    <span className={`text-sm font-black shrink-0 ${t.amount >= 0 ? "text-emerald-300" : "text-white/60"}`}>
                      {t.amount >= 0 ? "+" : ""}{t.amount.toLocaleString("fr-FR")}
                    </span>
                  </div>
                ))}
                {txs.length === 0 && <p className="text-sm text-white/40">Aucune transaction.</p>}
              </div>
            </div>
          </div>
        )}

        {tab === "parrainage" && (
          <div className="space-y-5">
            <div className="rounded-[28px] bg-gradient-to-br from-[#b8f135] to-emerald-500 p-6 md:p-8 text-[#060b08]">
              <div className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Votre lien unique — commissions 10% / 5% / 2%</div>
              <div className="mt-2 break-all rounded-2xl bg-black/80 px-4 py-3 font-mono text-sm font-bold text-[#b8f135]">{referralLink}</div>
              <div className="mt-2 text-sm font-bold opacity-75">Code : <span className="uppercase">{user?.referralCode}</span> • Partagez sur WhatsApp, Telegram, TikTok, Facebook</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={copyLink} className="rounded-2xl bg-[#060b08] px-6 py-3 text-sm font-black text-white hover:bg-black">📋 Copier le lien</button>
                <a href={`https://wa.me/?text=${encodeURIComponent("Gagne jusqu'à 15% par jour avec WALLBOX ⚡ Inscris-toi avec mon lien : " + referralLink)}`} target="_blank" className="rounded-2xl border-2 border-[#060b08]/25 px-6 py-3 text-sm font-black hover:bg-[#060b08]/10">Partager sur WhatsApp →</a>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { l: "Niveau 1 (10%)", v: s?.team?.l1 || 0 },
                { l: "Niveau 2 (5%)", v: s?.team?.l2 || 0 },
                { l: "Niveau 3 (2%)", v: s?.team?.l3 || 0 },
                { l: "Gains parrainage", v: formatFCFA(s?.referralEarnings || 0) },
              ].map((k) => (
                <div key={k.l} className="glass rounded-3xl p-5 text-center">
                  <div className="text-2xl font-black text-[#b8f135]">{k.v}</div>
                  <div className="mt-1 text-xs font-bold text-white/50">{k.l}</div>
                </div>
              ))}
            </div>

            <div className="glass rounded-3xl p-6">
              <h3 className="font-black text-lg">👥 Mes filleuls directs ({data?.filleuls?.length || 0})</h3>
              <div className="mt-4 space-y-2.5">
                {(data?.filleuls || []).map((f: any) => (
                  <div key={f.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.04] border border-white/5 px-4 py-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#b8f135] to-emerald-500 font-black text-[#060b08] text-sm">{(f.name || "?")[0].toUpperCase()}</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold">{f.name}</div>
                      <div className="text-[11px] text-white/40">Inscrit {timeAgo(f.createdAt)}</div>
                    </div>
                    <span className="text-xs font-bold text-white/60">{formatFCFA(f.investedCapital || 0)} investis</span>
                  </div>
                ))}
                {(data?.filleuls || []).length === 0 && (
                  <p className="text-sm text-white/45">Aucun filleul pour le moment — copiez votre lien ci-dessus et partagez-le pour commencer à gagner 10% sur chaque investissement ! 🚀</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
