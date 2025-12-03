// AQTApp.tsx
'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useId,
} from 'react';

// Icons
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
  X as CloseIcon,
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
  LogIn,
  LogOut,
} from 'lucide-react';

// Charts
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
} from 'recharts';

/* ---------------- Firebase (inlined) ---------------- */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  GoogleAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  type User,
  type Auth,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  type Firestore,
} from 'firebase/firestore';

/* ---------------- Config ---------------- */
const APP_ID = 'aqt-journal';

// Prefer env, fallback to placeholder (so local mode still works)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

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
    console.warn('[AQT] Firebase config not found. Running in Local Mode.');
  }
} catch (e) {
  console.warn('[AQT] Firebase init failed; running Local Mode:', e);
  firebaseReady = false;
}

/* ---------------- Types ---------------- */
type Direction = 'Long' | 'Short';
type TradeSetup =
  | 'Breakout' | 'Pullback' | 'Reversal' | 'Range' | 'Trend Following'
  | 'SMC' | 'ICT' | 'The Strat' | 'CRT' | 'Wyckoff' | 'Elliott Wave'
  | 'Supply & Demand' | 'Support & Resistance' | 'Harmonic'
  | 'News' | 'Scalp' | 'Algo/Bot' | 'Fundamental';

type TradeInput = {
  pair: string;
  direction: Direction;
  entry: string;
  exit: string;
  lots: string;
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
};

type Tier = { name: string; min: number; max: number; pairs: number; suggestedPairs: string; desc: string };
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

type BrokerInfo = { minLot: number; leverage: string[]; default: string; regulation?: string };
type BrokerMap = Record<string, BrokerInfo>;

/* ---------------- Constants ---------------- */
const TRADE_SETUPS: TradeSetup[] = [
  'Breakout', 'Pullback', 'Reversal', 'Range', 'Trend Following',
  'SMC', 'ICT', 'The Strat', 'CRT', 'Wyckoff', 'Elliott Wave',
  'Supply & Demand', 'Support & Resistance', 'Harmonic',
  'News', 'Scalp', 'Algo/Bot', 'Fundamental',
];

const COMMON_PAIRS = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'USDCAD', 'BTCUSD', 'ETHUSD', 'US30', 'NAS100', 'SPX500'];

const TIERS: Tier[] = [
  { name: 'SURVIVAL', min: 10, max: 19, pairs: 2, suggestedPairs: 'EURUSD, GBPUSD', desc: 'Capital preservation mode' },
  { name: 'BUILDING', min: 20, max: 49, pairs: 3, suggestedPairs: 'EURUSD, GBPUSD, USDJPY', desc: 'Steady growth phase' },
  { name: 'SCALING', min: 50, max: 99, pairs: 4, suggestedPairs: 'Majors + 1 Cross', desc: 'Accelerated scaling' },
  { name: 'GROWTH', min: 100, max: 249, pairs: 5, suggestedPairs: 'Majors + 2 Crosses', desc: 'Sustained growth' },
  { name: 'EXPANSION', min: 250, max: 499, pairs: 6, suggestedPairs: 'Majors + Crosses + Gold', desc: 'Portfolio expansion' },
  { name: 'ADVANCED', min: 500, max: 999, pairs: 7, suggestedPairs: 'Full Forex + Gold', desc: 'Advanced strategies' },
  { name: 'MASTERY', min: 1000, max: 2499, pairs: 8, suggestedPairs: 'Forex, Gold, Indices', desc: 'Full system mastery' },
  { name: 'ELITE', min: 2500, max: 4999, pairs: 10, suggestedPairs: 'Any Liquid Asset', desc: 'Elite trader status' },
  { name: 'LEGEND', min: 5000, max: 999999, pairs: 12, suggestedPairs: 'Full Market Access', desc: 'Legendary performance' },
];

