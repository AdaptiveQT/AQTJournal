# 🦁 RetailBeastFX v9.1 Trading Guide

## The Complete Manual for Institutional-Grade Trading

---

## 📚 TABLE OF CONTENTS

1. [Setup Checklist](#setup)
2. [Understanding the Dashboard](#dashboard)
3. [The 5 Gates (Must All Be Open)](#gates)
4. [Step-by-Step Trade Process](#process)
5. [Entry Rules](#entry)
6. [Exit Rules](#exit)
7. [Position Sizing](#sizing)
8. [Daily Routine](#routine)
9. [Common Mistakes](#mistakes)
10. [Trade Examples](#examples)

---

<a name="setup"></a>

## 1️⃣ SETUP CHECKLIST

Before you trade, configure these settings:

### Recommended Settings

| Setting | Value | Why |
|---------|-------|-----|
| Institutional Mode | ✅ ON | Stricter filters = higher win rate |
| Trading Mode | SCALPER | London/NY killzones only |
| Require Volume | ✅ ON | +33% win rate improvement |
| ADX Threshold | 25 | Standard trending threshold |
| ATR Trail Mult | 3.0 | 3:1 R:R target |

### Chart Setup

- **Timeframe**: M15 (primary), H1 (confirmation)
- **Pairs**: XAUUSD, EURUSD, GBPUSD
- **Clean chart**: Hide other indicators

---

<a name="dashboard"></a>

## 2️⃣ UNDERSTANDING THE DASHBOARD

The dashboard (bottom-right) shows everything you need:

```
┌─────────────────────────────────┐
│ 🦁  RBFX v9.1 INSTITUTIONAL     │
├─────────────────────────────────┤
│ MODE      │ 🔒 INSTITUTIONAL    │ ← Strict mode active
│ VOL GATE  │ 🟢 OPEN / 🔴 CLOSED │ ← Must be GREEN!
│ ADX       │ 28.5 ✅             │ ← Must show ✅
│ SMA BIAS  │ 📈 BULLISH          │ ← Direction filter
│ REGIME    │ 🔥 EXTREME TREND    │ ← Market condition
│ SESSION   │ 🎯 SILVER BULLET    │ ← Current killzone
│ SIGNAL    │ 🟢 BUY ACTIVE       │ ← Active signal
│ CONFLUENCE│ 8.5/10 🔥 APEX      │ ← Signal quality
│ SENTINEL  │ 🐻 Z>2.0σ           │ ← Volume confirmed
└─────────────────────────────────┘
```

### What Each Row Means

| Row | Green/Good | Red/Bad |
|-----|------------|---------|
| **VOL GATE** | 🟢 Volume confirmed | 🔴 No institutional activity |
| **ADX** | ✅ Trending (≥25) | 🔴 Ranging (skip) |
| **SMA BIAS** | 📈/📉 Clear direction | ⚪ Neutral (caution) |
| **SESSION** | Killzone active | OFF HOURS (don't trade) |
| **SENTINEL** | 🐻 Z>2σ or 🛡️ Absorb | Low volume (skip) |

---

<a name="gates"></a>

## 3️⃣ THE 5 GATES (Must ALL Be Open)

Think of trading like passing through 5 security gates. ALL must be open:

### Gate 1: KILLZONE 🕐

```
✅ London: 3:00 AM - 6:00 AM EST
✅ New York: 8:00 AM - 11:00 AM EST
❌ Outside these hours = NO TRADE
```

### Gate 2: ADX GATE 📊

```
✅ ADX ≥ 25 = Market trending
❌ ADX < 25 = Market ranging (skip)
```

### Gate 3: SMA BIAS 📈📉

```
FOR BUYS:  Price must be ABOVE SMA 200
FOR SELLS: Price must be BELOW SMA 200
```

### Gate 4: VOLUME GATE 🐻

```
✅ Z-Score ≥ 2.0 (purple background)
✅ OR Absorption candle (purple diamond)
❌ No volume confirmation = NO TRADE
```

### Gate 5: ENTRY ZONE 🎯

```
✅ Price touches Order Block (OB box)
✅ OR Price touches Bollinger Band
```

### Quick Check

```
KILLZONE? ✅ → ADX ≥ 25? ✅ → SMA BIAS? ✅ → VOLUME? ✅ → ENTRY ZONE? ✅ → TRADE!
```

---

<a name="process"></a>

## 4️⃣ STEP-BY-STEP TRADE PROCESS

### BEFORE the Killzone (Prep)

1. **Open chart 15 min early**
2. Check dashboard:
   - Is ADX ≥ 25?
   - Is SMA bias clear (📈 or 📉)?
3. Identify potential Order Blocks
4. Set alerts for killzone start

### DURING the Killzone (Hunt)

1. **Wait for signal arrow** (don't anticipate!)
2. Check confluence score:
   - ≥8 = 🔥 APEX (best quality)
   - 6-7 = Standard (good)
   - <6 = Skip (too weak)
3. Verify VOL GATE is 🟢 OPEN
4. Enter on candle close

### AFTER Entry (Manage)

1. Set stop loss (shown by red line)
2. Set take profit (use 3x ATR levels)
3. Walk away or set alerts
4. Journal the trade

---

<a name="entry"></a>

## 5️⃣ ENTRY RULES

### BUY Signal Requirements

```
✅ Green arrow appears below candle
✅ Confluence ≥ 6 (prefer ≥ 8)
✅ VOL GATE = 🟢 OPEN
✅ Price above SMA 200 (purple line)
✅ EMA 8 > EMA 21 (ribbon is green)
✅ In killzone (London or NY box visible)
```

**Entry**: Market order on signal candle close
**Stop Loss**: 2x ATR below entry (or below Order Block)

### SELL Signal Requirements

```
✅ Red arrow appears above candle
✅ Confluence ≥ 6 (prefer ≥ 8)
✅ VOL GATE = 🟢 OPEN
✅ Price below SMA 200 (purple line)
✅ EMA 8 < EMA 21 (ribbon is red)
✅ In killzone + touching Bear OB (stricter for sells)
```

**Entry**: Market order on signal candle close
**Stop Loss**: 2x ATR above entry (or above Order Block)

---

<a name="exit"></a>

## 6️⃣ EXIT RULES

### Take Profit Targets

The indicator shows 3 levels after entry:

```
Long 3R ────── 🟢 (brightest) - Final target (close 25%)
Long 2R ────── 🟢 (medium)    - Scale out (close 25%)
Long 1R ────── 🟢 (dimmer)    - First target (close 50%)
Entry   ──────
Stop    ────── 🔴
```

### Scaling Strategy (Recommended)

| At Level | Action | Position Left |
|----------|--------|---------------|
| **1R hit** | Close 50% | 50% |
| **2R hit** | Close 25% | 25% |
| **3R hit** | Close all | 0% |

### Stop Loss Rules

1. **Initial SL**: 2x ATR from entry
2. **After 1R**: Move SL to break-even
3. **After 2R**: Trail SL to 1R level
4. **Never widen SL** - Accept the loss

### When to Exit Early

- ADX drops below 20 (trend dying)
- Opposite signal appears
- Major news incoming (close before)
- End of killzone (optional)

---

<a name="sizing"></a>

## 7️⃣ POSITION SIZING

### The 1% Rule

**Never risk more than 1% of account per trade.**

```
Risk Amount = Account Balance × 0.01

Example: $10,000 account
Risk per trade = $10,000 × 0.01 = $100
```

### Calculate Lot Size

```
Lot Size = Risk Amount ÷ (SL in pips × Pip Value)

Example for XAUUSD:
- Risk: $100
- SL: 20 pips ($1 per pip per 0.01 lot)
- Lot Size = $100 ÷ (20 × $1) = 0.05 lots
```

### Position Size Table

| Account | 1% Risk | 20 pip SL | Lot Size |
|---------|---------|-----------|----------|
| $500 | $5 | 20 pips | 0.0025 (use 0.01 min) |
| $1,000 | $10 | 20 pips | 0.005 (use 0.01) |
| $5,000 | $50 | 20 pips | 0.025 |
| $10,000 | $100 | 20 pips | 0.05 |
| $100,000 | $1,000 | 20 pips | 0.50 |

---

<a name="routine"></a>

## 8️⃣ DAILY TRADING ROUTINE

### Pre-Market (30 min before killzone)

```
□ Check economic calendar for red news
□ Open XAUUSD, EURUSD, GBPUSD charts
□ Note ADX values on each
□ Identify SMA bias direction
□ Mark key Order Blocks
□ Set killzone alerts
```

### London Session (3-6 AM EST)

```
□ Watch for signals in first 30 min
□ Best setups often at session open
□ If no signal by 5:30 AM, likely skip today
□ Max 1-2 trades per session
```

### NY Session (8-11 AM EST)

```
□ Silver Bullet window: 10-11 AM = prime time
□ Watch for continuation of London move
□ Or reversal if London was fakeout
□ Max 1-2 trades per session
```

### Post-Market

```
□ Journal all trades taken
□ Note what worked/didn't
□ Screenshot winning setups
□ Calculate daily P&L
□ Review for tomorrow
```

---

<a name="mistakes"></a>

## 9️⃣ COMMON MISTAKES TO AVOID

### ❌ DON'T Do This

| Mistake | Why It Fails |
|---------|--------------|
| Trading outside killzones | Low volume, choppy price action |
| Ignoring VOL GATE | No institutional backing = random moves |
| Taking low confluence (<6) | Weak signals = coin flip trades |
| Moving stop loss wider | One bad trade wipes many wins |
| Revenge trading after loss | Emotional decisions = more losses |
| Overtrading (>4/day) | Quality > Quantity |
| Skipping the journal | Can't improve what you don't measure |

### ✅ DO This Instead

| Good Habit | Result |
|------------|--------|
| Wait for APEX signals (8+) | Highest win rate trades |
| Trade ONLY in killzones | Best liquidity and moves |
| Require VOL GATE 🟢 | Institutional confirmation |
| Risk max 1% per trade | Survive losing streaks |
| Take partial profits at 1R | Lock in gains, reduce stress |
| Journal every trade | Learn and improve |

---

<a name="examples"></a>

## 🔟 TRADE EXAMPLES

### Example 1: Perfect APEX BUY ✅

```
Time: 10:15 AM EST (Silver Bullet window)
Setup:
  - XAUUSD M15
  - ADX: 32 ✅
  - SMA Bias: 📈 BULLISH (above 200)
  - VOL GATE: 🟢 OPEN (Z=2.3σ)
  - Signal: 🔥 BEAST BUY at $2,015
  - Confluence: 9/10
  
Entry: $2,015 (on candle close)
SL: $2,010 (2x ATR = $5)
TP1: $2,020 (1R = $5 profit)
TP2: $2,025 (2R)
TP3: $2,030 (3R)

Result: Hit TP2 (+$10/2R)
```

### Example 2: Skipped Trade ❌

```
Time: 2:30 PM EST
Setup:
  - EURUSD M15
  - ADX: 28 ✅
  - SMA Bias: 📈 BULLISH
  - VOL GATE: 🔴 CLOSED ❌
  - Signal: None (blocked by vol gate)
  
Action: NO TRADE (correct decision!)
Why: Outside killzone + no volume confirmation
```

### Example 3: Partial Win ⚡

```
Time: 4:15 AM EST (London session)
Setup:
  - GBPUSD M15
  - ADX: 26 ✅
  - SMA Bias: 📉 BEARISH
  - VOL GATE: 🟢 OPEN (Absorption detected)
  - Signal: SELL at 1.2650
  - Confluence: 7/10
  
Entry: 1.2650
SL: 1.2680 (30 pips)
TP1: 1.2620 (30 pips = 1R)

Result: 
  - Hit TP1, closed 50% (+1R on half)
  - Moved SL to break-even
  - Price reversed, stopped at BE on remaining 50%
  - Net: +0.5R (still a win!)
```

---

## 🎯 QUICK REFERENCE CARD

Print this and keep next to your screen:

```
╔═══════════════════════════════════════════════╗
║           RBFX v9.1 TRADE CHECKLIST           ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  □ KILLZONE?    London 3-6 / NY 8-11 EST     ║
║  □ ADX ≥ 25?    Dashboard shows ✅            ║
║  □ SMA BIAS?    Above/Below 200 for direction ║
║  □ VOL GATE?    Must be 🟢 OPEN               ║
║  □ CONFLUENCE?  ≥6 minimum, ≥8 for APEX       ║
║                                               ║
║  IF ALL ✅ → ENTER ON SIGNAL CANDLE CLOSE     ║
║                                               ║
║  STOP LOSS:  2x ATR                           ║
║  TARGET 1:   1x ATR (close 50%)               ║
║  TARGET 2:   2x ATR (close 25%)               ║
║  TARGET 3:   3x ATR (close 25%)               ║
║                                               ║
║  MAX RISK:   1% per trade                     ║
║  MAX TRADES: 2 per session                    ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

---

## 🧠 MY THOUGHT PROCESS (First Person Walkthrough)

Here's exactly what goes through my head during a real trade:

### 9:50 AM EST - Pre-Session Prep

*"Okay, Silver Bullet window starts in 10 minutes. Let me check my charts."*

*"XAUUSD M15... ADX is at 31 - nice, that's solid trending. The gate should stay open."*

*"Price is sitting above the 200 SMA, so I'm only looking for buys today. No shorts, period. Don't fight the bias."*

*"I see a bullish Order Block from yesterday around 2,012. If price pulls back there during the session, that's my zone."*

*"VOL GATE is red right now - makes sense, session hasn't started. I'll wait."*

### 10:05 AM EST - Session Opens

*"Silver Bullet just started. Price is drifting down toward my Order Block. Good - I want it to come to me, not chase it."*

*"Still no volume. Dashboard shows Z-Score at 0.4. Nothing happening yet. I'm just watching."*

*"Patience. The setup will come or it won't. Either way, I'm not forcing anything."*

### 10:22 AM EST - Something's Happening

*"Whoa - purple background just flashed. Volume spike! Z-Score jumped to 2.1."*

*"Price just touched my Order Block AND the lower Bollinger Band at the same time. That's confluence."*

*"Let me check the dashboard... VOL GATE: 🟢 OPEN. ADX: 29 ✅. SMA BIAS: 📈 BULLISH. All gates open!"*

*"This candle is still forming though. I don't enter mid-candle. Wait for the close."*

### 10:23 AM EST - Signal Confirmation

*"Candle just closed. GREEN arrow appeared! BUY signal confirmed."*

*"Confluence score shows 8.5/10 with 🔥 APEX tag. This is exactly what I wait for."*

*"Entry price: 2,012.50. My SL goes 2x ATR below... that's about 2,007.50. Risking $5 per ounce."*

*"TP1 at 2,017.50 (1R), TP2 at 2,022.50 (2R), TP3 at 2,027.50 (3R). The indicator is showing these lines for me."*

### 10:24 AM EST - Execution

*"Entering now. 0.05 lots. That's 1% of my account risked."*

*"Trade is live. SL is set. Now I step back."*

*"I'm not staring at every tick. I set an alert for TP1 and I'll check back in 15 minutes."*

### 10:41 AM EST - First Target Hit

*"Alert fired! Price hit 2,017.50 - my 1R target."*

*"Closing 50% of position now. Profit locked: $12.50"*

*"Moving my stop loss to break-even at 2,012.50. Now I'm playing with house money on the remaining 50%."*

*"Letting the rest ride toward 2R. If it reverses and stops me at BE, I still made money. No stress."*

### 11:02 AM EST - Final Exit

*"Price just hit 2,022.50 - my 2R target! Closing the remaining position."*

*"Total profit: $12.50 (first half) + $12.50 (second half) = $25 on 0.05 lots."*

*"That's +2R on this trade. Solid."*

*"Silver Bullet window is almost over anyway. I'm done for today. One good trade is enough."*

### 11:15 AM EST - Post-Trade Journaling

*"Opening my journal..."*

```
Date: Jan 9, 2026
Pair: XAUUSD
Session: NY Silver Bullet
Signal: APEX BUY (8.5/10)
Entry: 2,012.50
SL: 2,007.50
TP: Hit 2R at 2,022.50
Result: +2R ($25)
Notes: Clean setup - OB + BB touch + volume surge. 
       Executed exactly as planned.
       Didn't overtrade after.
```

*"Closing the charts. Going to do something else. Tomorrow is another day."*

---

### When I DON'T Trade (Equally Important)

Here's my thought process when I skip:

**10:35 AM - No Setup**

*"Hmm, price is just chopping around. ADX dropped to 22. Gate closed."*

*"VOL GATE is still red. No institutional activity."*

*"I could force a trade here, but why? The indicator is literally telling me 'not now.'"*

*"I'm closing the chart. No trade today is a good trade."*

**2:15 PM - Outside Killzone**

*"Got an alert - looks like price is moving on EURUSD."*

*"Wait... it's 2:15 PM. That's outside my killzones. I don't trade this time."*

*"Doesn't matter how good it looks. My rules say killzones only. Rules > feelings."*

*"Ignoring it."*

---

## 🦁 FINAL WORDS

This indicator gives you institutional-grade setups. But YOU must:

1. **Be patient** - Wait for all 5 gates to open
2. **Be disciplined** - Follow the rules every time
3. **Be consistent** - Trade the same way daily
4. **Journal everything** - Track and improve

The best traders aren't the smartest. They're the most disciplined.

Good luck, and welcome to the Pride! 🦁

---

*© 2026 RetailBeastFX - Trade Responsibly*
