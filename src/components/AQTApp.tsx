// AQTApp.tsx — patched for Vercel (lucide icon prop type fix) and inline Firebase.
// - Uses permissive IconType (size?: string | number) for lucide icons
// - No 'title' prop passed to lucide icons (avoids type error on Vercel)
// - Firebase initialized from NEXT_PUBLIC_* env vars (works locally & on Vercel)
// - Safe "Local Mode" if env vars are missing

'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useId,
} from "react";
import {
  TrendingUp,
  DollarSign,
  Target,
  Shield,
  Download,
  Upload,
  Brain,
  Trash2,
  Calculator,
  PieChart as PieIcon,
  ChevronDown,
  ChevronUp,
  WifiOff,
  Sun,
  Edit3,
  X,
  Settings as SettingsIcon,
  AlertTriangle,
  Printer,
  BarChart2,
  Clock,
  ClipboardCopy,
  Trophy,
  QrCode,
  HelpCircle,
  Wallet,
  Cloud,
  CloudOff,
  Twitter,
  Lock,
  Flame,
  Zap,
  Eye,
  EyeOff,
  CheckCircle
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Component imports for integration
import HelpGuide from "./HelpGuide";
import RiskRewardCalculator from "./RiskRewardCalculator";
import WeeklyGoals from "./WeeklyGoals";
import StreakTracker from "./StreakTracker";

/* ---------------- Firebase (inlined) ---------------- */
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  signOut,
  type User,
  type Auth,
  GoogleAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  type Firestore,
} from "firebase/firestore";

// Single APP_ID constant (used in document paths)
const APP_ID = "aqt-journal";

// Pull config from env; if missing, we will run in Local Mode safely.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Initialize only if config looks valid (has apiKey & projectId)
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let firebaseReady = false;

try {
  const hasConfig = !!(firebaseConfig.apiKey && firebaseConfig.projectId);
  if (hasConfig) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    firebaseReady = true;
  } else {
    console.warn(
      "[AQT] Firebase config not found. Running in Local Mode. Set NEXT_PUBLIC_FIREBASE_* in .env.local to enable cloud sync."
    );
  }
} catch (e) {
  console.warn("[AQT] Firebase init failed; running in Local Mode:", e);
  firebaseReady = false;
}

/* ---------------- Types ---------------- */
type Direction = "Long" | "Short";
type Tier = { name: string; min: number; max: number; pairs: number; suggestedPairs: string; desc: string };
type TaxBracket = { rate: number; label: string; minIncome: number };
type PricingModel = { label: string; commission: boolean; note?: string };
type BrokerInfo = {
  minLot: number;
  leverage: string[];
  default: string;
  regulation?: string;
  /** Estimated breakeven buffer in pips for spread+commission ECN/Raw style accounts */
  beBufferPips?: number;
  /** Optional list of account-type pricing models for display */
  models?: PricingModel[];
};
type BrokerMap = Record<string, BrokerInfo>;

type TradeSetup =
  | "Breakout" | "Pullback" | "Reversal" | "Range" | "Trend Following"
  | "SMC" | "ICT" | "The Strat" | "CRT" | "Wyckoff" | "Elliott Wave"
  | "Supply & Demand" | "Support & Resistance" | "Harmonic"
  | "News" | "Scalp" | "Algo/Bot" | "Fundamental";

const TRADE_SETUPS: TradeSetup[] = [
  "Breakout", "Pullback", "Reversal", "Range", "Trend Following",
  "SMC", "ICT", "The Strat", "CRT", "Wyckoff", "Elliott Wave",
  "Supply & Demand", "Support & Resistance", "Harmonic",
  "News", "Scalp", "Algo/Bot", "Fundamental"
];

type TradeInput = {
  pair: string;
  direction: Direction;
  entry: string;
  exit: string;
  lots: string; // User override for lots
  setup: TradeSetup;
  emotion: string;
  notes: string;
};
type Trade = {
  id: string;
  pair: string;
  direction: Direction;
  entry: number;
  exit: number;
  date: string;
  time: string;
  ts: number;
  lots: number;
  pnl: number;
  setup: string;
  emotion: string;
  notes: string;
};
type GlobalSettings = {
  pipValue: number;
  stopLoss: number;
  profitTarget: number;
  dailyGrowth: number;
  maxDailyLoss?: number;
  maxTradesPerDay?: number;
  startBalance?: number;
  targetBalance?: number;
};

type PairMeta = { placeholder: string; step: number; multiplier: number; isYen?: boolean; isGold?: boolean; isCrypto?: boolean; isIndex?: boolean };
type RiskMetrics = {
  winRate: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  profitFactor: number;
  maxDrawdownPct: number;
  currentStreak: number;
  bestStreak: number;
  worstStreak: number;
};

const TIERS: Tier[] = [
  { name: "SURVIVAL", min: 10, max: 19, pairs: 2, suggestedPairs: "EURUSD, GBPUSD", desc: "Capital preservation mode" },
  { name: "BUILDING", min: 20, max: 49, pairs: 3, suggestedPairs: "EURUSD, GBPUSD, USDJPY", desc: "Steady growth phase" },
  { name: "SCALING", min: 50, max: 99, pairs: 4, suggestedPairs: "Majors + 1 Cross", desc: "Accelerated scaling" },
  { name: "GROWTH", min: 100, max: 249, pairs: 5, suggestedPairs: "Majors + 2 Crosses", desc: "Sustained growth" },
  { name: "EXPANSION", min: 250, max: 499, pairs: 6, suggestedPairs: "Majors + Crosses + Gold", desc: "Portfolio expansion" },
  { name: "ADVANCED", min: 500, max: 999, pairs: 7, suggestedPairs: "Full Forex + Gold", desc: "Advanced strategies" },
  { name: "MASTERY", min: 1000, max: 2499, pairs: 8, suggestedPairs: "Forex, Gold, Indices", desc: "Full system mastery" },
  { name: "ELITE", min: 2500, max: 4999, pairs: 10, suggestedPairs: "Any Liquid Asset", desc: "Elite trader status" },
  { name: "LEGEND", min: 5000, max: 999999, pairs: 12, suggestedPairs: "Full Market Access", desc: "Legendary performance" },
];

const TRADE_TEMPLATES = [
  { name: "EURUSD Breakout", pair: "EURUSD", setup: "Breakout" as TradeSetup },
  { name: "Gold SMC Sweep", pair: "XAUUSD", setup: "SMC" as TradeSetup },
  { name: "ICT Silver Bullet", pair: "GBPUSD", setup: "ICT" as TradeSetup },
  { name: "Indices Scalp", pair: "US30", setup: "Scalp" as TradeSetup },
  { name: "Bitcoin CRT", pair: "BTCUSD", setup: "CRT" as TradeSetup },
  { name: "Wyckoff Spring", pair: "EURUSD", setup: "Wyckoff" as TradeSetup },
  { name: "Strat 2-1-2", pair: "SPX500", setup: "The Strat" as TradeSetup },
];

const TAX_BRACKETS_2025: TaxBracket[] = [
  { rate: 0.1, label: "10% (< $11,925)", minIncome: 0 },
  { rate: 0.12, label: "12% ($11,925 - $48,475)", minIncome: 11925 },
  { rate: 0.22, label: "22% ($48,475 - $103,350)", minIncome: 48475 },
  { rate: 0.24, label: "24% ($103,350 - $197,300)", minIncome: 103350 },
  { rate: 0.32, label: "32% ($197,300 - $250,525)", minIncome: 197300 },
  { rate: 0.35, label: "35% ($250,525 - $626,350)", minIncome: 250525 },
  { rate: 0.37, label: "37% (> $626,350)", minIncome: 626350 },
];

const BROKERS: BrokerMap = {
  "PlexyTrade": { minLot: 0.01, leverage: ["1:100", "1:200", "1:400", "1:500", "1:1000", "1:2000"], default: "1:2000", regulation: "Offshore (Max 1:2000)" },
  "Hugo's Way": { minLot: 0.01, leverage: ["1:100", "1:200", "1:300", "1:500"], default: "1:500", regulation: "Offshore (Max 1:500)" },
  "Coinexx": { minLot: 0.01, leverage: ["1:100", "1:200", "1:300", "1:400", "1:500"], default: "1:500", regulation: "Offshore (Max 1:500)" },
  "HankoTrade": { minLot: 0.01, leverage: ["1:100", "1:200", "1:400", "1:500"], default: "1:500", regulation: "Offshore (Max 1:500)" },
  "Fyntura": { minLot: 0.01, leverage: ["1:100", "1:200", "1:400", "1:500"], default: "1:500", regulation: "Offshore (Max 1:500)" },
  "DuraMarkets": { minLot: 0.01, leverage: ["1:100", "1:200", "1:400", "1:500"], default: "1:500", regulation: "Offshore (Max 1:500)" },
  "OctaFX": { minLot: 0.01, leverage: ["1:100", "1:200", "1:500"], default: "1:500", regulation: "Offshore (Max 1:500)" },
  "HFM": { minLot: 0.01, leverage: ["1:100", "1:200", "1:400", "1:500"], default: "1:500", regulation: "Offshore (Max 1:500)" },
  "OANDA": { minLot: 0.001, leverage: ["1:20", "1:30", "1:50"], default: "1:50", regulation: "US Regulated (Max 1:50)" },
  "Forex.com": { minLot: 0.01, leverage: ["1:20", "1:30", "1:50"], default: "1:50", regulation: "US Regulated (Max 1:50)" },
  "tastyfx": { minLot: 0.01, leverage: ["1:20", "1:30", "1:50"], default: "1:50", regulation: "US Regulated (Max 1:50)" },
  "TD Ameritrade": { minLot: 0.01, leverage: ["1:20", "1:30", "1:50"], default: "1:50", regulation: "US Regulated (Max 1:50)" },
  "IG US": { minLot: 0.5, leverage: ["1:20", "1:30", "1:50"], default: "1:50", regulation: "US Regulated (Max 1:50)" },
  "Interactive Brokers": { minLot: 1, leverage: ["1:20", "1:30", "1:40", "1:50"], default: "1:50", regulation: "US Regulated (Max 1:50)" },
  "Ally Invest": { minLot: 0.01, leverage: ["1:20", "1:30", "1:50"], default: "1:50", regulation: "US Regulated (Max 1:50)" },
  "ATC Brokers": { minLot: 0.01, leverage: ["1:20", "1:30", "1:50"], default: "1:50", regulation: "US Regulated (Max 1:50)" },
};

/** Heuristic/placeholder BE buffers in pips (spread+commission) */
const BROKER_BE_BUFFER: Record<string, number> = {
  "Coinexx": 0.5,
  "HankoTrade": 0.5,
  "Hugo's Way": 0.5,
  "PlexyTrade": 0.5,
  "Fyntura": 0.5,
  "DuraMarkets": 0.5,
  // Regulated US desks typically spread-only or lower fixed costs; default to 0
  // Override per your experience.
};

/** Display-only list of common commission vs spread-only models */
const BROKER_MODELS: { name: string; models: PricingModel[] }[] = [
  {
    name: "OANDA", models: [
      { label: "Core", commission: true, note: "Spread + commission" },
      { label: "Standard", commission: false, note: "Spread-only" },
    ]
  },
  {
    name: "FOREX.com", models: [
      { label: "RAW", commission: true, note: "Spread + commission" },
      { label: "Standard", commission: false, note: "Spread-only" },
    ]
  },
  {
    name: "Pepperstone", models: [
      { label: "Razor", commission: true, note: "Spread + commission" },
      { label: "Standard", commission: false, note: "Spread-only" },
    ]
  },
  {
    name: "IC Markets", models: [
      { label: "Raw/ECN", commission: true, note: "Spread + commission" },
      { label: "Standard", commission: false, note: "Spread-only" },
    ]
  },
  {
    name: "XM", models: [
      { label: "Zero", commission: true, note: "Spread + commission" },
      { label: "Standard/Micro", commission: false, note: "Spread-only" },
    ]
  },
  {
    name: "Exness", models: [
      { label: "Raw/Zero", commission: true, note: "Spread + commission" },
      { label: "Standard", commission: false, note: "Spread-only" },
    ]
  },
  {
    name: "BlackBull Markets", models: [
      { label: "ECN", commission: true, note: "Spread + commission" },
      { label: "Standard", commission: false, note: "Spread-only" },
    ]
  },
  {
    name: "Eightcap", models: [
      { label: "Raw", commission: true, note: "Spread + commission" },
      { label: "Standard", commission: false, note: "Spread-only" },
    ]
  },
  {
    name: "HankoTrade", models: [
      { label: "ECN", commission: true, note: "Spread + commission" },
    ]
  },
  {
    name: "Coinexx", models: [
      { label: "ECN", commission: true, note: "Spread + commission" },
    ]
  },
  {
    name: "IG US", models: [
      { label: "Standard", commission: false, note: "Spread-only (CFDs/FX)" },
    ]
  },
  {
    name: "AvaTrade", models: [
      { label: "Standard", commission: false, note: "Spread-only" },
    ]
  },
  {
    name: "eToro", models: [
      { label: "Standard", commission: false, note: "Spread-only" },
    ]
  },
];

