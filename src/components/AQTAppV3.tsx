'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowRight, TrendingUp, AlertCircle, DollarSign, Target, Shield,
  Download, Upload, Brain, Zap, Trash2, CheckCircle2, Bell, Clock,
  Building2, Calculator, PieChart as PieIcon, BarChart2,
  ChevronDown, ChevronUp, WifiOff, Save, Sun, Moon, Cloud, Loader2, Lock, X,
  Users, Trophy, Star, Image as ImageIcon, Edit2
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area
} from 'recharts';

// --- FIREBASE IMPORTS ---
import { auth, db } from '../firebase';
import { signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
import {
  doc, setDoc, updateDoc, onSnapshot, collection,
  addDoc, deleteDoc, serverTimestamp, query, orderBy, type DocumentData
} from 'firebase/firestore';

// ==========================================
// 1. MARKETING / LANDING PAGE COMPONENT
// ==========================================

interface LandingPageProps {
  onEnterApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [activeTab, setActiveTab] = useState<'landing' | 'pricing' | 'testimonials' | 'features' | 'onboarding'>('landing');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8 font-sans text-slate-100">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <nav className="flex justify-between items-center mb-12">
          <div className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full overflow-hidden flex items-center justify-center relative">
              <Zap size={16} className="text-white relative z-10" />
            </div>
            AQT <span className="text-blue-400">Pro</span>
          </div>
          <button
            onClick={onEnterApp}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            Log In
          </button>
        </nav>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {(['landing', 'pricing', 'testimonials', 'features', 'onboarding'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 md:px-6 py-2 rounded-full font-bold whitespace-nowrap transition-all text-sm md:text-base ${
                activeTab === tab
                  ? 'bg-white text-blue-900'
                  : 'bg-white/5 text-blue-200 hover:bg-white/10'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Landing Page Section */}
        {activeTab === 'landing' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-6 py-10">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight leading-tight">
                Stop Losing Money.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  Start Trading Smart.
                </span>
              </h1>
              <p className="text-xl text-blue-200 max-w-2xl mx-auto leading-relaxed">
                The AI-powered journal that tracks your psychology, automates position sizing, and syncs across all your devices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <button
                  onClick={onEnterApp}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg rounded-xl hover:scale-105 transition-all shadow-2xl shadow-blue-500/30 flex items-center gap-3"
                >
                  <Zap className="w-5 h-5" />
                  Start Free Trial
                </button>
              </div>
              <div className="text-sm text-blue-300/60 mt-4">No credit card required • Instant access</div>
            </div>

            {/* Social Proof */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center">
                <div className="text-4xl font-bold text-white mb-1">10,000+</div>
                <div className="text-blue-300 text-sm">Active Traders</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center">
                <div className="text-4xl font-bold text-green-400 mb-1">$2.1M+</div>
                <div className="text-blue-300 text-sm">Profits Tracked</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-1">4.9★</div>
                <div className="text-blue-300 text-sm">User Rating</div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Section */}
        {activeTab === 'pricing' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
              <p className="text-blue-200">Join thousands of profitable traders today.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Tier */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white">Starter</h3>
                  <div className="text-4xl font-bold text-white mt-2">$0</div>
                  <div className="text-blue-300 text-sm">Forever free</div>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {['10 Cloud-Synced Trades', 'Automated Position Sizing', 'Basic Tier System', 'Mobile App Access'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                      <CheckCircle2 size={16} className="text-blue-400" /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={onEnterApp} className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all">
                  Start Free
                </button>
              </div>

              {/* Pro Tier */}
              <div className="bg-gradient-to-b from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-2xl p-8 border border-blue-500 relative flex flex-col">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white">Pro Monthly</h3>
                  <div className="text-4xl font-bold text-white mt-2">$15</div>
                  <div className="text-blue-300 text-sm">per month • Cancel anytime</div>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {['Unlimited Trades', 'Psychology Tracking', 'Advanced Analytics Charts', 'CSV & PDF Export', 'Priority Support'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-white">
                      <CheckCircle2 size={16} className="text-green-400" /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={onEnterApp} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25">
                  Get Pro Access
                </button>
                <div className="text-center mt-3 text-xs text-blue-300">30-day money-back guarantee</div>
              </div>
            </div>
          </div>
        )}

        {/* Testimonials */}
        {activeTab === 'testimonials' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {[
              { name: 'Marcus Chen', role: 'FTMO Funded', quote: 'AQT helped me pass my FTMO challenge. The psychology tracking showed I was revenge trading.', result: '+$47K Profit' },
              { name: 'Sarah W.', role: 'Forex Scalper', quote: 'I tried 4 other journals. AQT is the only one that automatically adjusts my lot sizes.', result: '89% Win Rate' },
              { name: 'David R.', role: 'Swing Trader', quote: 'The setup analytics revealed my breakout strategy was losing money. Stopped it and doubled my profits.', result: '+142% Return' }
            ].map((t, i) => (
              <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{t.name}</div>
                    <div className="text-xs text-blue-400">{t.role}</div>
                  </div>
                  <div className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded">{t.result}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Features Grid */}
        {activeTab === 'features' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Feature Highlight with Graphic */}
            <div className="flex flex-col md:flex-row items-center gap-8 bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-3xl p-8 border border-white/10">
              <div className="md:w-1/2">
                <h3 className="text-3xl font-bold text-white mb-4">Advanced Analytics</h3>
                <p className="text-blue-200 mb-6 text-lg">
                  Our AI character analyzes your trades 24/7. Discover exactly which setups are printing money and which ones are draining your account.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="text-green-400" /> Setup Win Rate Breakdown
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="text-green-400" /> Time of Day Analysis
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                    <CheckCircle2 className="text-green-400" /> Profit Factor Calculation
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden border-2 border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center text-blue-400 font-bold">
                    Feature Graphic Placeholder
                  </div>
                </div>
              </div>
            </div>

            {/* Standard Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: Target, title: 'Auto Position Sizing', desc: 'No more manual math. AQT calculates lots based on your account tier.' },
                { icon: Brain, title: 'Psychology Tracker', desc: 'Tag emotions (FOMO, Calm) to see how they affect your P&L.' },
                { icon: Cloud, title: 'Cloud Sync', desc: 'Trade on your phone, review on your PC. Data syncs instantly.' },
                { icon: Shield, title: 'Risk Guard', desc: 'Safe Mode automatically halves your risk during drawdowns.' }
              ].map((f, i) => (
                <div key={i} className="flex gap-4 p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <f.icon className="w-10 h-10 text-blue-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
                    <p className="text-slate-400 text-sm">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Onboarding */}
        {activeTab === 'onboarding' && (
          <div className="space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-bold text-white">Get Started in 3 Steps</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Sign Up Free', desc: 'Create your account in 30 seconds. No credit card needed.', icon: Users },
                { step: '2', title: 'Log Trades', desc: 'Enter your trades. AQT handles the math and tracking.', icon: DollarSign },
                { step: '3', title: 'Discover Edge', desc: 'Upgrade to Pro to see advanced analytics and master your psychology.', icon: Trophy }
              ].map((s, i) => (
                <div key={i} className="bg-white/5 p-8 rounded-2xl border border-white/10">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">{s.step}</div>
                  <s.icon className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                  <p className="text-blue-200">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 2. DASHBOARD / APP COMPONENT
// ==========================================

const TIERS = [
  { name: 'SURVIVAL', min: 10, max: 19, pairs: 2, desc: 'Capital preservation mode' },
  { name: 'BUILDING', min: 20, max: 49, pairs: 3, desc: 'Steady growth phase' },
  { name: 'SCALING', min: 50, max: 99, pairs: 4, desc: 'Accelerated scaling' },
  { name: 'GROWTH', min: 100, max: 249, pairs: 5, desc: 'Sustained growth' },
  { name: 'EXPANSION', min: 250, max: 499, pairs: 6, desc: 'Portfolio expansion' },
  { name: 'ADVANCED', min: 500, max: 999, pairs: 7, desc: 'Advanced strategies' },
  { name: 'MASTERY', min: 1000, max: 2499, pairs: 8, desc: 'Full system mastery' },
  { name: 'ELITE', min: 2500, max: 4999, pairs: 10, desc: 'Elite trader status' },
  { name: 'LEGEND', min: 5000, max: 999999, pairs: 12, desc: 'Legendary performance' }
];

const BROKERS: Record<string, { minLot: number; leverage: string[]; default: string }> = {
  'IC Markets': { minLot: 0.01, leverage: ['1:500'], default: '1:500' },
  'Pepperstone': { minLot: 0.01, leverage: ['1:500'], default: '1:500' },
  'HankoTrade': { minLot: 0.01, leverage: ['1:500'], default: '1:500' },
  'Coinexx': { minLot: 0.01, leverage: ['1:500'], default: '1:500' },
  'Prop Firm': { minLot: 0.01, leverage: ['1:100'], default: '1:100' }
};

const TRADE_SETUPS = ['Breakout', 'Reversal', 'Trend Follow', 'Range', 'News', 'Scalp', 'Swing', 'SMC', 'ICT'];
const EMOTIONS = ['Calm', 'Anxious', 'FOMO', 'Revenge', 'Confident', 'Fearful', 'Greedy'];

const roundToTwo = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

const getPairMetadata = (rawPair: string) => {
  const pair = (rawPair || '').toUpperCase();
  if (pair.includes('JPY') || pair.includes('XAU')) return { multiplier: 100 };
  if (pair.includes('BTC') || pair.includes('ETH') || pair.includes('US30')) return { multiplier: 1 };
  return { multiplier: 10000 };
};

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ComponentType<{ size?: string | number; className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string>(defaultOpen ? 'auto' : '0px');

  useEffect(() => {
    if (isOpen && contentRef.current) {
      const scrollHeight = contentRef.current.scrollHeight;
      setHeight(`${scrollHeight}px`);
    } else {
      setHeight('0px');
    }
  }, [isOpen, children]);

  return (
    <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden mb-6 transition-all shadow-sm dark:shadow-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-2 font-bold text-lg text-slate-800 dark:text-white">
          {Icon && <Icon size={20} className="text-blue-600 dark:text-blue-400" />} {title}
        </div>
        {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
      </button>
      <div ref={contentRef} style={{ height, transition: 'height 300ms ease-in-out' }} className="overflow-hidden">
        <div className="p-6 border-t border-slate-200 dark:border-white/10">{children}</div>
      </div>
    </div>
  );
};

interface Trade {
  id: string;
  pair: string;
  direction: 'Long' | 'Short';
  entry: string;
  exit: string;
  setup: string;
  emotion: string;
  lots: number;
  pnl: number;
  date: string;
  timestamp?: any;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(1000);
  const [broker, setBroker] = useState('IC Markets');
  const [safeMode, setSafeMode] = useState(true);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [newTrade, setNewTrade] = useState({
    pair: 'EURUSD',
    direction: 'Long' as 'Long' | 'Short',
    entry: '',
    exit: '',
    setup: 'Breakout',
    emotion: 'Calm'
  });

  // Auth + subscriptions (no leaks)
  useEffect(() => {
    if (!auth || !db) {
      setLoading(false);
      return;
    }

    let unsubUserDoc: (() => void) | null = null;
    let unsubTrades: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!currentUser) {
          await signInAnonymously(auth);
          return;
        }

        setUser(currentUser);

        if (unsubUserDoc) {
          unsubUserDoc();
          unsubUserDoc = null;
        }
        if (unsubTrades) {
          unsubTrades();
          unsubTrades = null;
        }

        if (!db) return;

        unsubUserDoc = onSnapshot(doc(db, 'users', currentUser.uid), async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setBalance(typeof data.balance === 'number' ? data.balance : 1000);
            setBroker(data.broker ?? 'IC Markets');
            setSafeMode(Boolean(data.safeMode ?? true));
            setIsPremium(Boolean(data.isPremium ?? false));
            setDarkMode(Boolean(data.darkMode ?? true));
          } else {
            if (db) {
              await setDoc(doc(db, 'users', currentUser.uid), {
                balance: 1000,
                isPremium: false,
                darkMode: true,
                safeMode: true,
                broker: 'IC Markets'
              });
            }
          }
          setLoading(false);
        });

        unsubTrades = onSnapshot(
          query(collection(db, 'users', currentUser.uid, 'trades'), orderBy('timestamp', 'desc')),
          (snapshot) => setTrades(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Trade)))
        );
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    });

    return () => {
      if (unsubUserDoc) unsubUserDoc();
      if (unsubTrades) unsubTrades();
      unsubAuth();
    };
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode]);

  const updateSetting = async (key: string, value: any) => {
    if (key === 'darkMode') setDarkMode(value);
    if (key === 'safeMode') setSafeMode(value);
    if (key === 'broker') setBroker(value);
    if (user && db) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { [key]: value });
      } catch (e) {
        console.error('Update failed:', e);
      }
    }
  };

  // Derived metrics (memoized)
  const metrics = useMemo(() => {
    const currentTier = TIERS.find(t => balance >= t.min && balance <= t.max) || TIERS[0];
    const brokerMin = BROKERS[broker]?.minLot ?? 0.01;
    const baseLot = Math.max(brokerMin, parseFloat((Math.floor(currentTier.min / 10) * 0.01).toFixed(2)));
    const lotSize = safeMode ? Math.max(brokerMin, parseFloat((baseLot * 0.5).toFixed(2))) : baseLot;
    const pipValue = +(lotSize * 10).toFixed(2);
    const maxLoss = +(pipValue * 15).toFixed(2);
    const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];
    const raw = nextTier ? ((balance - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;
    const progress = Math.max(0, Math.min(100, +raw.toFixed(1)));
    return { currentTier, lotSize, pipValue, maxLoss, progress };
  }, [balance, broker, safeMode]);

  const { currentTier, lotSize, pipValue, maxLoss, progress } = metrics;

  const canLog =
    newTrade.pair &&
    !Number.isNaN(parseFloat(newTrade.entry)) &&
    !Number.isNaN(parseFloat(newTrade.exit));

  const addTrade = async () => {
    if (!isPremium && trades.length >= 10) {
      setShowPaywall(true);
      return;
    }
    if (!user || !db || !canLog) return;

    const en = parseFloat(newTrade.entry);
    const ex = parseFloat(newTrade.exit);
    const dir = newTrade.direction === 'Long' ? 1 : -1;
    const { multiplier } = getPairMetadata(newTrade.pair);
    const pnl = roundToTwo((ex - en) * dir * multiplier * pipValue);

    const tradeData = {
      ...newTrade,
      lots: lotSize,
      pnl,
      date: new Date().toLocaleDateString(),
      timestamp: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'users', user.uid, 'trades'), tradeData);
      await updateDoc(doc(db, 'users', user.uid), { balance: roundToTwo(balance + pnl) });
      setNewTrade(prev => ({ ...prev, entry: '', exit: '' }));
    } catch (e: any) {
      if (typeof window !== 'undefined') {
        alert(e.message);
      }
    }
  };

  const deleteTrade = async (t: Trade) => {
    if (!user || !db) return;
    if (typeof window === 'undefined' || !window.confirm('Delete trade?')) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'trades', t.id));
      await updateDoc(doc(db, 'users', user.uid), { balance: roundToTwo(balance - t.pnl) });
    } catch (e: any) {
      if (typeof window !== 'undefined') {
        alert(e.message);
      }
    }
  };

  const handleUpgrade = () => {
    if (typeof window !== 'undefined') {
      window.location.href = 'https://buy.stripe.com/test_your_link_here';
    }
  };

  const exportReportTxt = () => {
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const report = `
AQT TRADING PERFORMANCE REPORT
Generated: ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACCOUNT OVERVIEW
Balance: $${balance.toFixed(2)}
Tier: ${currentTier.name}
Total P&L: $${trades.reduce((acc, t) => acc + (t.pnl || 0), 0).toFixed(2)}
PERFORMANCE METRICS
Total Trades: ${trades.length}
Win Rate: ${trades.length > 0 ? ((trades.filter(t => (t.pnl || 0) > 0).length / trades.length) * 100).toFixed(1) : 0}%
`.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aqt-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const setupPerformance = useMemo(() => {
    if (!isPremium) return [];
    return TRADE_SETUPS.map(s => {
      const related = trades.filter(t => t.setup === s);
      if (related.length === 0) return null;
      const wins = related.filter(t => (t.pnl || 0) > 0).length;
      return { name: s, winRate: Math.round((wins / related.length) * 100) };
    }).filter((item): item is { name: string; winRate: number } => item !== null);
  }, [trades, isPremium]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-blue-400">
        <Loader2 className="animate-spin mr-2" /> Loading Cloud Data...
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden pb-12 transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
      {/* PAYWALL */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-blue-500 rounded-2xl p-8 max-w-md w-full text-center relative shadow-2xl">
            <button onClick={() => setShowPaywall(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X />
            </button>
            <Shield size={48} className="mx-auto text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Unlock AQT Pro</h2>
            <p className="text-blue-200 mb-6">Unlimited trades, analytics & cloud sync.</p>
            <button onClick={handleUpgrade} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-white mb-3">
              Subscribe for $15/mo
            </button>
            <button onClick={() => setShowPaywall(false)} className="text-sm text-slate-400">Maybe Later</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            AQT <span className="text-blue-500">v3.4</span>
          </h1>
          <div className="flex items-center gap-2 text-xs text-green-500 mt-1">
            <Cloud size={12} /> {isPremium ? 'Pro Cloud' : 'Free Cloud'}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isPremium && (
            <button onClick={() => setShowPaywall(true)} className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full animate-pulse">
              Upgrade
            </button>
          )}
          <button onClick={() => updateSetting('darkMode', !darkMode)} className="p-2 rounded-full bg-white/10">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-4 p-4">
        {/* CONFIG */}
        <CollapsibleSection title="Configuration" icon={Shield}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold uppercase mb-2 block opacity-70">Balance</label>
              <div className="text-2xl font-mono">${balance.toFixed(2)}</div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase mb-2 block opacity-70">Broker</label>
              <select
                value={broker}
                onChange={(e) => updateSetting('broker', e.target.value)}
                className="w-full p-2 bg-slate-800 text-white border border-slate-600 rounded appearance-none"
              >
                {Object.keys(BROKERS).map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase mb-2 block opacity-70">Risk</label>
              <div className="flex bg-slate-800 rounded p-1">
                <button
                  onClick={() => updateSetting('safeMode', true)}
                  className={`flex-1 py-1 text-xs font-bold rounded ${safeMode ? 'bg-green-500' : 'opacity-50'}`}
                >
                  SAFE
                </button>
                <button
                  onClick={() => updateSetting('safeMode', false)}
                  className={`flex-1 py-1 text-xs font-bold rounded ${!safeMode ? 'bg-red-500' : 'opacity-50'}`}
                >
                  AGGR
                </button>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 md:col-span-2">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={20} /> Tier: {currentTier.name}
            </h3>
            <div className="w-full bg-black/30 h-3 rounded-full overflow-hidden mb-2">
              <div className="bg-blue-500 h-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="rounded-xl p-6 border border-white/10 bg-white/5">
            <div className="flex justify-between mb-2">
              <span className="opacity-70">Lots</span>
              <span className="font-bold">{lotSize.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">Risk</span>
              <span className="font-bold text-red-500">${maxLoss.toFixed(2)}</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 flex items-center justify-center">
            <button onClick={exportReportTxt} className="flex flex-col items-center gap-2 text-sm font-bold opacity-70 hover:opacity-100">
              {isPremium ? <Download size={24} className="text-blue-400" /> : <Lock size={24} className="text-amber-400" />}
              {isPremium ? 'Report' : 'Unlock'}
            </button>
          </div>
        </div>

        {/* ANALYTICS */}
        <CollapsibleSection title="Analytics" icon={BarChart2} defaultOpen={isPremium}>
          <div className="relative h-64">
            {!isPremium && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <Lock className="mb-2 text-amber-500" />
                <button onClick={() => setShowPaywall(true)} className="text-blue-400 hover:underline">
                  Upgrade to View
                </button>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={setupPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" fontSize={10} />
                <YAxis stroke="#888" />
                <Bar dataKey="winRate" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CollapsibleSection>

        {/* ENTRY */}
        <div className="bg-white/10 p-6 rounded-xl border border-white/10 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <DollarSign size={18} /> New Trade
            </h3>
            {!isPremium && (
              <span className="text-xs text-orange-500 bg-orange-900/30 px-2 py-1 rounded">
                {trades.length}/10 Free Trades
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <input
              type="text"
              placeholder="Pair"
              value={newTrade.pair}
              onChange={e => setNewTrade({ ...newTrade, pair: e.target.value.toUpperCase() })}
              className="p-2 rounded bg-black/30 border border-white/10 text-sm"
            />
            <select
              value={newTrade.direction}
              onChange={e => setNewTrade({ ...newTrade, direction: e.target.value as 'Long' | 'Short' })}
              className="p-2 rounded bg-black/30 border border-white/10 text-sm"
            >
              <option>Long</option>
              <option>Short</option>
            </select>
            <input
              type="number"
              placeholder="Entry"
              value={newTrade.entry}
              onChange={e => setNewTrade({ ...newTrade, entry: e.target.value })}
              className="p-2 rounded bg-black/30 border border-white/10 text-sm"
            />
            <input
              type="number"
              placeholder="Exit"
              value={newTrade.exit}
              onChange={e => setNewTrade({ ...newTrade, exit: e.target.value })}
              className="p-2 rounded bg-black/30 border border-white/10 text-sm"
            />
            <select
              value={newTrade.setup}
              onChange={e => setNewTrade({ ...newTrade, setup: e.target.value })}
              className="p-2 rounded bg-black/30 border border-white/10 text-sm"
            >
              {TRADE_SETUPS.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              value={newTrade.emotion}
              onChange={e => setNewTrade({ ...newTrade, emotion: e.target.value })}
              className="p-2 rounded bg-black/30 border border-white/10 text-sm"
            >
              {EMOTIONS.map(em => (
                <option key={em}>{em}</option>
              ))}
            </select>
            <button
              disabled={!canLog}
              onClick={addTrade}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded text-sm transition-all col-span-2 md:col-span-1"
            >
              Log
            </button>
          </div>
        </div>

        {/* JOURNAL */}
        <CollapsibleSection title={`Journal (${trades.length})`} icon={Brain}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/10 opacity-60">
                  <th>Date</th>
                  <th>Pair</th>
                  <th>Setup</th>
                  <th>Emo</th>
                  <th>P&L</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {trades.map(t => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3">{t.date}</td>
                    <td className="py-3 font-bold">
                      {t.pair}{' '}
                      <span
                        className={`text-[10px] ml-1 px-1 rounded ${
                          t.direction === 'Long'
                            ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                        }`}
                      >
                        {t.direction}
                      </span>
                    </td>
                    <td className="py-3 opacity-70">{t.setup}</td>
                    <td className="py-3 opacity-70 text-xs">{t.emotion}</td>
                    <td className={`py-3 font-bold ${t.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      ${Number(t.pnl || 0).toFixed(2)}
                    </td>
                    <td className="py-3">
                      <button onClick={() => deleteTrade(t)} className="text-slate-400 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
};

// ==========================================
// 3. ROOT APP (View Switcher)
// ==========================================

const RootApp: React.FC = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');

  return view === 'landing' ? <LandingPage onEnterApp={() => setView('app')} /> : <Dashboard />;
};

export default RootApp;