const BROKERS: BrokerMap = {
  "PlexyTrade": { minLot: 0.01, leverage: ["1:100", "1:200", "1:400", "1:500", "1:1000", "1:2000"], default: "1:2000" },
  "OANDA": { minLot: 0.001, leverage: ["1:20", "1:30", "1:50"], default: "1:50" },
  "Forex.com": { minLot: 0.01, leverage: ["1:20", "1:30", "1:50"], default: "1:50" },
};

/* ---------------- Utils ---------------- */
const isBrowser = typeof window !== 'undefined';
const fmtUSD = (n: number) => n.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const safeParseNumber = (v: string | number): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const n = parseFloat(v); return Number.isFinite(n) ? n : 0;
};
const localDayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const getPairMetadata = (rawPair: string): PairMeta => {
  const pair = (rawPair || '').toUpperCase();
  if (pair.includes('JPY')) return { placeholder: '145.50', step: 0.01, multiplier: 100, isYen: true };
  if (pair.includes('XAU')) return { placeholder: '2350.10', step: 0.01, multiplier: 100, isGold: true };
  if (pair.includes('BTC') || pair.includes('ETH')) return { placeholder: '62000', step: 1, multiplier: 1, isCrypto: true };
  if (pair.includes('US30') || pair.includes('NAS') || pair.includes('SPX')) return { placeholder: '35000', step: 1, multiplier: 1, isIndex: true };
  return { placeholder: '1.0850', step: 0.0001, multiplier: 10000 };
};
const getContractSize = (meta: PairMeta) => meta.isGold ? 100 : meta.isIndex ? 1 : meta.isCrypto ? 1 : 100000;

/* ---------------- Calculations ---------------- */
const normalizeTrade = (trade: TradeInput, lotSize: number): Omit<Trade, 'pnl'> => {
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

const calculatePnL = (trade: { entry: string | number; exit: string | number; pair: string; direction: Direction }, pipValueForLot: number) => {
  const entryNum = safeParseNumber(trade.entry);
  const exitNum = safeParseNumber(trade.exit);
  if (!entryNum || !exitNum || entryNum === exitNum) return 0;
  const meta = getPairMetadata(trade.pair);
  const dirMult = trade.direction === 'Long' ? 1 : -1;
  return round2((exitNum - entryNum) * dirMult * meta.multiplier * pipValueForLot);
};

const calculateMaxDrawdown = (series: { balance: number }[]): number => {
  let peak = series[0]?.balance ?? 0, maxDD = 0;
  for (const p of series) {
    peak = Math.max(peak, p.balance);
    const dd = peak > 0 ? (peak - p.balance) / peak : 0;
    maxDD = Math.max(maxDD, dd);
  }
  return maxDD * 100;
};

const calculateRiskMetrics = (trades: Trade[], balanceHistory: { balance: number }[]): RiskMetrics => {
  const total = trades.length;
  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl < 0);
  const sumWins = wins.reduce((s, t) => s + t.pnl, 0);
  const sumLosses = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));

  const winRate = total ? (wins.length / total) * 100 : 0;
  const averageWin = wins.length ? sumWins / wins.length : 0;
  const averageLoss = losses.length ? -sumLosses / losses.length : 0;
  const profitFactor = sumLosses ? sumWins / sumLosses : (sumWins ? Infinity : 0);
  const maxDrawdownPct = calculateMaxDrawdown(balanceHistory);

  const largestWin = wins.length ? Math.max(...wins.map(t => t.pnl)) : 0;
  const largestLoss = losses.length ? Math.min(...losses.map(t => t.pnl)) : 0;

  const cronTrades = [...trades].reverse();
  let currentStreak = 0, bestStreak = 0, worstStreak = 0;
  cronTrades.forEach(t => {
    if (t.pnl > 0) { if (currentStreak < 0) currentStreak = 0; currentStreak++; bestStreak = Math.max(bestStreak, currentStreak); }
    else if (t.pnl < 0) { if (currentStreak > 0) currentStreak = 0; currentStreak--; worstStreak = Math.min(worstStreak, currentStreak); }
  });

  return { winRate, averageWin, averageLoss, largestWin, largestLoss, profitFactor, maxDrawdownPct, currentStreak, bestStreak, worstStreak };
};