const COMMON_PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD", "USDCAD", "BTCUSD", "ETHUSD", "US30", "NAS100", "SPX500"];
const isBrowser = typeof window !== "undefined";

/* ---------------- Utils ---------------- */
const fmtUSD = (n: number) => n.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

const safeSettings = (s: any): Partial<GlobalSettings> =>
  typeof s === 'object' && s ? ['pipValue', 'stopLoss', 'profitTarget', 'dailyGrowth']
    .reduce((a, k) => (typeof s[k] === 'number' ? { ...a, [k]: s[k] } : a), {} as any) : {};

const getPairMetadata = (rawPair: string): PairMeta => {
  const pair = (rawPair || "").toUpperCase();
  if (pair.includes("JPY")) return { placeholder: "145.50", step: 0.01, multiplier: 100, isYen: true };
  if (pair.includes("XAU")) return { placeholder: "2350.10", step: 0.01, multiplier: 100, isGold: true };
  if (pair.includes("BTC") || pair.includes("ETH")) return { placeholder: "62000", step: 1, multiplier: 1, isCrypto: true };
  if (pair.includes("US30") || pair.includes("NAS") || pair.includes("SPX")) return { placeholder: "35000", step: 1, multiplier: 1, isIndex: true };
  return { placeholder: "1.0850", step: 0.0001, multiplier: 10000 };
};

const getContractSize = (meta: PairMeta) => {
  if (meta.isGold) return 100;
  if (meta.isIndex) return 1;
  if (meta.isCrypto) return 1;
  return 100000;
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const safeParseNumber = (v: string | number): number => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

// Stable local day key (YYYY-MM-DD)
const localDayKey = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const getHourFromTimeString = (time: string): number | null => {
  const m12 = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m12) {
    let h = parseInt(m12[1], 10) % 12;
    if (m12[3].toUpperCase() === "PM") h += 12;
    return h;
  }
  const m24 = time.match(/^(\d{1,2}):\d{2}/);
  if (m24) return Math.min(23, Math.max(0, parseInt(m24[1], 10)));
  return null;
};

/* ---------------- Calculations ---------------- */
const normalizeTrade = (trade: TradeInput, lotSize: number): Omit<Trade, "pnl"> => {
  const ts = Date.now();
  return {
    id: generateId(),
    entry: safeParseNumber(trade.entry),
    exit: safeParseNumber(trade.exit),
    date: localDayKey(new Date(ts)),
    time: formatTime(ts),
    ts,
    lots: lotSize,
    pair: trade.pair.toUpperCase(),
    direction: trade.direction,
    setup: trade.setup,
    emotion: trade.emotion,
    notes: trade.notes,
  };
};

const calculateTradingMetrics = (
  balance: number,
  broker: string,
  safeMode: boolean,
  brokerList: BrokerMap,
  settings: GlobalSettings,
  leverage: string
) => {
  const safeBal = Number.isFinite(balance) ? balance : 0;
  const currentTier = TIERS.find((t) => safeBal >= t.min && safeBal <= t.max) ?? TIERS[0];
  const brokerData = brokerList[broker] ?? brokerList["PlexyTrade"] ?? Object.values(brokerList)[0];
  const baseLot = Math.max(brokerData.minLot, parseFloat((Math.floor(currentTier.min / 10) * 0.01).toFixed(2)));
  const lotSize = safeMode ? Math.max(brokerData.minLot, parseFloat((baseLot * 0.5).toFixed(2))) : baseLot;
  const dailyGoal = round2(safeBal * (settings.dailyGrowth / 100));
  const pipValueForLot = lotSize * settings.pipValue;

  const maxLoss = round2(pipValueForLot * settings.stopLoss);
  const targetWin = round2(pipValueForLot * settings.profitTarget);
  const riskRewardRatio = settings.stopLoss > 0 ? (settings.profitTarget / settings.stopLoss).toFixed(1) : "0";

  const levNum = Math.max(1, parseInt(leverage.replace("1:", "").replace("Unlimited", "2000"), 10) || 500);
  const pairMeta = getPairMetadata("EURUSD"); // Default for generic calculations
  const proxyPrice = safeParseNumber(pairMeta.placeholder);
  const contractSize = getContractSize(pairMeta);

  const marginRequired = safeBal > 0 && lotSize > 0 ? round2((lotSize * contractSize * proxyPrice) / levNum) : 0;

  const nextTierIndex = TIERS.indexOf(currentTier) + 1;
  const nextTier = TIERS[nextTierIndex];
  let progress = 100;
  if (nextTier) {
    const range = nextTier.min - currentTier.min || 1;
    const current = safeBal - currentTier.min;
    progress = Math.min(100, Math.max(0, (current / range) * 100));
  }
  return { currentTier, lotSize, dailyGoal, maxLoss, targetWin, riskRewardRatio, nextTier, progress, pipValueForLot };
};

const calculatePnL = (
  trade: { entry: string | number; exit: string | number; pair: string; direction: Direction },
  pipValueForLot: number,
  beBufferPips = 0
) => {
  const entryNum = safeParseNumber(trade.entry);
  const exitNum = safeParseNumber(trade.exit);
  if (!entryNum || !exitNum || entryNum === exitNum) return 0;

  const meta = getPairMetadata(trade.pair);
  const dirMult = trade.direction === "Long" ? 1 : -1;

  const grossDollars = (exitNum - entryNum) * dirMult * meta.multiplier * pipValueForLot;
  const costDollars = beBufferPips * pipValueForLot; // spread+commission expressed in pips
  return round2(grossDollars - costDollars);
};

const validateTradeInputs = (trade: TradeInput, minLot: number) => {
  const errors: string[] = [];
  const pair = trade.pair.trim().toUpperCase();
  if (!/^[A-Z0-9]{3,8}$/.test(pair)) errors.push("Invalid pair format (3-8 alphanumeric)");
  const entry = safeParseNumber(trade.entry);
  const exit = safeParseNumber(trade.exit);
  if (entry <= 0) errors.push("Entry must be positive");
  if (exit <= 0) errors.push("Exit must be positive");
  const meta = getPairMetadata(pair);
  if (Math.abs(exit - entry) < meta.step) errors.push(`Entry and exit too close (min step ${meta.step} for ${pair})`);

  const lotsNum = safeParseNumber(trade.lots);
  if (trade.lots) {
    if (lotsNum <= 0) errors.push("Lots must be greater than 0");
    if (lotsNum > 0 && lotsNum < minLot) errors.push(`Lots must be ≥ broker min lot (${minLot})`);
  }

  return errors;
};

const calculateMaxDrawdown = (series: { balance: number }[]): number => {
  let peak = series[0]?.balance ?? 0;
  let maxDD = 0;
  for (const p of series) {
    peak = Math.max(peak, p.balance);
    const dd = peak > 0 ? (peak - p.balance) / peak : 0;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD * 100;
};

const calculateRiskMetrics = (trades: Trade[], balanceHistory: { balance: number }[]): RiskMetrics => {
  const total = trades.length;
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl < 0);
  const sumWins = wins.reduce((s, t) => s + t.pnl, 0);
  const sumLosses = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));

  const winRate = total ? (wins.length / total) * 100 : 0;
  const averageWin = wins.length ? sumWins / wins.length : 0;
  const averageLoss = losses.length ? -sumLosses / losses.length : 0;
  const profitFactor = sumLosses ? sumWins / sumLosses : (sumWins ? Infinity : 0);
  const maxDrawdownPct = calculateMaxDrawdown(balanceHistory);

  const largestWin = wins.length > 0 ? Math.max(...wins.map((t) => t.pnl)) : 0;
  const largestLoss = losses.length > 0 ? Math.min(...losses.map((t) => t.pnl)) : 0;

  const cronTrades = [...trades].reverse();
  let currentStreak = 0, bestStreak = 0, worstStreak = 0;
  cronTrades.forEach((t) => {
    if (t.pnl > 0) {
      if (currentStreak < 0) currentStreak = 0;
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else if (t.pnl < 0) {
      if (currentStreak > 0) currentStreak = 0;
      currentStreak--;
      worstStreak = Math.min(worstStreak, currentStreak);
    }
  });

  return { winRate, averageWin, averageLoss, largestWin, largestLoss, profitFactor, maxDrawdownPct, currentStreak, bestStreak, worstStreak };
};

const activeTaxRate = (is1256: boolean, bracketRate: number) =>
  is1256 ? 0.60 * 0.15 + 0.40 * bracketRate : bracketRate;

/* ---------------- UI Components ---------------- */
const WithdrawalAlert: React.FC<{ balance: number }> = ({ balance }) => {
  const milestones = [100000, 250000, 500000, 1000000];
  const milestone = [...milestones].reverse().find(m => balance >= m);
  if (!milestone) return null;

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border border-amber-200 dark:border-amber-700 rounded-xl flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-200 dark:bg-amber-800 rounded-full text-amber-800 dark:text-amber-100">
          <Wallet size={24} />
        </div>
        <div>
          <h3 className="font-bold text-amber-900 dark:text-amber-100">Wealth Milestone Reached!</h3>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Your balance has crossed <strong>{fmtUSD(milestone)}</strong>.
            It's a great time to withdraw some profits and pay yourself.
          </p>
        </div>
      </div>
      <button
        onClick={() => alert("Processing withdrawal request... (Simulation)")}
        className="hidden sm:block px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-sm transition-colors"
      >
        Request Payout
      </button>
    </div>
  );
};

const PerformanceSummary: React.FC<{ metrics: RiskMetrics }> = ({ metrics }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm">
      <div className="text-sm text-slate-500 dark:text-slate-400">Win Rate</div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.winRate.toFixed(1)}%</div>
    </div>
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm">
      <div className="text-sm text-slate-500 dark:text-slate-400">Profit Factor</div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{Number.isFinite(metrics.profitFactor) ? metrics.profitFactor.toFixed(2) : "∞"}</div>
    </div>
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm">
      <div className="text-sm text-slate-500 dark:text-slate-400">Streak (Cur/Best)</div>
      <div className="text-2xl font-bold flex items-baseline gap-2">
        <span className={metrics.currentStreak > 0 ? "text-green-500" : metrics.currentStreak < 0 ? "text-red-500" : "text-slate-500"}>
          {metrics.currentStreak > 0 ? "+" : ""}{metrics.currentStreak}
        </span>
        <span className="text-sm text-slate-400 font-normal dark:text-slate-300">/ +{metrics.bestStreak}</span>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm">
      <div className="text-sm text-slate-500 dark:text-slate-400">Best Trade</div>
      <div className="text-2xl font-bold text-green-500">{fmtUSD(metrics.largestWin)}</div>
    </div>
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm">
      <div className="text-sm text-slate-500 dark:text-slate-400">Worst Trade</div>
      <div className="text-2xl font-bold text-red-500">{fmtUSD(metrics.largestLoss)}</div>
    </div>
  </div>
);

