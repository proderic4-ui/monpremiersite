export type PaymentCountryCode = "TG" | "BJ" | "CI" | "SN";

export interface PaymentOperator {
  id: string;
  name: string;
  short: string;
  countryCode: PaymentCountryCode;
  country: string;
  color: string;
  textColor: string;
  placeholder: string;
  prefixHint: string;
}

export interface PaymentCountry {
  code: PaymentCountryCode;
  name: string;
  flag: string;
  dialCode: string;
  currency: string;
  currencyLabel: string;
}

export const PAYMENT_COUNTRIES: PaymentCountry[] = [
  { code: "TG", name: "Togo", flag: "🇹🇬", dialCode: "+228", currency: "XOF", currencyLabel: "FCFA" },
  { code: "BJ", name: "Bénin", flag: "🇧🇯", dialCode: "+229", currency: "XOF", currencyLabel: "FCFA" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", dialCode: "+225", currency: "XOF", currencyLabel: "FCFA" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳", dialCode: "+221", currency: "XOF", currencyLabel: "FCFA" },
];

export const PAYMENT_OPERATORS: PaymentOperator[] = [
  // ===== TOGO 🇹🇬 =====
  {
    id: "tmoney-tg",
    name: "TMoney Togo",
    short: "TMoney",
    countryCode: "TG",
    country: "Togo",
    color: "#E30613",
    textColor: "#ffffff",
    placeholder: "Ex : 90 12 34 56",
    prefixHint: "90 / 91 / 92 / 93 • 8 chiffres",
  },
  {
    id: "moov-tg",
    name: "Moov Money Togo",
    short: "Moov Money",
    countryCode: "TG",
    country: "Togo",
    color: "#0057A8",
    textColor: "#ffffff",
    placeholder: "Ex : 79 12 34 56",
    prefixHint: "79 / 78 / 77 • 8 chiffres",
  },
  // ===== BENIN 🇧🇯 =====
  {
    id: "mtn-bj",
    name: "MTN MoMo Bénin",
    short: "MTN MoMo",
    countryCode: "BJ",
    country: "Bénin",
    color: "#FFCC00",
    textColor: "#060b08",
    placeholder: "Ex : 96 12 34 56",
    prefixHint: "96 / 97 / 95 / 40 • 8 chiffres",
  },
  {
    id: "moov-bj",
    name: "Moov Money Bénin",
    short: "Moov Money",
    countryCode: "BJ",
    country: "Bénin",
    color: "#0066CC",
    textColor: "#ffffff",
    placeholder: "Ex : 94 12 34 56",
    prefixHint: "94 / 95 / 45 • 8 chiffres",
  },
  {
    id: "celtiis-bj",
    name: "Celtiis Cash",
    short: "Celtiis Cash",
    countryCode: "BJ",
    country: "Bénin",
    color: "#6D28D9",
    textColor: "#ffffff",
    placeholder: "Ex : 41 12 34 56",
    prefixHint: "41 / 42 • 8 chiffres",
  },
  // ===== COTE D'IVOIRE 🇨🇮 =====
  {
    id: "wave-ci",
    name: "Wave Côte d'Ivoire",
    short: "Wave",
    countryCode: "CI",
    country: "Côte d'Ivoire",
    color: "#1DC8FF",
    textColor: "#060b08",
    placeholder: "Ex : 07 07 07 07 07",
    prefixHint: "07 / 05 / 01 • 10 chiffres",
  },
  {
    id: "orange-ci",
    name: "Orange Money CI",
    short: "Orange Money",
    countryCode: "CI",
    country: "Côte d'Ivoire",
    color: "#FF7900",
    textColor: "#ffffff",
    placeholder: "Ex : 07 08 09 10 11",
    prefixHint: "07 / 08 / 09 • 10 chiffres",
  },
  {
    id: "mtn-ci",
    name: "MTN MoMo CI",
    short: "MTN MoMo",
    countryCode: "CI",
    country: "Côte d'Ivoire",
    color: "#FFCC00",
    textColor: "#060b08",
    placeholder: "Ex : 05 05 05 05 05",
    prefixHint: "05 / 06 • 10 chiffres",
  },
  {
    id: "moov-ci",
    name: "Moov Money CI",
    short: "Moov Money",
    countryCode: "CI",
    country: "Côte d'Ivoire",
    color: "#0057A8",
    textColor: "#ffffff",
    placeholder: "Ex : 01 01 01 01 01",
    prefixHint: "01 / 02 / 03 • 10 chiffres",
  },
  // ===== SENEGAL 🇸🇳 =====
  {
    id: "wave-sn",
    name: "Wave Sénégal",
    short: "Wave",
    countryCode: "SN",
    country: "Sénégal",
    color: "#1DC8FF",
    textColor: "#060b08",
    placeholder: "Ex : 77 123 45 67",
    prefixHint: "77 / 76 / 75 / 78 • 9 chiffres",
  },
  {
    id: "orange-sn",
    name: "Orange Money SN",
    short: "Orange Money",
    countryCode: "SN",
    country: "Sénégal",
    color: "#FF7900",
    textColor: "#ffffff",
    placeholder: "Ex : 77 123 45 67",
    prefixHint: "77 / 78 • 9 chiffres",
  },
  {
    id: "free-sn",
    name: "Free Money",
    short: "Free Money",
    countryCode: "SN",
    country: "Sénégal",
    color: "#E30613",
    textColor: "#ffffff",
    placeholder: "Ex : 76 123 45 67",
    prefixHint: "76 • 9 chiffres",
  },
  {
    id: "wizall-sn",
    name: "E-Money / Wizall",
    short: "E-Money",
    countryCode: "SN",
    country: "Sénégal",
    color: "#10B981",
    textColor: "#ffffff",
    placeholder: "Ex : 75 123 45 67",
    prefixHint: "75 / 70 • 9 chiffres",
  },
];

export const CARD_METHOD = {
  id: "card",
  name: "Carte bancaire",
  short: "Carte bancaire",
  color: "#1e293b",
  textColor: "#ffffff",
} as const;

export function operatorsByCountry(code: PaymentCountryCode): PaymentOperator[] {
  return PAYMENT_OPERATORS.filter((o) => o.countryCode === code);
}

export function findOperator(idOrName: string): PaymentOperator | undefined {
  const v = (idOrName || "").trim().toLowerCase();
  return PAYMENT_OPERATORS.find(
    (o) => o.id.toLowerCase() === v || o.name.toLowerCase() === v || `${o.short} ${o.country}`.toLowerCase() === v
  );
}

export function displayMethod(method: string | null): string {
  if (!method) return "";
  const op = findOperator(method);
  if (op) return `${op.short} ${PAYMENT_COUNTRIES.find((c) => c.code === op.countryCode)?.flag || ""} (${op.country})`;
  return method;
}

export function validatePhoneForCountry(phone: string, countryCode: PaymentCountryCode): boolean {
  const digits = phone.replace(/\D/g, "").replace(/^(228|229|225|221)/, "");
  if (countryCode === "CI") return digits.length === 10;
  if (countryCode === "SN") return digits.length === 9;
  return digits.length === 8; // TG + BJ
}

export const ALL_METHOD_NAMES: string[] = [
  ...PAYMENT_OPERATORS.map((o) => o.name),
  ...PAYMENT_OPERATORS.map((o) => o.id),
  // rétro-compatibilité avec les anciens libellés
  "MTN Money",
  "Moov Money",
  "Wave",
  "Orange Money",
  "Carte bancaire",
];