/* ---------------- Small components ---------------- */
const CollapsibleSection: React.FC<{
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden mb-6">
      <button
        onClick={() => setIsOpen(s => !s)}
        className="w-full flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10"
        aria-label={`Toggle ${title}`}
      >
        <div className="flex items-center gap-2 font-bold text-lg text-slate-800 dark:text-white">
          {Icon && <Icon size={20} className="text-blue-600 dark:text-blue-400" />}
          {title}
        </div>
        {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </button>
      <div style={{ height: isOpen ? 'auto' : 0, overflow: 'hidden' }}>
        <div className="p-6 border-t border-slate-200 dark:border-white/10">{children}</div>
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any) { console.error('Component error:', error); }
  render() { return this.state.hasError ? <div className="p-4 text-red-500">Error in component.</div> : this.props.children; }
}

const TradingViewTicker: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    c.innerHTML = '';
    try {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
      script.async = true;
      script.onerror = () => setError(true);
      script.innerHTML = JSON.stringify({
        symbols: [
          { proName: 'FOREXCOM:SPX500', title: 'S&P 500' },
          { proName: 'FX_IDC:EURUSD', title: 'EUR/USD' },
          { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
          { proName: 'OANDA:XAUUSD', title: 'Gold' },
        ],
        showSymbolLogo: true,
        colorTheme: darkMode ? 'dark' : 'light',
        isTransparent: true,
        displayMode: 'adaptive',
        locale: 'en',
      });
      c.appendChild(script);
    } catch { setError(true); }
    return () => { if (c) c.innerHTML = ''; };
  }, [darkMode]);
  if (error) return (
    <div className="w-full h-12 mb-6 flex items-center justify-center bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs border-b border-red-200 dark:border-red-500/20">
      <WifiOff size={14} className="mr-2" /> Live Feed Offline
    </div>
  );
  return <div className="tradingview-widget-container w-full h-12 mb-6 pointer-events-none"><div ref={containerRef} /></div>;
};

