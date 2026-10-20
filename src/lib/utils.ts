export function formatFCFA(n: number): string {
  const v = Math.round(Number(n) || 0);
  return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".", ",") + " M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(".", ",") + " k";
  return String(n);
}

export function timeAgo(date: string | Date): string {
  const d = new Date(date).getTime();
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days} j`;
  return new Date(date).toLocaleDateString("fr-FR");
}

export const REF_RATES = [0.1, 0.05, 0.02];

export const SEED_PLANS = [
  {
    name: "Starter Volt",
    tagline: "Idéal pour découvrir la plateforme",
    minAmount: 5000,
    maxAmount: 29000,
    dailyRate: 8,
    durationDays: 7,
    badge: "Débutant",
    color: "emerald",
    sort: 1,
  },
  {
    name: "Pro Watt",
    tagline: "Le plus choisi par la communauté",
    minAmount: 30000,
    maxAmount: 99000,
    dailyRate: 10,
    durationDays: 10,
    badge: "Populaire",
    color: "lime",
    sort: 2,
  },
  {
    name: "Premium Grid",
    tagline: "Rendement accéléré haute tension",
    minAmount: 100000,
    maxAmount: 499000,
    dailyRate: 12,
    durationDays: 15,
    badge: "Boosté",
    color: "amber",
    sort: 3,
  },
  {
    name: "Elite Supernova",
    tagline: "Réservé aux grands investisseurs",
    minAmount: 500000,
    maxAmount: 5000000,
    dailyRate: 15,
    durationDays: 20,
    badge: "Elite",
    color: "violet",
    sort: 4,
  },
];