const EnhancedTradeHeatmap: React.FC<{ trades: Trade[] }> = ({ trades }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const hourData = hours.map((hour) => {
    const hourTrades = trades.filter((t) => {
      if (t.ts) return new Date(t.ts).getHours() === hour;
      const h = getHourFromTimeString(t.time);
      return h === hour;
    });
    const profits = hourTrades.map((t) => t.pnl);
    const winRate = profits.length ? (profits.filter((p) => p > 0).length / profits.length) * 100 : 0;
    return {
      hour,
      count: hourTrades.length,
      profit: profits.reduce((sum, p) => sum + p, 0),
      winRate,
      label: `${hour}:00`,
      session: hour < 9 ? "Tokyo" : hour < 17 ? "London" : "New York",
    };
  });

  const maxCount = Math.max(...hourData.map((h) => h.count), 1);

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
          <Clock size={16} /> Trading Hours Analysis
        </h4>
        <div className="text-xs text-slate-500 flex gap-2">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded">Tokyo</span>
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded">London</span>
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded">New York</span>
        </div>
      </div>

      <div className="grid grid-cols-6 md:grid-cols-12 gap-1">
        {hourData.map((h) => {
          const sizeIntensity = Math.min(1, h.count / maxCount);
          const isProfitable = h.profit > 0;
          return (
            <div key={h.hour} role="listitem" className="relative group" title={`${h.label} (${h.session}) - ${h.count} trades, P&L: ${fmtUSD(h.profit)}, WR: ${h.winRate.toFixed(1)}%`}>
              <div
                className={`p-2 rounded text-center transition-all duration-200 ${h.session === "Tokyo" ? "bg-blue-50 dark:bg-blue-900/20" : h.session === "London" ? "bg-green-50 dark:bg-green-900/20" : "bg-purple-50 dark:bg-purple-900/20"
                  } ${h.count > 0 ? "border-2" : "border"} ${isProfitable ? "border-green-300 dark:border-green-700" : h.profit < 0 ? "border-red-300 dark:border-red-700" : "border-slate-200 dark:border-white/10"
                  }`}
              >
                <div className="text-[10px] text-slate-500">{h.hour}</div>
                <div className={`font-bold text-slate-800 dark:text-white ${h.count > 0 ? "text-lg" : "text-sm"}`}>{h.count > 0 ? h.count : "-"}</div>
              </div>
              {h.count > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b overflow-hidden">
                  <div className={`h-full ${isProfitable ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${sizeIntensity * 100}%` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center">Color = session • Size = trade count • Border = profitability</div>
    </div>
  );
};

const SetupPerformanceAnalysis: React.FC<{ trades: Trade[] }> = ({ trades }) => {
  const setupGroups = trades.reduce((acc, trade) => {
    const s = trade.setup || "Unspecified";
    if (!acc[s]) acc[s] = { count: 0, wins: 0, pnl: 0 };
    acc[s].count++;
    acc[s].pnl += trade.pnl;
    if (trade.pnl > 0) acc[s].wins++;
    return acc;
  }, {} as Record<string, { count: number; wins: number; pnl: number }>);

  const data = Object.entries(setupGroups)
    .map(([name, stats]) => ({
      name,
      winRate: (stats.wins / stats.count) * 100,
      avgPnl: stats.pnl / stats.count,
      ...stats
    }))
    .sort((a, b) => b.pnl - a.pnl);

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-white/10">
      <h4 className="font-bold mb-3 flex items-center gap-2 text-slate-800 dark:text-white">
        <BarChart2 size={16} /> Setup Performance
      </h4>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
        {data.length === 0 ? <div className="text-sm text-slate-500 text-center py-4">No data</div> : data.map(item => (
          <div key={item.name} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-white/5 rounded border border-slate-100 dark:border-white/5">
            <div>
              <div className="font-bold text-sm text-slate-800 dark:text-white">{item.name}</div>
              <div className="text-[10px] text-slate-500">{item.count} trades</div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-bold ${item.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>{item.pnl.toFixed(0)}</div>
              <div className="text-[10px] text-slate-500">{item.winRate.toFixed(0)}% WR</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PairPerformanceSummary: React.FC<{ trades: Trade[] }> = ({ trades }) => {
  const pairStats = trades.reduce((acc, trade) => {
    if (!acc[trade.pair]) acc[trade.pair] = { count: 0, pnl: 0 };
    acc[trade.pair].count++;
    acc[trade.pair].pnl += trade.pnl;
    return acc;
  }, {} as Record<string, { count: number; pnl: number }>);

  const topPairs = Object.entries(pairStats)
    .map(([pair, stats]) => ({ pair, ...stats }))
    .sort((a, b) => b.pnl - a.pnl)
    .slice(0, 5);

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-white/10">
      <h4 className="font-bold mb-3 flex items-center gap-2 text-slate-800 dark:text-white">
        <TrendingUp size={16} /> Top Pairs
      </h4>
      <div className="space-y-2">
        {topPairs.length === 0 ? <div className="text-sm text-slate-500 text-center py-4">No data</div> : topPairs.map(p => (
          <div key={p.pair} className="flex justify-between items-center text-sm">
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{p.pair}</span>
            <span className={`font-bold ${p.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {fmtUSD(p.pnl)} <span className="text-[10px] font-normal text-slate-400">({p.count})</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RiskOfRuinCalculator: React.FC<{ winRate: number; riskPerTradePct: number }> = ({ winRate, riskPerTradePct }) => {
  const p = winRate / 100;
  const q = 1 - p;
  const units = 100 / (riskPerTradePct || 1);

  let ror = 0;
  if (p <= 0.5) {
    ror = 100;
  } else {
    ror = Math.pow(q / p, units) * 100;
  }

  const displayRoR = ror > 100 ? 100 : ror < 0.01 ? "< 0.01" : ror.toFixed(2);
  const isSafe = ror < 1;

  return (
    <div className={`mt-4 p-3 rounded border ${isSafe ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Risk of Ruin</span>
        <span className={`text-sm font-bold ${isSafe ? 'text-green-600' : 'text-red-600'}`}>{displayRoR}%</span>
      </div>
      <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
        Probability of hitting 0 balance given {winRate.toFixed(0)}% WR & {riskPerTradePct.toFixed(1)}% risk.
      </div>
    </div>
  );
};

const DailyGoalTracker: React.FC<{ current: number; target: number }> = ({ current, target }) => {
  const pct = Math.min(100, Math.max(0, target ? (current / target) * 100 : 0));
  const isMet = current >= target && target > 0;
  return (
    <div className="flex-1 bg-white dark:bg-white/10 rounded-xl p-4 border border-slate-200 dark:border-white/10 relative overflow-hidden flex flex-col justify-center">
      <div className="flex justify-between items-end mb-2 relative z-10">
        <span className="text-xs text-slate-500 dark:text-slate-300 font-bold uppercase">Daily Goal</span>
        <span className={`text-lg font-bold ${isMet ? "text-green-500" : "text-slate-700 dark:text-white"}`} aria-live="polite">
          {Math.round(current)} <span className="text-xs text-slate-400">/ {Math.round(target)}</span>
        </span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-black/30 h-2 rounded-full overflow-hidden relative z-10">
        <div className={`h-full transition-all duration-1000 ${isMet ? "bg-green-500" : "bg-blue-500"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const PerformanceBenchmarks: React.FC<{ winRate: number; profitFactor: number; tradesCount: number }> = ({ winRate, profitFactor, tradesCount }) => {
  const benchmarks = [
    { label: "Novice", winRate: 0, profitFactor: 0, trades: 0, color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800" },
    { label: "Beginner", winRate: 40, profitFactor: 1.2, trades: 20, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/20" },
    { label: "Intermediate", winRate: 50, profitFactor: 1.5, trades: 50, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/20" },
    { label: "Advanced", winRate: 60, profitFactor: 2.0, trades: 100, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/20" },
    { label: "Professional", winRate: 70, profitFactor: 3.0, trades: 200, color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/20" },
    { label: "Elite", winRate: 80, profitFactor: 4.0, trades: 500, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/20" },
  ];
  let currentLevel = benchmarks[0];
  for (const level of benchmarks) {
    if (winRate >= level.winRate && profitFactor >= level.profitFactor && tradesCount >= level.trades) currentLevel = level;
  }
  return (
    <div className={`rounded-xl p-4 border ${currentLevel.bg} border-slate-200 dark:border-white/10 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Performance Rank</div>
          <div className={`text-xl font-bold ${currentLevel.color}`}>{currentLevel.label}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 dark:text-slate-300">WR: {winRate.toFixed(1)}%</div>
          <div className="text-xs text-slate-500 dark:text-slate-300">PF: {profitFactor.toFixed(2)}</div>
        </div>
      </div>
      <div className="w-full bg-slate-200 dark:bg-black/40 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${currentLevel.color.replace("text-", "bg-")}`}
          style={{ width: `${Math.min(100, (winRate / 80) * 100)}%` }}
        />
      </div>
      <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 text-center">
        {currentLevel.label !== "Elite" && `Next: ${benchmarks[benchmarks.indexOf(currentLevel) + 1]?.label || "Max"}`}
      </div>
    </div>
  );
};

const PerformanceMilestones: React.FC<{ trades: Trade[]; balance: number }> = ({ trades, balance }) => {
  const milestones = [
    { target: 10, label: "First 10 Trades", reward: "Consistency Badge" },
    { target: 1000, label: "$1k Profit", reward: "Grand Master" },
    { target: 50, label: "50 Trades", reward: "Experience Unlocked" },
    { target: 5000, label: "$5k Account", reward: "Pro Trader" },
  ];
  const totalPnL = trades.reduce((a, t) => a + t.pnl, 0);
  const accountValue = balance;
  const achieved = milestones.filter((m) => (m.target < 100 && trades.length >= m.target) || (m.target >= 100 && (m.target % 100 === 0 ? totalPnL >= m.target : accountValue >= m.target)));
  const nextMilestone = milestones.find((m) => !achieved.includes(m));
  if (achieved.length === 0) return null;
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="text-yellow-500" size={20} />
        <h4 className="font-bold text-blue-800 dark:text-blue-300">Achievements</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {achieved.map((m) => (
          <span key={m.label} className="px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-700 dark:text-white">
            {m.label} ✓
          </span>
        ))}
      </div>
      {nextMilestone && <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">Next: {nextMilestone.label} • {nextMilestone.reward}</div>}
    </div>
  );
};

// Helper component for Clear All
const ClearAllTradesButton: React.FC<{ onClear: () => void }> = ({ onClear }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const handleClear = () => {
    if (showConfirm) {
      onClear();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };
  return (
    <button
      type="button"
      onClick={handleClear}
      className={`h-8 px-3 rounded text-xs font-medium transition-all ${showConfirm
        ? 'bg-red-600 text-white'
        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30'
        }`}
    >
      {showConfirm ? 'Confirm Clear?' : 'Clear All'}
    </button>
  );
};

/* ---------------- Helpers: export/backup ---------------- */
const exportToCSV = (trades: Trade[]) => {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const headers = ["Date", "Time", "Pair", "Direction", "Lots", "PnL", "Setup", "Emotion", "Notes"];
  const rows = trades.map((t) => [t.date, t.time, t.pair, t.direction, t.lots, t.pnl.toFixed(2), t.setup, t.emotion, (t.notes || "").replace(/\n/g, " ")]);
  const csv = [headers.join(","), ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `aqt_journal_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const backupJSON = (state: any) => {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `aqt_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

/* ---------------- Collapsible / Modals / Drawers ---------------- */

// very permissive icon type that works with lucide on Vercel
type IconType = React.ComponentType<{ size?: string | number; className?: string }>;

const CollapsibleSection: React.FC<{
  title: string;
  icon?: IconType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6 transition-all shadow-sm">
      <button
        onClick={() => setIsOpen((s) => !s)}
        className="w-full flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors focus:outline-none"
        aria-label={`Toggle ${title}`}
      >
        <div className="flex items-center gap-2 font-bold text-lg text-slate-800 dark:text-white">
          {Icon && <Icon size={20} className="text-blue-600 dark:text-blue-400" />}
          {title}
        </div>
        {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </button>
      <div style={{ height: isOpen ? "auto" : 0, overflow: "hidden" }}>
        <div className="p-6 border-t border-slate-200 dark:border-slate-700">{children}</div>
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any) { console.error("Component error:", error); }
  render() {
    if (this.state.hasError) return <div className="p-4 text-red-500">Error in component.</div>;
    return this.props.children;
  }
}

const TradingViewTicker: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const c = containerRef.current;
    if (!c) return;
    c.innerHTML = "";
    try {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
      script.async = true;
      script.onerror = () => setError(true);
      script.innerHTML = JSON.stringify({
        symbols: [
          { proName: "FOREXCOM:SPX500", title: "S&P 500" },
          { proName: "FX_IDC:EURUSD", title: "EUR/USD" },
          { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
          { proName: "OANDA:XAUUSD", title: "Gold" },
        ],
        showSymbolLogo: true,
        colorTheme: darkMode ? "dark" : "light",
        isTransparent: true,
        displayMode: "adaptive",
        locale: "en",
      });
      c.appendChild(script);
    } catch {
      setError(true);
    }
    return () => { if (c) c.innerHTML = ""; };
  }, [darkMode]);
  if (error)
    return (
      <div className="w-full h-12 mb-6 flex items-center justify-center bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs border-b border-red-200 dark:border-red-500/20">
        <WifiOff size={14} className="mr-2" /> Live Feed Offline
      </div>
    );
  return <div className="tradingview-widget-container w-full h-12 mb-6 pointer-events-none"><div ref={containerRef} /></div>;
};

const TradeNotesModal: React.FC<{
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (tradeId: string, notes: string) => void;
}> = ({ trade, isOpen, onClose, onSave }) => {
  const [notes, setNotes] = useState(trade?.notes ?? "");
  useEffect(() => setNotes(trade?.notes ?? ""), [trade]);
  if (!isOpen || !trade) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full border border-slate-200 dark:border-white/10 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold dark:text-white">Trade Notes: {trade.pair}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-white"><X size={18} /></button>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-40 p-3 border dark:border-white/10 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
          placeholder="Add your analysis, lessons learned, emotions..."
        />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors dark:text-white">Cancel</button>
          <button onClick={() => onSave(trade.id, notes)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">Save Notes</button>
        </div>
      </div>
    </div>
  );
};

const SettingsDrawer: React.FC<{ isOpen: boolean; onClose: () => void; settings: GlobalSettings; onSave: (s: GlobalSettings) => void }> = ({ isOpen, onClose, settings, onSave }) => {
  const [local, setLocal] = useState(settings);
  useEffect(() => setLocal(settings), [settings, isOpen]);
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-white/10 shadow-2xl p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold dark:text-white flex gap-2"><SettingsIcon /> Settings</h3>
          <button onClick={onClose}><X className="dark:text-white" /></button>
        </div>
        <div className="space-y-6">
          {(["pipValue", "stopLoss", "profitTarget", "dailyGrowth"] as (keyof GlobalSettings)[]).map((k) => (
            <div key={k}>
              <label className="block text-sm font-medium dark:text-slate-300 mb-1 capitalize">{k.replace(/([A-Z])/g, " $1")}</label>
              <input
                type="number"
                step="0.01"
                value={local[k]}
                onChange={(e) => setLocal({ ...local, [k]: parseFloat(e.target.value) || 0 })}
                className="w-full p-3 bg-slate-50 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded dark:text-white"
              />
            </div>
          ))}
          <button onClick={() => { onSave(local); onClose(); }} className="w-full py-3 bg-blue-600 text-white rounded font-bold mt-4">Save Changes</button>
        </div>
      </div>
    </>
  );
};

/* ---------------- Floating helpers ---------------- */
const HelpTooltip: React.FC = () => {
  const [showHelp, setShowHelp] = useState(false);
  return (
    <>
      <button onClick={() => setShowHelp(!showHelp)} className="fixed bottom-4 left-4 p-3 bg-slate-800 text-white rounded-full shadow-lg z-40 hover:bg-slate-700 transition-all print:hidden" aria-label="Help">
        <HelpCircle size={20} />
      </button>
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold dark:text-white">Quick Start Guide</h3>
              <button onClick={() => setShowHelp(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <p><strong>1. Set Balance</strong> - Enter your current account balance</p>
              <p><strong>2. Configure</strong> - Select broker, risk mode, and tax settings</p>
              <p><strong>3. Enter Trades</strong> - Log each trade with entry/exit prices</p>
              <p><strong>4. Analyze</strong> - Review performance metrics and analytics</p>
              <p><strong>5. Export</strong> - Backup data regularly and print reports</p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
              <p className="text-xs text-slate-500">Tip: Use Ctrl+Enter to quickly log trades</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const QRCodeGenerator: React.FC = () => {
  const [showQR, setShowQR] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  return (
    <>
      <button onClick={() => setShowQR(!showQR)} className="fixed bottom-4 left-20 p-3 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full shadow-lg z-40 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all print:hidden" aria-label="QR Code">
        <QrCode size={20} />
      </button>
      {showQR && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm w-full shadow-2xl relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold dark:text-white">Mobile Access</h3>
              <button onClick={() => setShowQR(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-white"><X size={20} /></button>
            </div>
            <div className="bg-white p-4 rounded-lg flex justify-center">
              <div className="w-48 h-48 bg-slate-100 flex items-center justify-center border-2 border-slate-200 rounded">
                <div className="text-center">
                  <QrCode size={64} className="mx-auto mb-2 text-slate-400" />
                  <span className="text-xs text-slate-500">Scan URL</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4 break-all bg-slate-100 dark:bg-black/20 p-2 rounded">{currentUrl}</p>
          </div>
        </div>
      )}
    </>
  );
};

// ============= FLIP MODE COMPONENT =============
type TradingRule = {
  id: string;
  text: string;
  checked: boolean;
};

const FlipMode: React.FC<{
  balance: number;
  trades: Trade[];
  settings: GlobalSettings;
  onAddTrade: (trade: Omit<Trade, 'id' | 'ts' | 'time' | 'date' | 'lots' | 'setup' | 'emotion' | 'notes'>) => void;
  onSwitchMode: () => void;
}> = ({ balance, trades, settings, onAddTrade, onSwitchMode }) => {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showLossModal, setShowLossModal] = useState(false);
  const [showRulesCheck, setShowRulesCheck] = useState(true);
  const [newTrade, setNewTrade] = useState({
    pair: '',
    direction: 'Long' as Direction,
    entry: '',
    exit: ''
  });

  const [rules, setRules] = useState<TradingRule[]>([
    { id: '1', text: 'I am well-rested (7+ hours sleep)', checked: false },
    { id: '2', text: 'I have reviewed my plan for today', checked: false },
    { id: '3', text: 'I am emotionally neutral (no revenge trading)', checked: false },
    { id: '4', text: 'I will follow my stop loss', checked: false },
    { id: '5', text: `Max ${settings.maxTradesPerDay || 3} trades today`, checked: false }
  ]);

  const todayKey = useMemo(() => localDayKey(new Date()), []);
  const todayTrades = useMemo(() => trades.filter(t => t.date === todayKey), [trades, todayKey]);
  const todayPnl = useMemo(() => todayTrades.reduce((sum, t) => sum + t.pnl, 0), [todayTrades]);
  const totalPnL = useMemo(() => trades.reduce((sum, t) => sum + t.pnl, 0), [trades]);

  const dailyGoalAmount = balance * ((settings.dailyGrowth || 5) / 100);
  const maxDailyLossAmount = balance * ((settings.maxDailyLoss || 5) / 100);
  const startBalance = settings.startBalance || 100;
  const targetBalance = settings.targetBalance || 1000;
  const progressPercent = ((balance - startBalance) / (targetBalance - startBalance)) * 100;
  const todayGoalPercent = Math.min(100, Math.max(0, (todayPnl / dailyGoalAmount) * 100));

  const wins = todayTrades.filter(t => t.pnl > 0).length;
  const losses = todayTrades.filter(t => t.pnl < 0).length;
  const allRulesChecked = rules.every(r => r.checked);
  const maxTradesPerDay = settings.maxTradesPerDay || 3;

  useEffect(() => {
    if (todayPnl >= dailyGoalAmount && dailyGoalAmount > 0 && !showGoalModal) {
      setShowGoalModal(true);
    }
    if (todayPnl <= -maxDailyLossAmount && todayPnl < 0 && !showLossModal) {
      setShowLossModal(true);
    }
  }, [todayPnl, dailyGoalAmount, maxDailyLossAmount, showGoalModal, showLossModal]);

  const handleAddTrade = () => {
    const entry = parseFloat(newTrade.entry);
    const exit = parseFloat(newTrade.exit);

    if (!newTrade.pair || !entry || !exit) {
      alert('Please fill all fields');
      return;
    }

    if (todayTrades.length >= maxTradesPerDay) {
      alert(`Max ${maxTradesPerDay} trades per day!`);
      return;
    }

    const dirMult = newTrade.direction === 'Long' ? 1 : -1;
    const pnl = (exit - entry) * dirMult * 10000 * ((settings.pipValue || 10) / 10);

    onAddTrade({
      pair: newTrade.pair.toUpperCase(),
      direction: newTrade.direction,
      entry,
      exit,
      pnl: Math.round(pnl * 100) / 100
    });

    setNewTrade({ pair: '', direction: 'Long', entry: '', exit: '' });
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, checked: !r.checked } : r));
  };

  const getTip = () => {
    if (todayTrades.length === 0) return "First trade of the day sets the tone. Make it count!";
    if (todayTrades.length === 1) return "One down. Stay disciplined on the next ones.";
    if (todayTrades.length === maxTradesPerDay - 1) return "Final trade of the day. Make it your best one.";
    if (todayTrades.length >= maxTradesPerDay) return "All trades done! Review and prepare for tomorrow.";
    return "Focus on quality over quantity. Follow your plan.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-4">
      {/* Rules Check Modal */}
      {showRulesCheck && !allRulesChecked && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-blue-500/30">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-blue-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Ready to Trade?</h2>
              <p className="text-slate-400 text-sm">Check all rules before you start</p>
            </div>

            <div className="space-y-3 mb-6">
              {rules.map(rule => (
                <label
                  key={rule.id}
                  className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={rule.checked}
                    onChange={() => toggleRule(rule.id)}
                    className="w-5 h-5 rounded border-slate-500"
                  />
                  <span className="text-sm">{rule.text}</span>
                </label>
              ))}
            </div>

            <button
              onClick={() => setShowRulesCheck(false)}
              disabled={!allRulesChecked}
              className={`w-full py-3 rounded-lg font-bold transition-colors ${allRulesChecked
                ? 'bg-green-600 hover:bg-green-500'
                : 'bg-slate-600 cursor-not-allowed'
                }`}
            >
              {allRulesChecked ? "Let's Trade! 🚀" : 'Check All Rules First'}
            </button>
          </div>
        </div>
      )}

      {/* Goal Hit Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-green-500/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl p-8 max-w-md w-full text-center">
            <Trophy className="mx-auto mb-4 text-yellow-500" size={80} />
            <h2 className="text-3xl font-bold mb-2">Goal Hit! 🎯</h2>
            <div className="text-5xl font-bold text-green-600 mb-4">
              {fmtUSD(todayPnl)}
            </div>
            <p className="text-slate-600 mb-6 text-lg">
              You hit your daily goal of {fmtUSD(dailyGoalAmount)}!
            </p>
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
              <p className="font-bold text-yellow-800 mb-2">⚠️ Stop Now</p>
              <p className="text-sm text-yellow-700">
                Overtrading after hitting your goal is the #1 way to give profits back.
                Close the app and celebrate your win!
              </p>
            </div>
            <button
              onClick={() => setShowGoalModal(false)}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-500"
            >
              I'm Done For Today ✓
            </button>
          </div>
        </div>
      )}

      {/* Max Loss Modal */}
      {showLossModal && (
        <div className="fixed inset-0 bg-red-500/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl p-8 max-w-md w-full text-center">
            <AlertTriangle className="mx-auto mb-4 text-red-500" size={80} />
            <h2 className="text-3xl font-bold mb-2">Daily Loss Limit Hit</h2>
            <div className="text-5xl font-bold text-red-600 mb-4">
              {fmtUSD(todayPnl)}
            </div>
            <p className="text-slate-600 mb-6 text-lg">
              You've hit your max daily loss of {fmtUSD(-maxDailyLossAmount)}
            </p>
            <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 mb-6">
              <p className="font-bold text-red-800 mb-2">🛑 STOP TRADING</p>
              <p className="text-sm text-red-700">
                Trading is now locked for today. Revenge trading will only make it worse.
                Review your trades, learn, and come back fresh tomorrow.
              </p>
            </div>
            <button
              onClick={() => setShowLossModal(false)}
              className="w-full py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-500"
            >
              Close App
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="text-yellow-400" size={28} />
              AQT Flip Mode
            </h1>
            <p className="text-sm text-slate-400">Simple. Focused. Profitable.</p>
          </div>
          <button
            onClick={onSwitchMode}
            className="px-4 py-2 bg-slate-800 rounded-lg text-sm hover:bg-slate-700 flex items-center gap-2"
          >
            <Eye size={16} />
            Pro Mode
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Big Balance Display */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

          <div className="relative z-10">
            <p className="text-blue-200 text-sm mb-2">Account Balance</p>
            <h2 className="text-6xl font-bold mb-4">{fmtUSD(balance)}</h2>

            {/* Flip Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-blue-200">${startBalance}</span>
                <span className="text-blue-100 font-bold">{progressPercent.toFixed(1)}% to goal</span>
                <span className="text-blue-200">${targetBalance}</span>
              </div>
              <div className="h-3 bg-blue-900/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-green-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                />
              </div>
            </div>

            {/* Today's Performance */}
            <div className="flex justify-around items-center pt-4 border-t border-blue-400/30">
              <div>
                <p className="text-blue-200 text-xs mb-1">Today's P&L</p>
                <p className={`text-2xl font-bold ${todayPnl >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {todayPnl >= 0 ? '+' : ''}{fmtUSD(todayPnl)}
                </p>
              </div>
              <div>
                <p className="text-blue-200 text-xs mb-1">Total Profit</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {totalPnL >= 0 ? '+' : ''}{fmtUSD(totalPnL)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Goal Tracker */}
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Target className="text-green-400" size={20} />
              <span className="font-bold">Daily Goal</span>
            </div>
            <span className={`text-xl font-bold ${todayPnl >= dailyGoalAmount ? 'text-green-400' : 'text-white'}`}>
              {Math.round(todayGoalPercent)}%
            </span>
          </div>

          <div className="h-4 bg-slate-700 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-500 ${todayPnl >= dailyGoalAmount ? 'bg-green-500' : 'bg-blue-500'
                }`}
              style={{ width: `${Math.min(100, todayGoalPercent)}%` }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-400">{fmtUSD(Math.max(0, todayPnl))} / {fmtUSD(dailyGoalAmount)}</span>
            <span className="text-slate-400">{fmtUSD(Math.max(0, dailyGoalAmount - todayPnl))} to go</span>
          </div>
        </div>

        {/* Trade Limits */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className={todayTrades.length >= maxTradesPerDay ? 'text-red-400' : 'text-yellow-400'} size={20} />
              <span className="text-sm text-slate-400">Trades Today</span>
            </div>
            <p className="text-3xl font-bold">{todayTrades.length}/{maxTradesPerDay}</p>
            {todayTrades.length >= maxTradesPerDay && (
              <p className="text-xs text-red-400 mt-1">Limit reached!</p>
            )}
          </div>

          <div className="bg-slate-800 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="text-blue-400" size={20} />
              <span className="text-sm text-slate-400">Win Rate</span>
            </div>
            <p className="text-3xl font-bold">
              {todayTrades.length > 0 ? Math.round((wins / todayTrades.length) * 100) : 0}%
            </p>
            <p className="text-xs text-slate-400 mt-1">{wins}W / {losses}L</p>
          </div>
        </div>

        {/* Quick Trade Entry */}
        {!showGoalModal && !showLossModal && todayTrades.length < maxTradesPerDay && (
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <DollarSign className="text-green-400" size={20} />
              Quick Trade Entry
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Pair</label>
                <input
                  type="text"
                  placeholder="EURUSD"
                  value={newTrade.pair}
                  onChange={(e) => setNewTrade({ ...newTrade, pair: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Direction</label>
                <select
                  value={newTrade.direction}
                  onChange={(e) => setNewTrade({ ...newTrade, direction: e.target.value as Direction })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="Long">Long</option>
                  <option value="Short">Short</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Entry Price</label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="1.0850"
                  value={newTrade.entry}
                  onChange={(e) => setNewTrade({ ...newTrade, entry: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Exit Price</label>
                <input
                  type="number"
                  step="0.0001"
                  placeholder="1.0900"
                  value={newTrade.exit}
                  onChange={(e) => setNewTrade({ ...newTrade, exit: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            <button
              onClick={handleAddTrade}
              className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-colors"
            >
              Log Trade
            </button>
          </div>
        )}

        {todayTrades.length >= maxTradesPerDay && !showGoalModal && (
          <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-xl p-4 text-center">
            <Lock className="mx-auto mb-2 text-yellow-400" size={32} />
            <p className="font-bold text-yellow-400 mb-1">Trade Limit Reached</p>
            <p className="text-sm text-yellow-200">Max {maxTradesPerDay} trades per day. Come back tomorrow.</p>
          </div>
        )}

        {/* Today's Trades */}
        {todayTrades.length > 0 && (
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="font-bold mb-4">Today's Trades</h3>
            <div className="space-y-2">
              {todayTrades.map(trade => (
                <div key={trade.id} className="bg-slate-700/50 rounded-lg p-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 rounded text-xs font-bold ${trade.direction === 'Long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                      {trade.direction}
                    </div>
                    <div>
                      <p className="font-bold">{trade.pair}</p>
                      <p className="text-xs text-slate-400">{trade.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.pnl >= 0 ? '+' : ''}{fmtUSD(trade.pnl)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Motivational Footer */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-center">
          <p className="text-xl font-bold mb-2">💡 Today's Tip</p>
          <p className="text-purple-100">{getTip()}</p>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Main ---------------- */
const AQTApp: React.FC = () => {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Local State (hydrated from Firebase if available)
  const [balance, setBalance] = useState<number>(1000);
  const [balanceInput, setBalanceInput] = useState<string>("1000");
  const [broker, setBroker] = useState<string>("PlexyTrade");
  const [leverage, setLeverage] = useState<string>(BROKERS["PlexyTrade"]?.default || "1:500");
  const [safeMode, setSafeMode] = useState<boolean>(true);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [taxBracketIndex, setTaxBracketIndex] = useState<number>(2);
  const [isSection1256, setIsSection1256] = useState<boolean>(false);
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    pipValue: 10,
    stopLoss: 15,
    profitTarget: 30,
    dailyGrowth: 5,
    maxDailyLoss: 5,
    maxTradesPerDay: 3,
    startBalance: 100,
    targetBalance: 1000
  });
  const [isFlipMode, setIsFlipMode] = useState(false);

  // Component Integration State
  const [showHelp, setShowHelp] = useState(false);
  const [showRRCalculator, setShowRRCalculator] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState(200);
  const [monthlyGoal, setMonthlyGoal] = useState(800);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [filters, setFilters] = useState<{ pair: string; direction: "" | Direction; minPnl: string; maxPnl: string }>({ pair: "", direction: "", minPnl: "", maxPnl: "" });
  const [notesModalTradeId, setNotesModalTradeId] = useState<string | null>(null);
  const notesTrade = useMemo(() => trades.find((t) => t.id === notesModalTradeId) ?? null, [trades, notesModalTradeId]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const initialTradeState: TradeInput = useMemo(() => ({ pair: "", direction: "Long", entry: "", exit: "", lots: "", setup: "Breakout", emotion: "Calm", notes: "" }), []);
  const [newTrade, setNewTrade] = useState<TradeInput>(initialTradeState);

  // Refs
  const entryRef = useRef<HTMLInputElement>(null);
  const exitRef = useRef<HTMLInputElement>(null);
  const lotsRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  // Auth providers
  const googleProvider = useMemo(() => new GoogleAuthProvider(), []);
  const twitterProvider = useMemo(() => new TwitterAuthProvider(), []);

  // --- Auth & Data Effects (only if Firebase is ready) ---
  useEffect(() => {
    if (!firebaseReady || !auth) {
      setIsLoading(false); // Local mode – no cloud sync
      return;
    }
    const initAuth = async () => {
      try {
        const token = process.env.NEXT_PUBLIC_FIREBASE_CUSTOM_TOKEN;
        if (token) await signInWithCustomToken(auth, token);
        else await signInAnonymously(auth);
      } catch (e) {
        console.warn("[AQT] Auth failed; staying in Local Mode:", e);
      }
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Sync Trades from Firebase
  useEffect(() => {
    if (!firebaseReady || !db || !user) return;
    const tradesCol = collection(db, "artifacts", APP_ID, "users", user.uid, "trades");
    const unsubscribe = onSnapshot(tradesCol, (snapshot) => {
      const remoteTrades = snapshot.docs.map(doc => doc.data() as Trade);
      remoteTrades.sort((a, b) => b.ts - a.ts);
      setTrades(remoteTrades);
    });
    return () => unsubscribe();
  }, [user]);

  // Sync Settings from Firebase (Read)
  useEffect(() => {
    if (!firebaseReady || !db || !user) return;
    const settingsRef = doc(db, "artifacts", APP_ID, "users", user.uid, "data", "settings");
    const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as any;
        if (data.balance !== undefined) { setBalance(data.balance); setBalanceInput(String(data.balance)); }
        if (data.broker !== undefined) setBroker(data.broker);
        if (data.leverage !== undefined) setLeverage(data.leverage);
        if (data.safeMode !== undefined) setSafeMode(data.safeMode);
        if (data.taxBracketIndex !== undefined) setTaxBracketIndex(data.taxBracketIndex);
        if (data.isSection1256 !== undefined) setIsSection1256(data.isSection1256);
        if (data.darkMode !== undefined) setDarkMode(data.darkMode);
        if (data.globalSettings !== undefined) setGlobalSettings(data.globalSettings);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Sync Settings to Firebase (Write - Debounced)
  useEffect(() => {
    if (!firebaseReady || !db || !user) return;
    const settingsRef = doc(db, "artifacts", APP_ID, "users", user.uid, "data", "settings");
    const payload = {
      balance,
      broker,
      leverage,
      safeMode,
      taxBracketIndex,
      isSection1256,
      darkMode,
      globalSettings
    };
    const t = setTimeout(() => {
      setDoc(settingsRef, payload, { merge: true }).catch(e => console.error("Sync error", e));
    }, 1000);
    return () => clearTimeout(t);
  }, [user, balance, broker, leverage, safeMode, taxBracketIndex, isSection1256, darkMode, globalSettings]);

  // Standard Effects
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", darkMode);
    }
  }, [darkMode]);
  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      const num = safeParseNumber(balanceInput);
      if (num !== balance) setBalance(num);
    }, 400);
    return () => clearTimeout(t);
  }, [balanceInput, balance]);
  useEffect(() => { const t = setTimeout(() => setIsLoading(false), 600); return () => clearTimeout(t); }, []);

  // Migration for old broker key
  useEffect(() => { if (broker === "Hugo’s Way") setBroker("Hugo's Way"); }, [broker]);

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") Notification.requestPermission().catch(() => { });
  }, []);

  // Session alerts
  useEffect(() => {
    if (!alertsEnabled || !("Notification" in window)) return;
    const sessionOpen = (tz: string, openH: number) => {
      const nowTz = new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
      return nowTz.getHours() === openH && nowTz.getMinutes() === 0 && nowTz.getSeconds() === 0;
    };
    if (Notification.permission === "granted") {
      if (sessionOpen('Europe/London', 8)) new Notification("MARKET ALERT: London Open", { body: "08:00 London Time - High Volatility", icon: "/favicon.ico" });
      if (sessionOpen('America/New_York', 8)) new Notification("MARKET ALERT: New York Open", { body: "08:00 New York Time - Session Start", icon: "/favicon.ico" });
    }
  }, [currentTime, alertsEnabled]);

  // Derived
  const pairMeta = useMemo(() => getPairMetadata(newTrade.pair), [newTrade.pair]);
  const brokerMinLot = BROKERS[broker]?.minLot ?? 0.01;

  const metrics = useMemo(
    () => calculateTradingMetrics(balance, broker, safeMode, BROKERS, globalSettings, leverage),
    [balance, broker, safeMode, leverage, globalSettings]
  );
  const { currentTier, lotSize, dailyGoal, maxLoss, targetWin, riskRewardRatio, progress, pipValueForLot } = metrics;

  const beBufferPips = BROKER_BE_BUFFER[broker] ?? 0;

  const effectiveLots = useMemo(() => {
    const raw = safeParseNumber(newTrade.lots);
    if (newTrade.lots && raw >= brokerMinLot) {
      const snapped = Math.max(brokerMinLot, Math.round(raw / brokerMinLot) * brokerMinLot);
      return parseFloat(snapped.toFixed(3));
    }
    return lotSize;
  }, [newTrade.lots, brokerMinLot, lotSize]);

  const pipValueForLotEffective = effectiveLots * globalSettings.pipValue;
  const previewPnL = useMemo(
    () => calculatePnL(newTrade, pipValueForLotEffective, BROKER_BE_BUFFER[broker] ?? 0),
    [newTrade, pipValueForLotEffective, broker]
  );

  const marginRequiredEffective = useMemo(() => {
    const levNum = Math.max(1, parseInt(leverage.replace("1:", "").replace("Unlimited", "2000"), 10) || 500);
    const contractSize = getContractSize(pairMeta);
    const proxyPrice = safeParseNumber(pairMeta.placeholder);
    return balance > 0 && effectiveLots > 0 ? round2((effectiveLots * contractSize * proxyPrice) / levNum) : 0;
  }, [balance, effectiveLots, leverage, pairMeta]);

  const maxLossEffective = useMemo(
    () => round2(pipValueForLotEffective * globalSettings.stopLoss),
    [pipValueForLotEffective, globalSettings.stopLoss]
  );

  const previewR = maxLossEffective > 0 ? (previewPnL / maxLossEffective) : 0;

  const isFormValid = useMemo(() => {
    const errs = validateTradeInputs(newTrade, brokerMinLot);
    setValidationErrors(errs);
    return errs.length === 0;
  }, [newTrade, brokerMinLot]);

  const todayKey = useMemo(() => localDayKey(currentTime), [currentTime]);
  const todayPnl = useMemo(() => trades.filter(t => t.date === todayKey).reduce((s, t) => s + t.pnl, 0), [trades, todayKey]);
  const totalPnL = useMemo(() => trades.reduce((acc, t) => acc + t.pnl, 0), [trades]);

  const balanceHistory = useMemo(() => {
    const baseline = round2(balance - totalPnL);
    const points = [{ trade: 0, balance: baseline }];
    for (let i = trades.length - 1; i >= 0; i--) {
      const prev = points[points.length - 1].balance;
      points.push({ trade: points.length, balance: round2(prev + trades[i].pnl) });
    }
    return points;
  }, [trades, balance, totalPnL]);

  const riskMetrics = useMemo(() => calculateRiskMetrics(trades, balanceHistory), [trades, balanceHistory]);

  const { winsCount, lossesCount } = useMemo(() => {
    let w = 0, l = 0; for (const t of trades) { if (t.pnl > 0) w++; else if (t.pnl < 0) l++; }
    return { winsCount: w, lossesCount: l };
  }, [trades]);

  const filteredTrades = useMemo(() => {
    const min = filters.minPnl ? parseFloat(filters.minPnl) : -Infinity;
    const max = filters.maxPnl ? parseFloat(filters.maxPnl) : Infinity;
    return trades.filter((t) => {
      if (filters.pair && t.pair !== filters.pair.toUpperCase()) return false;
      if (filters.direction && t.direction !== filters.direction) return false;
      if (t.pnl < min || t.pnl > max) return false;
      return true;
    });
  }, [trades, filters]);

  const filteredTotal = useMemo(() => filteredTrades.reduce((s, t) => s + t.pnl, 0), [filteredTrades]);

  const sessionOpen = (tz: string, openH: number, closeH: number) => {
    const nowTz = new Date(currentTime.toLocaleString('en-US', { timeZone: tz }));
    const h = nowTz.getHours();
    return h >= openH && h < closeH;
  };
  const isLondonOpen = sessionOpen('Europe/London', 8, 17);
  const isNYOpen = sessionOpen('America/New_York', 8, 17);
  const isTokyoOpen = sessionOpen('Asia/Tokyo', 9, 18);

  const bracketRate = TAX_BRACKETS_2025[taxBracketIndex]?.rate ?? 0.22;
  const taxRate = activeTaxRate(isSection1256, bracketRate);
  const estimatedTax = Math.max(0, totalPnL) * taxRate;
  const netPocket = totalPnL - estimatedTax;

  // --- Auth actions (Google + Twitter + Sign out) ---
  const signInWithGoogle = async () => {
    if (!auth) {
      if (typeof window !== "undefined") {
        alert("Firebase not ready. Check your .env and Firebase initialization.");
      }
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err?.code === "auth/popup-blocked" || err?.code === "auth/popup-closed-by-user") {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr: any) {
          if (typeof window !== "undefined") {
            alert(`Google sign-in failed: ${redirectErr?.code || redirectErr?.message || redirectErr}`);
          }
          console.error("Redirect sign-in error:", redirectErr);
        }
      } else {
        if (typeof window !== "undefined") {
          alert(`Google sign-in failed: ${err?.code || err?.message || err}`);
        }
      }
    }
  };

  const signInWithTwitter = async () => {
    if (!auth) {
      if (typeof window !== "undefined") {
        alert("Firebase not ready. Check your .env & Firebase initialization.");
      }
      return;
    }
    try {
      await signInWithPopup(auth, twitterProvider);
    } catch (err: any) {
      if (err?.code === "auth/popup-blocked" || err?.code === "auth/popup-closed-by-user") {
        try {
          await signInWithRedirect(auth, twitterProvider);
        } catch (redirectErr: any) {
          if (typeof window !== "undefined") {
            alert(`Twitter sign-in failed: ${redirectErr?.code || redirectErr?.message || redirectErr}`);
          }
          console.error("Redirect sign-in error:", redirectErr);
        }
      } else {
        if (typeof window !== "undefined") {
          alert(`Twitter sign-in failed: ${err?.code || err?.message || err}`);
        }
      }
    }
  };

  const signOutAll = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (e: any) {
      if (typeof window !== "undefined") {
        alert(`Sign out error: ${e?.code || e?.message || e}`);
      }
    }
  };

  // --- Actions ---
  const addTrade = useCallback(async () => {
    if (!isFormValid) return;
    const beBuf = BROKER_BE_BUFFER[broker] ?? 0;
    const pnlValue = calculatePnL(newTrade, pipValueForLotEffective, beBuf);
    const normalized = normalizeTrade(newTrade, effectiveLots);
    const finalTrade = { ...normalized, pnl: pnlValue };

    // Optimistic Update
    setTrades(prev => [finalTrade, ...prev]);
    setBalance(prev => round2(prev + pnlValue));
    setBalanceInput(String(round2(balance + pnlValue)));

    // Persist to Firestore if available
    if (firebaseReady && db && user) {
      try {
        await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'trades', finalTrade.id), finalTrade);
      } catch (e) {
        console.error("Failed to save trade", e);
      }
    }
    setNewTrade(initialTradeState);
  }, [isFormValid, user, newTrade, pipValueForLotEffective, effectiveLots, balance, initialTradeState, broker]);

  const deleteTrade = useCallback(async (id: string) => {
    const trade = trades.find((t) => t.id === id);
    if (trade && typeof window !== "undefined" && window.confirm("Delete trade? Balance will be reverted.")) {
      const newBalance = round2(balance - trade.pnl);
      setBalance(newBalance);
      setBalanceInput(String(newBalance));
      setTrades((prev) => prev.filter((t) => t.id !== id));

      if (firebaseReady && db && user) {
        try {
          await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'trades', id));
        } catch (e) {
          console.error("Failed to delete trade", e);
        }
      }
    }
  }, [user, trades, balance]);

  const copyTrade = useCallback((trade: Trade) => {
    setNewTrade({
      pair: trade.pair,
      direction: trade.direction,
      entry: trade.entry.toString(),
      exit: trade.exit.toString(),
      lots: trade.lots.toString(),
      setup: (trade.setup as TradeSetup) || "Breakout",
      emotion: trade.emotion || "Calm",
      notes: "",
    });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const saveNotes = useCallback(async (id: string, notes: string) => {
    setTrades((p) => p.map((t) => (t.id === id ? { ...t, notes } : t)));
    setNotesModalTradeId(null);
    if (firebaseReady && db && user) {
      try {
        await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'trades', id), { notes }, { merge: true });
      } catch (e) {
        console.error("Failed to update notes", e);
      }
    }
  }, [user]);

  const applyTemplate = useCallback((name: string) => { const t = TRADE_TEMPLATES.find((temp) => temp.name === name); if (t) setNewTrade((p) => ({ ...p, pair: t.pair, setup: t.setup })); }, []);
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const onRestore = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(String(ev.target?.result || "{}"));
        if (!data || typeof data !== "object") throw new Error("Invalid");

        if (trades.length > 0) {
          const ok = typeof window !== "undefined" && window.confirm("This will overwrite current data. Continue?");
          if (!ok) return;
        }

        const newBalance = safeParseNumber(data.balance);
        setBalance(newBalance);
        setBalanceInput(String(newBalance));

        const cleanedTrades: Trade[] = (data.trades as any[] || []).map((t: any) => ({
          id: String(t.id ?? generateId()),
          pair: String(t.pair ?? ""),
          direction: (t.direction === "Short" ? "Short" : "Long") as Direction,
          entry: safeParseNumber(t.entry),
          exit: safeParseNumber(t.exit),
          date: t.ts ? localDayKey(new Date(t.ts)) : (t.date ? localDayKey(new Date(t.date)) : localDayKey(new Date())),
          time: String(t.time ?? formatTime(Date.now())),
          ts: typeof t.ts === "number" ? t.ts : Date.now(),
          lots: safeParseNumber(t.lots),
          pnl: safeParseNumber(t.pnl),
          setup: String(t.setup ?? ""),
          emotion: String(t.emotion ?? ""),
          notes: String(t.notes ?? ""),
        }));

        setTrades(cleanedTrades);
        if (data.settings) {
          const s = safeSettings(data.settings);
          setGlobalSettings(prev => ({ ...prev, ...s }));
        }

        if (firebaseReady && db && user) {
          cleanedTrades.forEach(t => {
            setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'trades', t.id), t);
          });
          setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'data', 'settings'), {
            balance: newBalance,
            globalSettings: data.settings ? { ...safeSettings(data.settings) } : globalSettings
          }, { merge: true });
        }
        alert("System restored successfully.");
      } catch {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  const clearAllTrades = async () => {
    const idsToDelete = trades.map(t => t.id);
    setTrades([]);
    if (firebaseReady && db && user) {
      for (const id of idsToDelete) {
        try { await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'trades', id)); }
        catch (e) { console.error("Delete error", id, e); }
      }
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || (e as any).isComposing) return;
      if (e.ctrlKey) {
        if (e.key.toLowerCase() === "enter") { e.preventDefault(); addTrade(); }
        if (e.key.toLowerCase() === "r") { e.preventDefault(); setNewTrade(initialTradeState); }
        if (e.key.toLowerCase() === "d" && trades.length > 0) {
          e.preventDefault();
          copyTrade(trades[0]);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [addTrade, initialTradeState, trades, copyTrade]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <h2 className="text-xl font-bold">AQT Trading Journal</h2>
        <p className="text-slate-500">Loading your data...</p>
      </div>
    );
  }

  // Handle Flip Mode
  const handleAddTradeForFlipMode = (tradeInput: Omit<Trade, 'id' | 'ts' | 'time' | 'date' | 'lots' | 'setup' | 'emotion' | 'notes'>) => {
    const ts = Date.now();
    const trade: Trade = {
      ...tradeInput,
      id: generateId(),
      ts,
      time: formatTime(ts),
      date: localDayKey(new Date(ts)),
      lots: 0.01,
      setup: 'Manual',
      emotion: 'Calm',
      notes: ''
    };

    setTrades(prev => [trade, ...prev]);
    setBalance(prev => Math.round((prev + trade.pnl) * 100) / 100);
    setBalanceInput(String(Math.round((balance + trade.pnl) * 100) / 100));

    // Persist to Firestore if available
    if (firebaseReady && db && user) {
      setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'trades', trade.id), trade).catch(e => {
        console.error("Failed to save trade", e);
      });
    }
  };

  if (isFlipMode) {
    return (
      <FlipMode
        balance={balance}
        trades={trades}
        settings={globalSettings}
        onAddTrade={handleAddTradeForFlipMode}
        onSwitchMode={() => setIsFlipMode(false)}
      />
    );
  }

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden pb-12 transition-colors duration-300 ${darkMode ? "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white" : "bg-white text-slate-800"}`}>
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
          #dashboard { max-width: 100% !important; padding: 0 !important; }
          .rounded-xl, .rounded-lg { border-radius: 0 !important; box-shadow: none !important; border: 1px solid #ddd !important; }
        }
      `}</style>

      <div className="print:hidden">
        <ErrorBoundary><TradingViewTicker darkMode={darkMode} /></ErrorBoundary>
      </div>

      <div className="max-w-7xl mx-auto space-y-4 p-4" id="dashboard">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center py-2">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                AQT <span className="text-blue-600 dark:text-blue-400">v2.8 Pro</span>
                {user ? (
                  <span className="inline-flex" aria-label="Synced to Cloud">
                    <Cloud size={16} className="text-green-500" />
                  </span>
                ) : (
                  <span className="inline-flex" aria-label="Local Mode">
                    <CloudOff size={16} className="text-slate-400" />
                  </span>
                )}
              </h1>
              <p className="text-slate-600 dark:text-blue-300 text-sm">Adaptive Quantitative Trading System</p>
            </div>

            {/* Sign-in buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={signInWithGoogle}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 dark:bg-white/10 border dark:border-white/20 dark:hover:bg-white/20 text-white text-sm transition-colors"
                aria-label="Sign in with Google"
              >
                Sign in with Google
              </button>
              <button
                onClick={signInWithTwitter}
                className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 dark:bg-slate-800 text-white dark:hover:bg-slate-700 flex items-center gap-2 text-sm border border-slate-600 dark:border-white/10 transition-colors"
                aria-label="Sign in with X (Twitter)"
              >
                <Twitter size={16} />
                Sign in with X
              </button>
              {user && (
                <button
                  onClick={signOutAll}
                  className="px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-500 text-sm"
                  aria-label="Sign out"
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0 print:hidden">
            <div className="hidden md:flex gap-2">
              <span className={`px-2 py-1 text-xs rounded ${isTokyoOpen ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`} aria-label={`Tokyo session ${isTokyoOpen ? 'active' : 'inactive'}`}>Tokyo</span>
              <span className={`px-2 py-1 text-xs rounded ${isLondonOpen ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`} aria-label={`London session ${isLondonOpen ? 'active' : 'inactive'}`}>London</span>
              <span className={`px-2 py-1 text-xs rounded ${isNYOpen ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`} aria-label={`New York session ${isNYOpen ? 'active' : 'inactive'}`}>New York</span>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-500 dark:text-slate-400">System Time</div>
              <div className="font-mono text-xl">{currentTime.toLocaleTimeString()}</div>
            </div>
            <button
              onClick={() => backupJSON({ version: "2.8-pro", timestamp: new Date().toISOString(), balance, trades, settings: { broker, leverage, safeMode, taxBracketIndex, isSection1256, darkMode, globalSettings } })}
              className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-all"
              aria-label="Backup"
            >
              <Download size={20} />
            </button>
            <label className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer" aria-label="Restore">
              <Upload size={20} className="text-slate-700 dark:text-slate-300" />
              <input type="file" accept=".json" onChange={(e) => e.target.files && onRestore(e.target.files[0])} className="hidden" />
            </label>
            <button
              onClick={() => setIsFlipMode(true)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-500 hover:to-blue-500 transition-all flex items-center gap-2 font-bold text-sm"
              title="Switch to Flip Mode"
            >
              <Zap size={16} />
              Flip Mode
            </button>
            <button onClick={() => setShowHelp(true)} className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 transition-all" aria-label="Help Guide"><HelpCircle size={20} /></button>
            <button onClick={() => setShowRRCalculator(true)} className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800 transition-all" aria-label="Risk/Reward Calculator"><Calculator size={20} /></button>
            <button onClick={() => setIsSettingsOpen(true)} className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"><SettingsIcon size={20} className="text-slate-700 dark:text-slate-300" /></button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"><Sun size={20} className="text-slate-700 dark:text-slate-300" /></button>
            <button onClick={handlePrint} className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-all"><Printer size={20} /></button>
          </div>
        </div>

        {/* ALERTS */}
        <WithdrawalAlert balance={balance} />

        {/* SUMMARY */}
        <PerformanceSummary metrics={riskMetrics} />

        {/* STREAK TRACKER */}
        <StreakTracker
          currentStreak={riskMetrics.currentStreak}
          longestStreak={riskMetrics.bestStreak}
          lastProfitableDay={trades.find(t => t.pnl > 0)?.date || null}
        />

        {/* GOALS & BENCHMARKS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <DailyGoalTracker current={todayPnl} target={dailyGoal} />
          <PerformanceBenchmarks winRate={riskMetrics.winRate} profitFactor={riskMetrics.profitFactor} tradesCount={trades.length} />
          <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">Total P&L</div>
              <div className={`text-xl font-bold ${totalPnL >= 0 ? "text-green-500" : "text-red-500"}`} aria-live="polite">{fmtUSD(totalPnL)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">Account</div>
              <div className="text-xl font-bold dark:text-white" aria-live="polite">{fmtUSD(balance)}</div>
            </div>
          </div>
        </div>

        {/* MILESTONES */}
        <PerformanceMilestones trades={trades} balance={balance} />

        {/* WEEKLY & MONTHLY GOALS */}
        <WeeklyGoals
          trades={trades}
          weeklyGoal={weeklyGoal}
          monthlyGoal={monthlyGoal}
          onUpdateWeeklyGoal={setWeeklyGoal}
          onUpdateMonthlyGoal={setMonthlyGoal}
        />

        {/* CONFIGURATION */}
        <CollapsibleSection title="Configuration" icon={Shield}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="text-blue-700 dark:text-blue-200 text-xs font-bold uppercase tracking-wider mb-2 block">Balance ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-blue-600 dark:text-blue-400">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={balanceInput}
                  onChange={(e) => setBalanceInput(e.target.value.replace(/[^\d.-]/g, ""))}
                  className="w-full pl-8 pr-4 py-2 bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-white/20 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg"
                />
              </div>
            </div>
            <div>
              <label className="text-blue-700 dark:text-blue-200 text-xs font-bold uppercase tracking-wider mb-2 block">Broker & Lev</label>
              <div className="flex gap-2">
                <select
                  value={broker}
                  onChange={(e) => {
                    const b = e.target.value;
                    setBroker(b);
                    const nextLev = BROKERS[b]?.default ?? BROKERS[b]?.leverage?.[0] ?? leverage;
                    setLeverage(nextLev);
                  }}
                  className="w-full px-2 py-2 bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-white/20 rounded-lg text-slate-900 dark:text-white text-sm"
                >
                  {Object.keys(BROKERS).map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <select
                  value={leverage}
                  onChange={(e) => setLeverage(e.target.value)}
                  className="w-24 px-2 py-2 bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-white/20 rounded-lg text-slate-900 dark:text-white text-sm"
                >
                  {(BROKERS[broker]?.leverage ?? [leverage]).map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 text-right">{BROKERS[broker]?.regulation ?? "—"}</div>
            </div>
            <div>
              <label className="text-blue-700 dark:text-blue-200 text-xs font-bold uppercase tracking-wider mb-2 block">Risk Mode</label>
              <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg border border-slate-300 dark:border-white/20">
                <button type="button" onClick={() => setSafeMode(true)} className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${safeMode ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" : "text-slate-400"}`}>Safe</button>
                <button type="button" onClick={() => setSafeMode(false)} className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${!safeMode ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400" : "text-slate-400"}`}>Aggressive</button>
              </div>
            </div>
            <div>
              <label className="text-blue-700 dark:text-blue-200 text-xs font-bold uppercase tracking-wider mb-2 block">Tax (2025)</label>
              <select value={taxBracketIndex} onChange={(e) => setTaxBracketIndex(parseInt(e.target.value, 10))} className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm">
                {TAX_BRACKETS_2025.map((b, i) => <option key={i} value={i}>{b.label}</option>)}
              </select>
              <div className="mt-2 text-xs flex items-center gap-2">
                <label className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <input type="checkbox" checked={isSection1256} onChange={(e) => setIsSection1256(e.target.checked)} />
                  <span>Use §1256 (60/40)</span>
                </label>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* METRICS & RISK */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gradient-to-br dark:from-blue-600/20 dark:to-indigo-600/20 rounded-xl p-6 border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-sm dark:shadow-none">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><TrendingUp size={20} /> Tier Status</h3>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between border-b border-slate-200 dark:border-white/10 pb-2"><span className="text-blue-700 dark:text-blue-200">Current Tier</span><span className="font-bold text-green-600 dark:text-green-400 text-lg">{currentTier.name}</span></div>
              <div className="w-full bg-slate-200 dark:bg-black/30 h-3 rounded-full overflow-hidden"><div className="bg-gradient-to-r from-blue-400 to-green-400 h-full transition-all duration-1000" style={{ width: `${progress}%` }} /></div>
              <p className="text-xs text-slate-500 dark:text-blue-300 italic">
                {metrics.nextTier ? `${fmtUSD(Math.max(0, metrics.nextTier.min - balance))} to reach ${metrics.nextTier.name}` : currentTier.desc}
              </p>
            </div>
          </div>

          <div className={`rounded-xl p-6 border border-slate-200 dark:border-white/10 relative overflow-hidden transition-colors duration-500 shadow-sm dark:shadow-none ${safeMode ? "bg-emerald-50 dark:bg-emerald-600/20" : "bg-orange-50 dark:bg-orange-600/20"}`}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><Target size={20} /> Risk Controls</h3>
            <div className="space-y-2 relative z-10 text-sm">
              <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-white/10"><span className="text-slate-700 dark:text-white">Rec. Lots</span><span className="font-bold text-xl text-slate-900 dark:text-white">{lotSize}</span></div>
              <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-white/10"><span className="text-slate-700 dark:text-white">Max Loss</span><span className="font-bold text-red-600 dark:text-red-300">{fmtUSD(maxLoss)}</span></div>
              <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-white/10"><span className="text-slate-700 dark:text-white">Target Win</span><span className="font-bold text-emerald-600 dark:text-emerald-300">{fmtUSD(targetWin)}</span></div>
              <div className="flex justify-between"><span className="text-slate-700 dark:text-white">Est. R:R</span><span className="font-mono text-blue-600 dark:text-blue-200">1:{riskRewardRatio}</span></div>
              <div className="flex justify-between"><span className="text-slate-700 dark:text-white">Margin ({(newTrade.pair || "EURUSD").toUpperCase()})</span><span className="font-mono text-blue-600 dark:text-blue-200">{fmtUSD(marginRequiredEffective)}</span></div>
              <div className="flex justify-between pt-1"><span className="text-slate-700 dark:text-white">Lots In Use</span><span className="font-mono text-slate-900 dark:text-white font-bold">{effectiveLots}</span></div>
              <div className="flex justify-between"><span className="text-slate-700 dark:text-white">BE Buffer</span><span className="font-mono text-slate-900 dark:text-white">{beBufferPips} pips</span></div>
              <RiskOfRuinCalculator winRate={riskMetrics.winRate} riskPerTradePct={balance > 0 ? Math.max(0.01, (maxLossEffective / balance) * 100) : 0} />
            </div>
          </div>

          <div className="bg-white dark:bg-gradient-to-br dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-sm dark:shadow-none">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <Calculator size={20} /> Tax Est.
                <span className="ml-2 text-[10px] text-slate-400 font-normal">(estimate; excludes state taxes)</span>
              </h3>
              <button onClick={() => setIsSection1256(!isSection1256)} className="text-[10px] px-2 py-1 rounded border border-slate-500">Mode</button>
            </div>
            <div className="space-y-3 relative z-10 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>Gross P&L</span><span className={totalPnL >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>{fmtUSD(totalPnL)}</span></div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300"><span title="Estimated based on filing status & location">Est. Tax ({(taxRate * 100).toFixed(1)}%)</span><span className="text-red-500 dark:text-red-300">{fmtUSD(-estimatedTax)}</span></div>
              <div className="border-t border-slate-200 dark:border-white/20 pt-2 flex justify-between"><span className="font-bold text-slate-800 dark:text-white">Net Pocket</span><span className={`font-bold text-lg ${netPocket >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{fmtUSD(netPocket)}</span></div>
            </div>
          </div>
        </div>

        {/* DEEP ANALYTICS */}
        {trades.length > 0 && (
          <CollapsibleSection title="Deep Analytics" icon={BarChart2}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <EnhancedTradeHeatmap trades={trades} />
              <SetupPerformanceAnalysis trades={trades} />
              <PairPerformanceSummary trades={trades} />
            </div>
          </CollapsibleSection>
        )}

        {/* BROKER COMMISSION MODELS */}
        <CollapsibleSection title="Broker Commission Models" icon={Calculator} defaultOpen={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-300">
                  <th className="py-2 pr-3 text-left">Broker</th>
                  <th className="py-2 pr-3 text-left">Model</th>
                  <th className="py-2 pr-3 text-left">Pricing</th>
                  <th className="py-2 pr-3 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {BROKER_MODELS.map((b) =>
                  b.models.map((m, i) => (
                    <tr key={`${b.name}-${m.label}`} className="border-b border-slate-100 dark:border-white/5">
                      {i === 0 && (
                        <td rowSpan={b.models.length} className="py-3 pr-3 font-bold align-top text-slate-800 dark:text-white">
                          {b.name}
                        </td>
                      )}
                      <td className="py-3 pr-3 text-slate-700 dark:text-slate-300">{m.label}</td>
                      <td className="py-3 pr-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold border
                          ${m.commission
                            ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                            : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"}`}>
                          {m.commission ? "Spread + Commission" : "Spread-Only"}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-slate-500 dark:text-slate-400">{m.note}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              Note: labels & fees vary by <em>account type</em> and <em>region</em>. Use your broker's official specs for exact numbers.
            </div>
          </div>
        </CollapsibleSection>

        {/* ENTRY */}
        <CollapsibleSection title="Trade Entry" icon={DollarSign} defaultOpen={true}>
          <div className="flex flex-col md:flex-row gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-white/10">
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">Quick Fill Template</label>
              <div className="flex gap-2">
                <select onChange={(e) => e.target.value && applyTemplate(e.target.value)} className="w-full bg-slate-100 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded px-3 py-2 text-sm dark:text-white" defaultValue="">
                  <option value="" disabled>Select...</option>
                  {TRADE_TEMPLATES.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">Setup Category</label>
              <select value={newTrade.setup} onChange={(e) => setNewTrade({ ...newTrade, setup: e.target.value as TradeSetup })} className="w-full bg-slate-100 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded px-3 py-2 text-sm dark:text-white">
                {TRADE_SETUPS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="col-span-2 md:col-span-1"><label className="text-xs text-blue-700 dark:text-blue-200 block mb-1">Pair</label><input type="text" placeholder="EURUSD" value={newTrade.pair} list={listId} onChange={(e) => setNewTrade({ ...newTrade, pair: e.target.value.toUpperCase() })} onKeyDown={(e) => e.key === "Enter" && entryRef.current?.focus()} className="w-full pl-8 pr-4 py-2 bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg" /><datalist id={listId}>{COMMON_PAIRS.map((p) => <option key={p} value={p} />)}</datalist></div>
            <div><label className="text-xs text-blue-700 dark:text-blue-200 block mb-1">Dir</label><select value={newTrade.direction} onChange={(e) => setNewTrade({ ...newTrade, direction: e.target.value as Direction })} className="w-full bg-slate-100 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded px-3 py-3 text-sm dark:text-white"><option value="Long">Long</option><option value="Short">Short</option></select></div>
            <div><label className="text-xs text-blue-700 dark:text-blue-200 block mb-1">Entry</label><input ref={entryRef} type="number" placeholder={pairMeta.placeholder} step={pairMeta.step} value={newTrade.entry} onChange={(e) => setNewTrade({ ...newTrade, entry: e.target.value })} onKeyDown={(e) => e.key === "Enter" && exitRef.current?.focus()} className="w-full bg-slate-100 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded px-3 py-3 dark:text-white" /></div>
            <div><label className="text-xs text-blue-700 dark:text-blue-200 block mb-1">Exit</label><input ref={exitRef} type="number" placeholder={pairMeta.placeholder} step={pairMeta.step} value={newTrade.exit} onChange={(e) => setNewTrade({ ...newTrade, exit: e.target.value })} onKeyDown={(e) => e.key === "Enter" && lotsRef.current?.focus()} className="w-full bg-slate-100 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded px-3 py-3 dark:text-white" /></div>
            <div><label className="text-xs text-blue-700 dark:text-blue-200 block mb-1">Lots</label><input ref={lotsRef} type="number" placeholder={`Rec: ${lotSize}`} step={brokerMinLot} value={newTrade.lots} onChange={(e) => setNewTrade({ ...newTrade, lots: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addTrade()} className="w-full bg-slate-100 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded px-3 py-3 dark:text-white" />
              <div className="text-[10px] text-slate-500 mt-1 dark:text-slate-400">
                {newTrade.lots ? `Override active` : `Using Rec: ${lotSize}`}
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 flex justify-between items-center" aria-live="polite">
            <div className="text-xs text-slate-500">Live Preview (with {effectiveLots} lots):</div>
            <div className="flex items-center gap-4"><div className={`text-lg font-bold ${previewPnL >= 0 ? "text-green-500" : "text-red-500"}`} aria-live="polite">{previewPnL >= 0 ? "+" : ""}{fmtUSD(previewPnL)}</div><div className="text-xs px-2 py-1 bg-slate-200 dark:bg-white/10 rounded text-slate-600 dark:text-slate-300">{previewR >= 0 ? "+" : ""}{previewR.toFixed(2)}R</div></div>
          </div>
          {beBufferPips > 0 && (
            <div className="mt-2 text-[11px] rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 px-2 py-1 flex items-center gap-2">
              <AlertTriangle size={14} />
              Reality Check: on {broker}, a "breakeven" stop is a net loss. You need ~+{beBufferPips} pips to cover spread + commission.
            </div>
          )}
          {validationErrors.length > 0 && (<ul className="mt-3 text-sm text-red-600 list-disc list-inside">{validationErrors.map((e, i) => <li key={i}>{e}</li>)}</ul>)}
          <div className="mt-4 flex gap-3"><button type="button" onClick={addTrade} disabled={!isFormValid} className={`flex-1 font-bold py-3 rounded-lg text-lg shadow-xl ${isFormValid ? "bg-blue-600 text-white" : "bg-slate-300 dark:bg-slate-700 text-slate-500"}`}>{isFormValid ? "Log Trade" : "Enter Details"}</button><button type="button" onClick={() => setNewTrade(initialTradeState)} className="px-4 py-3 rounded-lg bg-slate-200 dark:bg-slate-800">Reset</button></div>
        </CollapsibleSection>

        {/* CHARTS */}
        {trades.length > 0 && (
          <CollapsibleSection title="Performance Charts" icon={PieIcon} defaultOpen={false}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-slate-100 dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10">
                <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Growth Curve</h3>
                <ErrorBoundary><ResponsiveContainer width="100%" height={220}><LineChart data={balanceHistory}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="trade" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} domain={["dataMin - 5", "dataMax + 5"]} /><Tooltip formatter={(val: number, name: string) => [fmtUSD(val), name]} /><Line type="monotone" dataKey="balance" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></ErrorBoundary>
              </div>
              <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10">
                <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Win/Loss Ratio</h3>
                <ErrorBoundary><ResponsiveContainer width="100%" height={220}><PieChart><Pie data={[{ name: "Wins", value: winsCount }, { name: "Losses", value: lossesCount }]} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value"><Cell key="wins" fill="#10b981" /><Cell key="losses" fill="#ef4444" /></Pie><Tooltip formatter={(val: number, name: string) => [String(val), name]} /></PieChart></ResponsiveContainer></ErrorBoundary>
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* JOURNAL */}
        <CollapsibleSection title={`Journal (${trades.length})`} icon={Brain}>
          <div className="flex flex-wrap gap-2 items-end mb-4">
            <input placeholder="Pair" list={listId} value={filters.pair} onChange={(e) => setFilters(f => ({ ...f, pair: e.target.value.toUpperCase() }))} className="px-2 py-1 rounded border dark:border-white/10 bg-white dark:bg-slate-900" />
            <select value={filters.direction} onChange={(e) => setFilters(f => ({ ...f, direction: e.target.value as any }))} className="px-2 py-1 rounded border dark:border-white/10 bg-white dark:bg-slate-900"><option value="">All</option><option value="Long">Long</option><option value="Short">Short</option></select>
            <input placeholder="Min P&L" inputMode="decimal" value={filters.minPnl} onChange={(e) => setFilters(f => ({ ...f, minPnl: e.target.value }))} className="px-2 py-1 w-24 rounded border dark:border-white/10 bg-white dark:bg-slate-900" />
            <input placeholder="Max P&L" inputMode="decimal" value={filters.maxPnl} onChange={(e) => setFilters(f => ({ ...f, maxPnl: e.target.value }))} className="px-2 py-1 w-24 rounded border dark:border-white/10 bg-white dark:bg-slate-900" />
            <button type="button" onClick={() => setFilters({ pair: "", direction: "", minPnl: "", maxPnl: "" })} className="h-8 px-3 rounded bg-slate-200 dark:bg-slate-700 text-sm">Clear</button>
            <div className="ml-auto flex gap-2 items-center">
              <ClearAllTradesButton onClear={clearAllTrades} />
              <button type="button" onClick={() => exportToCSV(filteredTrades)} className="h-8 px-3 rounded bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 flex items-center gap-2" aria-label="Export CSV">
                <Download size={14} /> Export CSV
              </button>
              <label className="h-8 px-3 rounded bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer" aria-label="Restore">
                <Upload size={14} /> Restore
                <input type="file" accept=".json" className="hidden" onChange={(e) => e.target.files && onRestore(e.target.files[0])} />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-blue-600 dark:text-blue-300 border-b border-slate-200 dark:border-white/10">
                  <th scope="col" className="pb-3 pl-2">Time</th>
                  <th scope="col" className="pb-3">Pair</th>
                  <th scope="col" className="pb-3">Dir</th>
                  <th scope="col" className="pb-3">Setup</th>
                  <th scope="col" className="pb-3">Lots</th>
                  <th scope="col" className="pb-3">P&L</th>
                  <th scope="col" className="pb-3">Notes</th>
                  <th scope="col" className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.length === 0 && trades.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                          <DollarSign className="text-blue-600 dark:text-blue-400" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 dark:text-white">No Trades Yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">Start by entering your first trade above.</p>
                        <button
                          onClick={() => {
                            setNewTrade({ ...initialTradeState, pair: "EURUSD", entry: "1.0500", exit: "1.0550", lots: "1.00" });
                            setTimeout(() => {
                              if (typeof window !== "undefined") {
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }
                            }, 100);
                          }}
                          className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 transition-colors"
                        >
                          Fill Sample Trade
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filteredTrades.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <AlertTriangle className="text-yellow-500 mb-2" size={32} />
                        <h3 className="text-lg font-bold text-slate-700 dark:text-white">No Matching Trades</h3>
                        <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTrades.map((t) => (
                    <tr key={t.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="py-3 pl-2 text-slate-600 dark:text-white">{t.date} <span className="text-xs text-slate-400">{t.time}</span></td>
                      <td className="py-3 font-bold text-slate-800 dark:text-white">{t.pair}</td>
                      <td className="py-3"><span className={`px-2 py-0.5 rounded text-xs ${t.direction === "Long" ? "bg-green-100 text-green-700 dark:text-green-300 dark:bg-green-900/50" : "bg-red-100 text-red-700 dark:text-red-300 dark:bg-red-900/50"}`}>{t.direction}</span></td>
                      <td className="py-3 text-slate-500 dark:text-slate-400 text-xs">{t.setup}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-300 font-mono">{t.lots}</td>
                      <td className={`py-3 font-bold font-mono ${t.pnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{fmtUSD(t.pnl)}</td>
                      <td className="py-3"><button onClick={() => setNotesModalTradeId(t.id)} className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-300 hover:underline"><Edit3 size={14} /> {t.notes ? "Edit" : "Add"}</button></td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => copyTrade(t)} className="text-blue-400 hover:text-blue-600" aria-label="Copy"><ClipboardCopy size={14} /></button>
                          <button onClick={() => deleteTrade(t.id)} className="text-slate-400 hover:text-red-500" aria-label="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 dark:bg-white/5 font-mono">
                  <td className="py-2 pl-2 text-xs text-slate-500 dark:text-slate-400" colSpan={5}>Filtered total</td>
                  <td className={`py-2 font-bold ${filteredTotal >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {fmtUSD(filteredTotal)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CollapsibleSection>
      </div>

      <TradeNotesModal trade={notesTrade} isOpen={!!notesModalTradeId} onClose={() => setNotesModalTradeId(null)} onSave={saveNotes} />
      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={globalSettings} onSave={(s) => setGlobalSettings((prev) => ({ ...prev, ...s }))} />

      {/* Help Guide Modal */}
      <HelpGuide isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* Risk/Reward Calculator Modal */}
      {showRRCalculator && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowRRCalculator(false)}>
          <div className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <RiskRewardCalculator />
          </div>
        </div>
      )}

    </div>
  );
};

export default AQTApp;