/* ---------------- Main ---------------- */
const AQTApp: React.FC = () => {
  // Auth
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // App State
  const [darkMode, setDarkMode] = useState(true);
  const [balance, setBalance] = useState<number>(1000);
  const [balanceInput, setBalanceInput] = useState<string>('1000');
  const [broker, setBroker] = useState<string>('PlexyTrade');
  const [leverage, setLeverage] = useState<string>(BROKERS['PlexyTrade']?.default || '1:500');
  const [safeMode, setSafeMode] = useState<boolean>(true);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({ pipValue: 10, stopLoss: 15, profitTarget: 30, dailyGrowth: 20 });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const entryRef = useRef<HTMLInputElement>(null);
  const exitRef = useRef<HTMLInputElement>(null);
  const lotsRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const initialTradeState: TradeInput = useMemo(() => ({ pair: '', direction: 'Long', entry: '', exit: '', lots: '', setup: 'Breakout', emotion: 'Calm', notes: '' }), []);
  const [newTrade, setNewTrade] = useState<TradeInput>(initialTradeState);

  // Effects
  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); }, [darkMode]);
  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      const num = safeParseNumber(balanceInput);
      if (num !== balance) setBalance(num);
    }, 350);
    return () => clearTimeout(t);
  }, [balanceInput, balance]);

  // Firebase auth + sync
  useEffect(() => {
    if (!firebaseReady || !auth) { setIsLoading(false); return; }

    (async () => {
      try { await getRedirectResult(auth).catch(() => {}); } catch {}
    })();

    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    setIsLoading(false);
    return () => unsub();
  }, []);

  // Trades listener
  useEffect(() => {
    if (!firebaseReady || !db || !user) return;
    const tradesCol = collection(db, 'artifacts', APP_ID, 'users', user.uid, 'trades');
    const unsubscribe = onSnapshot(tradesCol, (snapshot) => {
      const remote = snapshot.docs.map(d => d.data() as Trade).sort((a, b) => b.ts - a.ts);
      setTrades(remote);
    });
    return () => unsubscribe();
  }, [user]);

  // ---- Auth handlers
  const googleProvider = useMemo(() => new GoogleAuthProvider(), []);
  const twitterProvider = useMemo(() => new TwitterAuthProvider(), []);

  const popupOrRedirect = async (provider: GoogleAuthProvider | TwitterAuthProvider) => {
    if (!firebaseReady || !auth) return;
    try {
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      const code = e?.code || '';
      if (code.includes('popup') || code.includes('network') || code.includes('cancelled')) {
        await signInWithRedirect(auth, provider);
      } else if (code === 'auth/configuration-not-found') {
        alert('Provider not enabled in Firebase. Enable it in Firebase Console → Authentication → Sign-in method.');
      } else {
        alert(`Sign-in failed: ${code || e?.message || e}`);
      }
    }
  };

  const signInGoogle = () => popupOrRedirect(googleProvider);
  const signInTwitter = () => popupOrRedirect(twitterProvider);
  const doSignOut = async () => { if (!auth) return; await signOut(auth); };

  // --- Derived
  const pairMeta = useMemo(() => getPairMetadata(newTrade.pair), [newTrade.pair]);
  const brokerMinLot = BROKERS[broker]?.minLot ?? 0.01;

  const lotSize = useMemo(() => {
    const safeBal = Number.isFinite(balance) ? balance : 0;
    const currentTier = TIERS.find((t) => safeBal >= t.min && safeBal <= t.max) ?? TIERS[0];
    const baseLot = Math.max(brokerMinLot, parseFloat((Math.floor(currentTier.min / 10) * 0.01).toFixed(2)));
    return safeMode ? Math.max(brokerMinLot, parseFloat((baseLot * 0.5).toFixed(2))) : baseLot;
  }, [balance, brokerMinLot, safeMode]);

  const effectiveLots = useMemo(() => {
    const raw = safeParseNumber(newTrade.lots);
    if (newTrade.lots && raw >= brokerMinLot) {
      const snapped = Math.max(brokerMinLot, Math.round(raw / brokerMinLot) * brokerMinLot);
      return parseFloat(snapped.toFixed(3));
    }
    return lotSize;
  }, [newTrade.lots, brokerMinLot, lotSize]);

  const pipValueForLotEffective = effectiveLots * globalSettings.pipValue;
  const previewPnL = useMemo(() => calculatePnL(newTrade, pipValueForLotEffective), [newTrade, pipValueForLotEffective]);

  const balanceHistory = useMemo(() => {
    const baseline = round2(balance - trades.reduce((a, t) => a + t.pnl, 0));
    const points = [{ trade: 0, balance: baseline }];
    for (let i = trades.length - 1; i >= 0; i--) {
      const prev = points[points.length - 1].balance;
      points.push({ trade: points.length, balance: round2(prev + trades[i].pnl) });
    }
    return points;
  }, [trades, balance]);

  const riskMetrics = useMemo(() => calculateRiskMetrics(trades, balanceHistory), [trades, balanceHistory]);
  const winsCount = trades.filter(t => t.pnl > 0).length;
  const lossesCount = trades.filter(t => t.pnl < 0).length;

  /* ---- Actions ---- */
  const addTrade = useCallback(async () => {
    if (!newTrade.pair || !newTrade.entry || !newTrade.exit) return;
    const pnlValue = calculatePnL(newTrade, pipValueForLotEffective);
    const normalized = normalizeTrade(newTrade, effectiveLots);
    const finalTrade: Trade = { ...normalized, pnl: pnlValue };

    setTrades(prev => [finalTrade, ...prev]);
    const newBal = round2(balance + pnlValue);
    setBalance(newBal);
    setBalanceInput(String(newBal));

    if (firebaseReady && db && user) {
      try {
        await setDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'trades', finalTrade.id), finalTrade);
      } catch (e) { console.error('Failed to save trade', e); }
    }
    setNewTrade(initialTradeState);
  }, [newTrade, pipValueForLotEffective, effectiveLots, balance, initialTradeState, user]);

  const deleteTrade = useCallback(async (id: string) => {
    const trade = trades.find(t => t.id === id);
    if (!trade || !confirm('Delete this trade?')) return;
    const newBal = round2(balance - trade.pnl);
    setBalance(newBal);
    setBalanceInput(String(newBal));
    setTrades(prev => prev.filter(t => t.id !== id));
    if (firebaseReady && db && user) {
      try { await deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'trades', id)); }
      catch (e) { console.error('Failed to delete', e); }
    }
  }, [trades, balance, user]);

  const copyTrade = (t: Trade) => {
    setNewTrade({
      pair: t.pair, direction: t.direction,
      entry: t.entry.toString(), exit: t.exit.toString(),
      lots: t.lots.toString(), setup: (t.setup as TradeSetup) || 'Breakout',
      emotion: t.emotion || 'Calm', notes: '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exportToCSV = (rows: Trade[]) => {
    const headers = ['Date','Time','Pair','Direction','Lots','PnL','Setup','Emotion','Notes'];
    const body = rows.map(t => [t.date,t.time,t.pair,t.direction,t.lots,t.pnl.toFixed(2),t.setup,t.emotion,(t.notes||'').replace(/\n/g,' ')]);
    const csv = [headers.join(','), ...body.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type:'text/csv' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `aqt_journal_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  // UI helpers
  const todayKey = useMemo(() => localDayKey(currentTime), [currentTime]);
  const todayPnl = useMemo(() => trades.filter(t => t.date === todayKey).reduce((s, t) => s + t.pnl, 0), [trades, todayKey]);
  const dailyGoal = round2(balance * (globalSettings.dailyGrowth / 100));

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
        <h2 className="text-xl font-bold">AQT Trading Journal</h2>
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden pb-12 transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
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
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              AQT <span className="text-blue-600 dark:text-blue-400">v2.8 Pro</span>
              {user ? (
                <span className="inline-flex" aria-label="Synced to Cloud"><Cloud size={16} className="text-green-500" /></span>
              ) : (
                <span className="inline-flex" aria-label="Local Mode"><CloudOff size={16} className="text-slate-400" /></span>
              )}
            </h1>
            {user ? (
              <div className="flex items-center gap-3 ml-2">
                {user.photoURL && <img src={user.photoURL} alt="avatar" className="w-7 h-7 rounded-full border border-white/20" />}
                <div className="text-xs">
                  <div className="font-semibold">{user.displayName || user.email || 'Signed in'}</div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2 mt-3 md:mt-0 print:hidden">
            {!user ? (
              <>
                <button onClick={signInGoogle} className="px-3 py-2 rounded bg-white text-slate-700 border border-slate-200 flex items-center gap-2 hover:bg-slate-50">
                  <LogIn size={16} /> Sign in with Google
                </button>
                <button onClick={signInTwitter} className="px-3 py-2 rounded bg-black text-white border border-black flex items-center gap-2 hover:opacity-90">
                  <LogIn size={16} /> Sign in with X
                </button>
              </>
            ) : (
              <button onClick={doSignOut} className="px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 flex items-center gap-2 hover:bg-slate-600">
                <LogOut size={16} /> Sign out
              </button>
            )}

            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify({ version: '2.8-pro', balance, trades, settings: { broker, leverage, safeMode, darkMode, globalSettings }}, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob); const a = document.createElement('a');
                a.href = url; a.download = `aqt_backup_${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);
              }}
              className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-all"
              aria-label="Backup"
            >
              <Download size={20} />
            </button>
            <label className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer" aria-label="Restore">
              <Upload size={20} />
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    try {
                      const data = JSON.parse(String(ev.target?.result||'{}'));
                      if (typeof data.balance === 'number') { setBalance(data.balance); setBalanceInput(String(data.balance)); }
                      if (Array.isArray(data.trades)) setTrades(data.trades);
                      if (data.settings) setGlobalSettings((s) => ({ ...s, ...(data.settings.globalSettings || {}) }));
                      alert('Backup restored.');
                    } catch { alert('Invalid backup file.'); }
                  };
                  reader.readAsText(f);
                }}
                className="hidden"
              />
            </label>
            <button onClick={() => setIsSettingsOpen(true)} className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"><SettingsIcon size={20} /></button>
            <button onClick={() => setDarkMode(!darkMode)} className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"><Sun size={20} /></button>
            <button onClick={handlePrint} className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-all"><Printer size={20} /></button>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-white/10">
            <div className="text-sm text-slate-500 dark:text-slate-400">Win Rate</div>
            <div className="text-2xl font-bold dark:text-white">{riskMetrics.winRate.toFixed(1)}%</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-white/10">
            <div className="text-sm text-slate-500 dark:text-slate-400">Profit Factor</div>
            <div className="text-2xl font-bold dark:text-white">{Number.isFinite(riskMetrics.profitFactor) ? riskMetrics.profitFactor.toFixed(2) : '∞'}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-white/10">
            <div className="text-sm text-slate-500 dark:text-slate-400">Best Trade</div>
            <div className="text-2xl font-bold text-green-500">{fmtUSD(riskMetrics.largestWin)}</div>
          </div>
        </div>

        {/* GOAL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex-1 bg-white dark:bg-white/10 rounded-xl p-4 border border-slate-200 dark:border-white/10 relative overflow-hidden flex flex-col justify-center">
            <div className="flex justify-between items-end mb-2 relative z-10">
              <span className="text-xs text-slate-500 dark:text-slate-300 font-bold uppercase">Daily Goal</span>
              <span className={`text-lg font-bold ${todayPnl >= dailyGoal && dailyGoal>0 ? 'text-green-500' : 'text-slate-700 dark:text-white'}`}>
                {Math.round(todayPnl)} <span className="text-xs text-slate-400">/ {Math.round(dailyGoal)}</span>
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-black/30 h-2 rounded-full overflow-hidden relative z-10">
              <div className={`h-full transition-all duration-1000 ${todayPnl >= dailyGoal ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, Math.max(0, dailyGoal ? (todayPnl/dailyGoal)*100 : 0))}%` }} />
            </div>
          </div>
          <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">Total P&L</div>
              <div className={`text-xl font-bold ${trades.reduce((a,t)=>a+t.pnl,0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>{fmtUSD(trades.reduce((a,t)=>a+t.pnl,0))}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">Account</div>
              <div className="text-xl font-bold dark:text-white">{fmtUSD(balance)}</div>
            </div>
          </div>
          <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10">
            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">System Time</div>
            <div className="text-xl font-mono">{currentTime.toLocaleTimeString()}</div>
          </div>
        </div>

        {/* CONFIG */}
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
                  onChange={(e) => setBalanceInput(e.target.value.replace(/[^\d.-]/g, ''))}
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
            </div>
            <div>
              <label className="text-blue-700 dark:text-blue-200 text-xs font-bold uppercase tracking-wider mb-2 block">Risk Mode</label>
              <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg border border-slate-300 dark:border-white/20">
                <button type="button" onClick={() => setSafeMode(true)} className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${safeMode ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'text-slate-400'}`}>Safe</button>
                <button type="button" onClick={() => setSafeMode(false)} className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${!safeMode ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' : 'text-slate-400'}`}>Aggressive</button>
              </div>
            </div>
            <div>
              <label className="text-blue-700 dark:text-blue-200 text-xs font-bold uppercase tracking-wider mb-2 block">Settings</label>
              <button onClick={() => setIsSettingsOpen(true)} className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-white/20 rounded-lg text-slate-900 dark:text-white text-sm flex items-center gap-2 justify-center">
                <SettingsIcon size={16} /> Open
              </button>
            </div>
          </div>
        </CollapsibleSection>

        {/* ENTRY */}
        <CollapsibleSection title="Trade Entry" icon={DollarSign} defaultOpen>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs text-blue-700 dark:text-blue-200 block mb-1">Pair</label>
              <input
                type="text"
                placeholder="EURUSD"
                value={newTrade.pair}
                list={listId}
                onChange={(e) => setNewTrade({ ...newTrade, pair: e.target.value.toUpperCase() })}
                onKeyDown={(e) => e.key === 'Enter' && entryRef.current?.focus()}
                className="w-full pl-8 pr-4 py-2 bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg"
              />
              <datalist id={listId}>{COMMON_PAIRS.map((p) => <option key={p} value={p} />)}</datalist>
            </div>
            <div>
              <label className="text-xs text-blue-700 dark:text-blue-200 block mb-1">Dir</label>
              <select value={newTrade.direction} onChange={(e) => setNewTrade({ ...newTrade, direction: e.target.value as Direction })} className="w-full bg-slate-100 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded px-3 py-3 text-sm dark:text-white">
                <option value="Long">Long</option><option value="Short">Short</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-blue-700 dark:text-blue-200 block mb-1">Entry</label>
              <input ref={entryRef} type="number" placeholder={pairMeta.placeholder} step={pairMeta.step} value={newTrade.entry} onChange={(e) => setNewTrade({ ...newTrade, entry: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && exitRef.current?.focus()} className="w-full bg-slate-100 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded px-3 py-3 dark:text-white" />
            </div>
            <div>
              <label className="text-xs text-blue-700 dark:text-blue-200 block mb-1">Exit</label>
              <input ref={exitRef} type="number" placeholder={pairMeta.placeholder} step={pairMeta.step} value={newTrade.exit} onChange={(e) => setNewTrade({ ...newTrade, exit: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && lotsRef.current?.focus()} className="w-full bg-slate-100 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded px-3 py-3 dark:text-white" />
            </div>
            <div>
              <label className="text-xs text-blue-700 dark:text-blue-200 block mb-1">Lots</label>
              <input ref={lotsRef} type="number" placeholder={`Rec: ${lotSize}`} step={brokerMinLot} value={newTrade.lots} onChange={(e) => setNewTrade({ ...newTrade, lots: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && addTrade()} className="w-full bg-slate-100 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded px-3 py-3 dark:text-white" />
              <div className="text-[10px] text-slate-500 mt-1 dark:text-slate-400">{newTrade.lots ? `Override active` : `Using Rec: ${lotSize}`}</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 flex justify-between items-center" aria-live="polite">
            <div className="text-xs text-slate-500">Live Preview (with {effectiveLots} lots):</div>
            <div className="flex items-center gap-4">
              <div className={`text-lg font-bold ${previewPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>{previewPnL >= 0 ? '+' : ''}{fmtUSD(previewPnL)}</div>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={addTrade} className="flex-1 font-bold py-3 rounded-lg text-lg shadow-xl bg-blue-600 text-white">Log Trade</button>
            <button type="button" onClick={() => setNewTrade(initialTradeState)} className="px-4 py-3 rounded-lg bg-slate-200 dark:bg-slate-800">Reset</button>
          </div>
        </CollapsibleSection>

        {/* CHARTS */}
        {trades.length > 0 && (
          <CollapsibleSection title="Performance Charts" icon={PieIcon} defaultOpen={false}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-slate-100 dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10">
                <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Growth Curve</h3>
                <ErrorBoundary>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={balanceHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="trade" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip formatter={(val: any, name: string) => [fmtUSD(val as number), name]} />
                      <Line type="monotone" dataKey="balance" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </ErrorBoundary>
              </div>
              <div className="bg-slate-100 dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10">
                <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">Win/Loss Ratio</h3>
                <ErrorBoundary>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={[{ name: 'Wins', value: winsCount }, { name: 'Losses', value: lossesCount }]} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                        <Cell key="wins" fill="#10b981" /><Cell key="losses" fill="#ef4444" />
                      </Pie>
                      <Tooltip formatter={(val: any, name: string) => [String(val), name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </ErrorBoundary>
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* JOURNAL */}
        <CollapsibleSection title={`Journal (${trades.length})`} icon={Brain}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-blue-600 dark:text-blue-300 border-b border-slate-200 dark:border-white/10">
                  <th className="pb-3 pl-2">Time</th>
                  <th className="pb-3">Pair</th>
                  <th className="pb-3">Dir</th>
                  <th className="pb-3">Setup</th>
                  <th className="pb-3">Lots</th>
                  <th className="pb-3">P&L</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {trades.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-500">No trades yet</td></tr>
                ) : trades.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="py-3 pl-2 text-slate-600 dark:text-white">{t.date} <span className="text-xs text-slate-400">{t.time}</span></td>
                    <td className="py-3 font-bold text-slate-800 dark:text-white">{t.pair}</td>
                    <td className="py-3"><span className={`px-2 py-0.5 rounded text-xs ${t.direction === 'Long' ? 'bg-green-100 text-green-700 dark:text-green-300 dark:bg-green-900/50' : 'bg-red-100 text-red-700 dark:text-red-300 dark:bg-red-900/50'}`}>{t.direction}</span></td>
                    <td className="py-3 text-slate-500 dark:text-slate-400 text-xs">{t.setup}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300 font-mono">{t.lots}</td>
                    <td className={`py-3 font-bold font-mono ${t.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{fmtUSD(t.pnl)}</td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => copyTrade(t)} className="text-blue-400 hover:text-blue-600" aria-label="Copy"><ClipboardCopy size={14} /></button>
                        <button onClick={() => deleteTrade(t.id)} className="text-slate-400 hover:text-red-500" aria-label="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 dark:bg-white/5 font-mono">
                  <td className="py-2 pl-2 text-xs text-slate-500 dark:text-slate-400" colSpan={4}>Totals</td>
                  <td className="py-2 text-xs text-slate-500 dark:text-slate-400" />
                  <td className="py-2 font-bold">{fmtUSD(trades.reduce((s,t)=>s+t.pnl,0))}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="mt-3 flex gap-2 justify-end">
            <button type="button" onClick={() => exportToCSV(trades)} className="h-8 px-3 rounded bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Download size={14} /> Export CSV
            </button>
          </div>
        </CollapsibleSection>
      </div>

      {/* settings drawer */}
      {isSettingsOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-white/10 shadow-2xl p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold dark:text-white flex gap-2"><SettingsIcon /> Settings</h3>
              <button onClick={() => setIsSettingsOpen(false)}><CloseIcon className="dark:text-white" /></button>
            </div>
            <div className="space-y-6">
              {(['pipValue','stopLoss','profitTarget','dailyGrowth'] as (keyof GlobalSettings)[]).map((k) => (
                <div key={k}>
                  <label className="block text-sm font-medium dark:text-slate-300 mb-1 capitalize">{k.replace(/([A-Z])/g,' $1')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={globalSettings[k]}
                    onChange={(e) => setGlobalSettings({ ...globalSettings, [k]: parseFloat(e.target.value)||0 })}
                    className="w-full p-3 bg-slate-50 dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded dark:text-white"
                  />
                </div>
              ))}
              <button onClick={() => setIsSettingsOpen(false)} className="w-full py-3 bg-blue-600 text-white rounded font-bold mt-4">Done</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AQTApp;
