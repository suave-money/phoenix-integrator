import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

function FadeIn({ children, id = "", delay = 0 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.05 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return <section ref={ref} id={id} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(30px)", transition: `opacity 0.7s ${delay}ms cubic-bezier(.22,1,.36,1), transform 0.7s ${delay}ms cubic-bezier(.22,1,.36,1)` }}>{children}</section>;
}

const fmtMoney = (n) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 100000 ? 0 : 1)}k`;
  return `$${Math.round(n)}`;
};

// ─── iPhone Frame ───
function IPhoneFrame({ children, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ width: 220, borderRadius: 20, overflow: "hidden", background: "#f5f5f5" }}>
        {children}
      </div>
      {label && <div style={{ color: "#555", fontSize: 11, fontFamily: "var(--mono)" }}>{label}</div>}
    </div>
  );
}

// ─── Yield Calculator (from yield.phoenix.market) ───
function YieldCalculator() {
  const [rate, setRate] = useState(0.03);
  const [days, setDays] = useState(3.5);
  const principal = 1000;

  const data = useMemo(() => {
    const salesPerMo = 30 / days;
    const bals = [], yields = [], monthly = [];
    let b = principal;
    for (let m = 0; m < 12; m++) {
      const prev = b;
      b = b * Math.pow(1 + rate, salesPerMo);
      bals.push(+b.toFixed(2));
      yields.push(+(b - principal).toFixed(2));
      monthly.push(+(b - prev).toFixed(2));
    }
    const apy = (bals[11] / principal - 1) * 100;
    const salesPerYr = 365 / days;
    return { bals, yields, monthly, salesPerMo, apy, salesPerYr, endBal: bals[11], totalYield: bals[11] - principal, m1Yield: monthly[0] };
  }, [rate, days]);

  // SVG chart
  const W = 500, H = 160;
  const maxBal = data.bals[11];
  const balPath = data.bals.map((b, i) => `${i === 0 ? "M" : "L"}${(i / 11) * W},${H - (b / maxBal) * H * 0.9 - H * 0.05}`).join(" ");
  const yieldPath = data.yields.map((y, i) => `${i === 0 ? "M" : "L"}${(i / 11) * W},${H - (y / maxBal) * H * 0.9 - H * 0.05}`).join(" ");

  const sl = { width: "100%", accentColor: "#fff", height: 4, cursor: "pointer" };

  const RATES = [0.005, 0.01, 0.015, 0.02, 0.025, 0.03];
  const DAYS = [1, 2, 3, 3.5, 5, 7, 10, 14];

  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "36px 28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Yield Calculator</div>
          <div style={{ color: "#555", fontSize: 13 }}>Model compound returns for a $1,000 USDC pool over 12 months</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "12px 16px", fontFamily: "var(--mono)", fontSize: 11, color: "#888", lineHeight: 2 }}>
          <div>Starting capital: <span style={{ color: "#fff" }}>$1,000</span></div>
          <div>Yield per sale: <span style={{ color: "#fff" }}>{(rate * 100).toFixed(1)}%</span></div>
          <div>Sell cycle: <span style={{ color: "#fff" }}>Every {days}d</span></div>
          <div>Sales/year: <span style={{ color: "#fff" }}>~{Math.round(data.salesPerYr)}</span></div>
        </div>
      </div>

      {/* Sliders */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <label style={{ color: "#888", fontSize: 12, fontFamily: "var(--mono)" }}>YIELD PER SALE</label>
            <span style={{ color: "#fff", fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700 }}>{(rate * 100).toFixed(1)}%</span>
          </div>
          <input type="range" min={0} max={5} step={1} value={RATES.indexOf(rate)} onChange={e => setRate(RATES[+e.target.value])} style={sl} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            {RATES.map((r, i) => <span key={i} onClick={() => setRate(r)} style={{ color: r === rate ? "#fff" : "#444", fontSize: 10, fontFamily: "var(--mono)", cursor: "pointer" }}>{(r * 100).toFixed(1)}%</span>)}
          </div>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <label style={{ color: "#888", fontSize: 12, fontFamily: "var(--mono)" }}>SELL CYCLE</label>
            <span style={{ color: "#fff", fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700 }}>{days}d</span>
          </div>
          <input type="range" min={0} max={7} step={1} value={DAYS.indexOf(days)} onChange={e => setDays(DAYS[+e.target.value])} style={sl} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            {DAYS.map((d, i) => <span key={i} onClick={() => setDays(d)} style={{ color: d === days ? "#fff" : "#444", fontSize: 10, fontFamily: "var(--mono)", cursor: "pointer" }}>{d}d</span>)}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 28 }}>
        <div style={{ padding: "20px 20px", background: "rgba(255,255,255,0.03)" }}>
          <div style={{ color: "#666", fontSize: 10, fontFamily: "var(--mono)", marginBottom: 4 }}>EFFECTIVE APY</div>
          <div style={{ color: "#fff", fontSize: 28, fontWeight: 800, fontFamily: "var(--mono)" }}>{data.apy.toFixed(0)}%</div>
          <div style={{ color: "#555", fontSize: 11, marginTop: 2 }}>{(data.endBal / principal).toFixed(1)}x capital</div>
        </div>
        <div style={{ padding: "20px 20px", background: "rgba(255,255,255,0.015)", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ color: "#666", fontSize: 10, fontFamily: "var(--mono)", marginBottom: 4 }}>YEAR-END BALANCE</div>
          <div style={{ color: "#fff", fontSize: 28, fontWeight: 800, fontFamily: "var(--mono)" }}>{fmtMoney(data.endBal)}</div>
          <div style={{ color: "#555", fontSize: 11, marginTop: 2 }}>from $1,000</div>
        </div>
        <div style={{ padding: "20px 20px", background: "rgba(255,255,255,0.015)", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ color: "#666", fontSize: 10, fontFamily: "var(--mono)", marginBottom: 4 }}>MONTH 1 YIELD</div>
          <div style={{ color: "#fff", fontSize: 28, fontWeight: 800, fontFamily: "var(--mono)" }}>{fmtMoney(data.m1Yield)}</div>
          <div style={{ color: "#555", fontSize: 11, marginTop: 2 }}>{((data.m1Yield / principal) * 100).toFixed(1)}% in 30 days</div>
        </div>
      </div>

      {/* Chart */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 160 }}>
        <defs>
          <linearGradient id="yg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity="0.1" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></linearGradient>
          <linearGradient id="yg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#888" stopOpacity="0.08" /><stop offset="100%" stopColor="#888" stopOpacity="0" /></linearGradient>
        </defs>
        {/* Principal line */}
        <line x1={0} y1={H - (principal / maxBal) * H * 0.9 - H * 0.05} x2={W} y2={H - (principal / maxBal) * H * 0.9 - H * 0.05} stroke="rgba(255,255,255,0.06)" strokeDasharray="4,4" />
        {/* Balance area */}
        <path d={`${balPath} L${W},${H} L0,${H} Z`} fill="url(#yg1)" />
        <path d={balPath} fill="none" stroke="#fff" strokeWidth="2" />
        {/* Yield area */}
        <path d={`${yieldPath} L${W},${H} L0,${H} Z`} fill="url(#yg2)" />
        <path d={yieldPath} fill="none" stroke="#888" strokeWidth="1.5" strokeDasharray="4,3" />
        {/* Month labels */}
        {[0, 3, 6, 9, 11].map(i => (
          <text key={i} x={(i / 11) * W} y={H - 2} fill="#444" fontSize="9" fontFamily="var(--mono)" textAnchor="middle">M{i + 1}</text>
        ))}
      </svg>
      <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 12, height: 2, background: "#fff" }} /><span style={{ color: "#666", fontSize: 10, fontFamily: "var(--mono)" }}>Balance</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 12, height: 2, background: "#888", borderTop: "1px dashed #888" }} /><span style={{ color: "#666", fontSize: 10, fontFamily: "var(--mono)" }}>Cumulative yield</span></div>
      </div>
    </div>
  );
}

// ─── Pool Sim (simplified — no half-life, no exponential text) ───
function PoolSimulator() {
  const [pool, setPool] = useState(5000);
  const [total, setTotal] = useState(100000);
  const [vol, setVol] = useState(80);
  const { pts, totalMin } = useMemo(() => {
    let rem = pool, tot = total, min = 0;
    const pts = [{ t: 0, pct: 100 }];
    while (rem > pool * 0.01 && min < 60 * 24 * 14) {
      rem = Math.max(0, rem - vol * (rem / tot));
      tot = Math.max(tot - vol, rem + 1); min++;
      if (min % Math.max(1, Math.floor(min / 40)) === 0 || rem <= pool * 0.01)
        pts.push({ t: min, pct: (rem / pool) * 100 });
    }
    return { pts, totalMin: min };
  }, [pool, total, vol]);
  const fmt = (m) => m < 60 ? `${m}m` : m < 1440 ? `${(m / 60).toFixed(1)}h` : `${(m / 1440).toFixed(1)}d`;
  const W = 520, H = 120, maxT = pts[pts.length - 1]?.t || 1;
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${(p.t / maxT) * W},${H - (p.pct / 100) * H}`).join(" ");
  const sl = { width: "100%", accentColor: "#fff", height: 4, cursor: "pointer" };
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 24 }}>
        {[["POOL SIZE", pool, setPool, 100, 50000, 100, `$${pool.toLocaleString()}`], ["TOTAL LIQUIDITY", total, setTotal, 10000, 1000000, 5000, `$${total.toLocaleString()}`], ["BUY VOL/MIN", vol, setVol, 5, 500, 5, `$${vol}/min`]].map(([l, v, s, mn, mx, st, d]) => (
          <div key={l}><label style={{ color: "#888", fontSize: 12, display: "block", marginBottom: 6, fontFamily: "var(--mono)" }}>{l}</label>
            <input type="range" min={mn} max={mx} step={st} value={v} onChange={e => s(+e.target.value)} style={sl} />
            <div style={{ color: "#fff", fontFamily: "var(--mono)", fontSize: 18, marginTop: 4, fontWeight: 600 }}>{d}</div></div>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 120, marginBottom: 16 }}>
        <defs><linearGradient id="pG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity="0.06" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
        <path d={`${pathD} L${W},${H} L0,${H} Z`} fill="url(#pG)" /><path d={pathD} fill="none" stroke="#fff" strokeWidth="1.5" />
      </svg>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[["~99% CLEARED", fmt(totalMin)], ["POOL SHARE", `${((pool / total) * 100).toFixed(1)}%`]].map(([l, v]) => (
          <div key={l} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ color: "#666", fontSize: 10, fontFamily: "var(--mono)", marginBottom: 2 }}>{l}</div>
            <div style={{ color: "#fff", fontSize: 18, fontWeight: 600, fontFamily: "var(--mono)" }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Flow Steps (fixed height) ───
function FlowSteps() {
  const [active, setActive] = useState(0);
  const steps = [
    { n: "01", label: "Your app calls the Quote API", desc: "Request the best available USDC price. Phoenix scans all seller pools and returns the exact USDC amount." },
    { n: "02", label: "User pays via Zelle in WebView", desc: "Your app embeds Phoenix's bank automation WebView. User logs in, confirms Zelle with 2FA. Credentials never leave device." },
    { n: "03", label: "Phoenix verifies payment", desc: "Cryptographic proof extracted directly from the bank's confirmation page and verified server-side." },
    { n: "04", label: "USDC delivered to wallet", desc: "Escrowed USDC released from seller's pool to buyer's wallet on Base. Matched instantly with available liquidity." },
  ];
  useEffect(() => { const t = setInterval(() => setActive(a => (a + 1) % 4), 5500); return () => clearInterval(t); }, []);
  return (
    <div>
      <div style={{ display: "flex", gap: 2, marginBottom: 32 }}>{steps.map((_, i) => (<div key={i} onClick={() => setActive(i)} style={{ flex: 1, height: 2, cursor: "pointer", background: i <= active ? "#fff" : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />))}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
        {steps.map((s, i) => (
          <div key={i} onClick={() => setActive(i)} style={{ border: `1px solid ${i === active ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)"}`, borderRadius: 12, padding: "24px 20px", cursor: "pointer", background: i === active ? "rgba(255,255,255,0.03)" : "transparent", transition: "border-color 0.3s, background 0.3s", minHeight: 180, display: "flex", flexDirection: "column" }}>
            <div style={{ color: i === active ? "#fff" : "#555", fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, marginBottom: 10 }}>{s.n}</div>
            <div style={{ color: i === active ? "#fff" : "#888", fontWeight: 600, fontSize: 14, marginBottom: 10, lineHeight: 1.3 }}>{s.label}</div>
            <div style={{ color: "#999", fontSize: 13, lineHeight: 1.55, opacity: i === active ? 1 : 0, transition: "opacity 0.3s", flex: 1 }}>{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Economics ───
function EconomicsCalc() {
  const [buyVol, setBuyVol] = useState(300000);
  const [buySpread, setBuySpread] = useState(1.0);
  const [sellVol, setSellVol] = useState(200000);
  const [sellFee, setSellFee] = useState(1.0);
  const sl = { width: "100%", accentColor: "#fff", height: 4, cursor: "pointer" };
  const buyLP = buyVol * 0.03, buyInt = buyVol * (buySpread / 100), buyTot = 3 + buySpread;
  const sellYield = sellVol * 0.03, sellInt = sellVol * (sellFee / 100), sellNet = sellYield - sellInt, sellNetPct = 3 - sellFee;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "36px 28px" }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Buy side revenue</div>
        <div style={{ color: "#555", fontSize: 13, marginBottom: 28 }}>Your users buying USDC</div>
        <div style={{ marginBottom: 20 }}><label style={{ color: "#888", fontSize: 12, display: "block", marginBottom: 6, fontFamily: "var(--mono)" }}>MONTHLY BUY VOLUME</label><input type="range" min={100000} max={1000000} step={10000} value={buyVol} onChange={e => setBuyVol(+e.target.value)} style={sl} /><div style={{ color: "#fff", fontFamily: "var(--mono)", fontSize: 20, marginTop: 4, fontWeight: 700 }}>{fmtMoney(buyVol)}/mo</div></div>
        <div style={{ marginBottom: 28 }}><label style={{ color: "#888", fontSize: 12, display: "block", marginBottom: 6, fontFamily: "var(--mono)" }}>YOUR SPREAD (on top of 3%)</label><input type="range" min={0} max={3} step={0.1} value={buySpread} onChange={e => setBuySpread(+e.target.value)} style={sl} /><div style={{ color: "#fff", fontFamily: "var(--mono)", fontSize: 20, marginTop: 4, fontWeight: 700 }}>{buySpread.toFixed(1)}%</div></div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
          <div style={{ display: "flex", height: 28, borderRadius: 6, overflow: "hidden", marginBottom: 12 }}>
            {buyTot > 0 && <div style={{ width: `${(3 / buyTot) * 100}%`, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#666", fontSize: 10, fontFamily: "var(--mono)" }}>LP 3%</span></div>}
            {buySpread > 0 && <div style={{ width: `${(buySpread / buyTot) * 100}%`, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: 10, fontFamily: "var(--mono)" }}>You {buySpread.toFixed(1)}%</span></div>}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: "#888", fontSize: 14 }}>To LPs (3%)</span><span style={{ color: "#888", fontSize: 14, fontFamily: "var(--mono)" }}>{fmtMoney(buyLP)}/mo</span></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>Your revenue</span><span style={{ color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "var(--mono)" }}>{fmtMoney(buyInt)}/mo</span></div>
        </div>
      </div>
      <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "36px 28px" }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Sell side revenue</div>
        <div style={{ color: "#555", fontSize: 13, marginBottom: 28 }}>Your users off-ramping via yield pool</div>
        <div style={{ marginBottom: 20 }}><label style={{ color: "#888", fontSize: 12, display: "block", marginBottom: 6, fontFamily: "var(--mono)" }}>MONTHLY SELL VOLUME</label><input type="range" min={100000} max={1000000} step={10000} value={sellVol} onChange={e => setSellVol(+e.target.value)} style={sl} /><div style={{ color: "#fff", fontFamily: "var(--mono)", fontSize: 20, marginTop: 4, fontWeight: 700 }}>{fmtMoney(sellVol)}/mo</div></div>
        <div style={{ marginBottom: 28 }}><label style={{ color: "#888", fontSize: 12, display: "block", marginBottom: 6, fontFamily: "var(--mono)" }}>YOUR FEE (from 3% yield)</label><input type="range" min={0} max={3} step={0.1} value={sellFee} onChange={e => setSellFee(+e.target.value)} style={sl} /><div style={{ color: "#fff", fontFamily: "var(--mono)", fontSize: 20, marginTop: 4, fontWeight: 700 }}>{sellFee.toFixed(1)}%</div></div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
          <div style={{ display: "flex", height: 28, borderRadius: 6, overflow: "hidden", marginBottom: 12 }}>
            {sellNetPct > 0 && <div style={{ width: `${(sellNetPct / 3) * 100}%`, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", minWidth: 30 }}><span style={{ color: "#666", fontSize: 10, fontFamily: "var(--mono)" }}>Seller {sellNetPct.toFixed(1)}%</span></div>}
            <div style={{ width: `${Math.min(sellFee / 3, 1) * 100}%`, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: 10, fontFamily: "var(--mono)" }}>You {sellFee.toFixed(1)}%</span></div>
          </div>
          {sellNetPct < 0 && <div style={{ color: "#ff6b6b", fontSize: 11, marginBottom: 8 }}>Seller loses {Math.abs(sellNetPct).toFixed(1)}% — may discourage LPs</div>}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ color: "#888", fontSize: 14 }}>Seller earns</span><span style={{ color: sellNet <= 0 ? "#ff6b6b" : "#888", fontSize: 14, fontFamily: "var(--mono)" }}>{fmtMoney(Math.max(0, sellNet))}/mo</span></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>Your revenue</span><span style={{ color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "var(--mono)" }}>{fmtMoney(sellInt)}/mo</span></div>
        </div>
      </div>
    </div>
  );
}


// ═══════ MAIN ═══════
export default function App() {
  const [navVis, setNavVis] = useState(false);
  useEffect(() => { const h = () => setNavVis(window.scrollY > 500); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  const go = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ "--mono": "'SF Mono','Fira Code','Roboto Mono',monospace", background: "#000", color: "#fff", fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`*{box-sizing:border-box;margin:0;padding:0}body{background:#000}::selection{background:rgba(255,255,255,0.15)}input[type=range]{-webkit-appearance:none;appearance:none;background:rgba(255,255,255,0.1);border-radius:2px;outline:none}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#fff;cursor:pointer}`}</style>

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: navVis ? "rgba(0,0,0,0.85)" : "transparent", backdropFilter: navVis ? "blur(12px)" : "none", borderBottom: navVis ? "1px solid rgba(255,255,255,0.06)" : "none", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.3s", opacity: navVis ? 1 : 0, pointerEvents: navVis ? "auto" : "none" }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Phoenix Market</span>
        <div style={{ display: "flex", gap: 24 }}>
          {[["why-phoenix", "Why Phoenix"], ["product", "Product"], ["how-it-works", "How It Works"], ["integration", "Integration"], ["economics", "Economics"], ["yield", "Yield"]].map(([id, l]) => (
            <span key={id} onClick={() => go(id)} style={{ color: "#888", fontSize: 12, cursor: "pointer", fontWeight: 500 }} onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "#888"}>{l}</span>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "100px 24px 80px" }}>
        <div style={{ maxWidth: 760 }}>
          <img
            src="/512x512%20WHITE%20ON%20BLACK.jpg"
            alt="Phoenix logo"
            style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 12, margin: "0 auto 24px", display: "block" }}
          />
          <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.12)", color: "#888", fontSize: 11, fontWeight: 500, letterSpacing: "1px", marginBottom: 36, fontFamily: "var(--mono)" }}>FOR INTEGRATORS & PARTNERS</div>
          <h1 style={{ fontSize: "clamp(36px,6vw,72px)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-3px", marginBottom: 24 }}>Add instant crypto<br />on/off-ramping<br /><span style={{ color: "#666" }}>to your app</span></h1>
          <p style={{ fontSize: 17, color: "#888", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.7 }}>Phoenix is P2P infrastructure that lets your users buy and sell USDC through Zelle — no KYC documents, no card declines, no banking delays.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 64 }}>
            <a href="https://tinyurl.com/pmofframp" target="_blank" rel="noopener noreferrer" style={{ background: "#fff", color: "#000", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>View docs</a>
            <a href="mailto:sidd@phoenix.market" style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Get in touch</a>
          </div>
          <div style={{ display: "flex", gap: 1, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
            {[["< 3 min", "Settlement"], ["3%", "Flat buyer fee"], ["24 / 7", "Always on"], ["$1", "Min"], ["$3500", "Max"], ["Zero", "KYC documents"]].map(([v, l], i) => (
              <div key={l} style={{ flex: 1, padding: "20px 10px", textAlign: "center", borderRight: i < 5 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <div style={{ color: "#fff", fontSize: 17, fontWeight: 700, fontFamily: "var(--mono)", letterSpacing: "-0.5px" }}>{v}</div>
                <div style={{ color: "#555", fontSize: 10, marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PROBLEM + SOLUTION */}
      <FadeIn id="why-phoenix"><div style={{ maxWidth: 940, margin: "0 auto", padding: "120px 24px 0" }}>
        <div style={{ color: "#555", fontSize: 11, fontWeight: 600, letterSpacing: "2px", marginBottom: 12, fontFamily: "var(--mono)" }}>THE PROBLEM</div>
        <h2 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 800, letterSpacing: "-2.5px", marginBottom: 14, lineHeight: 1.08 }}>Your users need to move between dollars and crypto.<br /><span style={{ color: "#444" }}>Today you have two bad options.</span></h2>
        <p style={{ color: "#888", fontSize: 16, marginBottom: 56, maxWidth: 600, lineHeight: 1.7 }}>Whether you're building a wallet, a DeFi app, a gaming platform, or a payments product — the on/off-ramp is your biggest conversion killer.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 24 }}>
          {[["OPTION 1", "Build it yourself", ["Money transmitter licenses in every state", "Build banking integrations from scratch", "Handle KYC/AML compliance", "Manage chargebacks and fraud", "Millions of dollars, years of dev time"]], ["OPTION 2", "MoonPay, Transak, Ramp", ["3–5% fees passed to your users", "Multi-day KYC kills ~90% of conversions", "15–30% of card payments declined", "ACH takes 1–3 business days to settle", "No control over UX, limited bank support"]]].map(([tag, title, items], ci) => (
            <div key={tag} style={{ padding: "40px 32px", background: "rgba(255,255,255,0.015)", borderLeft: ci === 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <div style={{ color: "#555", fontSize: 11, fontWeight: 600, letterSpacing: "1px", marginBottom: 16, fontFamily: "var(--mono)" }}>{tag}</div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 22, marginBottom: 24 }}>{title}</div>
              {items.map(t => <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}><span style={{ color: "#444", fontSize: 11, lineHeight: "22px", flexShrink: 0, fontFamily: "var(--mono)" }}>x</span><span style={{ color: "#777", fontSize: 15, lineHeight: 1.5 }}>{t}</span></div>)}
            </div>
          ))}
        </div>
      </div></FadeIn>

      <FadeIn><div style={{ maxWidth: 940, margin: "0 auto", padding: "0 24px 120px" }}>
        <div style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "56px 48px", background: "rgba(255,255,255,0.025)", position: "relative" }}>
          <div style={{ position: "absolute", top: -14, left: 48, background: "#fff", color: "#000", fontSize: 11, fontWeight: 700, padding: "5px 14px", borderRadius: 6, letterSpacing: "0.5px", fontFamily: "var(--mono)" }}>OPTION 3 — PHOENIX</div>
          <h3 style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, letterSpacing: "-2px", marginBottom: 12, lineHeight: 1.1 }}>Integrate Phoenix</h3>
          <p style={{ color: "#888", fontSize: 16, marginBottom: 40, maxWidth: 560, lineHeight: 1.7 }}>P2P infrastructure that gives your users instant, bank-verified crypto on/off-ramping — with zero custodial risk for you.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
            {[["3% flat fee", "Transparent pricing, no hidden spreads. You can add your own margin on top."], ["No KYC documents", "Bank login = verification. No passport, no selfie, no SSN. Can 5–10x your conversion."], ["Under 3 minutes", "Instant Zelle settlement, 24/7. No ACH delays, no banking windows."], ["Non-custodial", "Funds in smart contracts on Base, not your accounts. Designed to fall outside MSB."], ["80%+ US bank reach", "Chase, BofA, Wells Fargo today. Capital One and more coming."], ["Your brand, your UX", "APIs and contracts only. No frontend. Your users stay in your app."]].map(([t, d], i) => (
              <div key={t} style={{ padding: "32px 24px", background: "rgba(255,255,255,0.015)", borderTop: i >= 3 ? "1px solid rgba(255,255,255,0.06)" : "none", borderLeft: i % 3 !== 0 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{t}</div><div style={{ color: "#888", fontSize: 14, lineHeight: 1.65 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div></FadeIn>

      {/* PRODUCT — iPhone mockups */}
      <FadeIn id="product"><div style={{ maxWidth: 940, margin: "0 auto", padding: "100px 24px" }}>
        <div style={{ color: "#555", fontSize: 11, fontWeight: 600, letterSpacing: "2px", marginBottom: 12, fontFamily: "var(--mono)" }}>THE PRODUCT</div>
        <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-2px", marginBottom: 14, lineHeight: 1.1 }}>What it looks like for the buyer</h2>
        <p style={{ color: "#888", fontSize: 15, marginBottom: 48, maxWidth: 560, lineHeight: 1.7 }}>A native mobile experience. Three screens to buy crypto — enter amount, confirm, and track payment progress.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
          <IPhoneFrame label="Enter amount">
            <div style={{ background: "#f5f5f5" }}>
              <img
                src="/assets/enter-amount.png"
                alt="Enter amount screen"
                style={{ display: "block", width: "100%", height: "auto" }}
              />
            </div>
          </IPhoneFrame>

          <IPhoneFrame label="Confirm purchase">
            <div style={{ background: "#f5f5f5" }}>
              <img
                src="/assets/confirm-purchase.png"
                alt="Confirm purchase screen"
                style={{ display: "block", width: "100%", height: "auto" }}
              />
            </div>
          </IPhoneFrame>

          <IPhoneFrame label="Payment in progress">
            <div style={{ background: "#f5f5f5", height: 478, overflow: "hidden" }}>
              <img
                src="/image.png"
                alt="Payment progress steps screen"
                style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
              />
            </div>
          </IPhoneFrame>
        </div>
      </div></FadeIn>

      {/* HOW IT WORKS */}
      <FadeIn id="how-it-works"><div style={{ maxWidth: 940, margin: "0 auto", padding: "100px 24px" }}>
        <div style={{ color: "#555", fontSize: 11, fontWeight: 600, letterSpacing: "2px", marginBottom: 12, fontFamily: "var(--mono)" }}>HOW IT WORKS</div>
        <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-2px", marginBottom: 14, lineHeight: 1.1 }}>Four steps. Under three minutes.</h2>
        <p style={{ color: "#888", fontSize: 15, marginBottom: 40, maxWidth: 560, lineHeight: 1.7 }}>From your user's perspective, buying USDC feels as simple as a Venmo payment.</p>
        <FlowSteps />
      </div></FadeIn>

      {/* INTEGRATION */}
      <FadeIn id="integration"><div style={{ maxWidth: 940, margin: "0 auto", padding: "100px 24px" }}>
        <div style={{ color: "#555", fontSize: 11, fontWeight: 600, letterSpacing: "2px", marginBottom: 12, fontFamily: "var(--mono)" }}>INTEGRATION</div>
        <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-2px", marginBottom: 14, lineHeight: 1.1 }}>Two flows. A handful of API calls.</h2>
        <p style={{ color: "#888", fontSize: 15, marginBottom: 48, maxWidth: 580, lineHeight: 1.7 }}>You own the frontend. Phoenix provides APIs and on-chain contracts.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "36px 28px" }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Buying (On-Ramp)</div>
            <div style={{ color: "#555", fontSize: 13, marginBottom: 28 }}>Your user wants USDC</div>
            {[["1", "Get a quote", "GET /quote", "Best price across all pools, exact USDC amount returned."], ["2", "Run bank connection", "Phoenix WebView", "Embed WebView. User logs in, confirms Zelle with 2FA. Phoenix handles verification and settlement."]].map(([n, t, a, d], i) => (
              <div key={n} style={{ display: "flex", gap: 16, paddingBottom: 24, marginBottom: i < 1 ? 24 : 0, borderBottom: i < 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, color: "#888" }}>{n}</div>
                <div><div style={{ color: "#fff", fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{t}</div><div style={{ color: "#555", fontSize: 12, fontFamily: "var(--mono)", marginBottom: 6 }}>{a}</div><div style={{ color: "#888", fontSize: 13, lineHeight: 1.5 }}>{d}</div></div>
              </div>
            ))}
          </div>
          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "36px 28px" }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Selling (Off-Ramp)</div>
            <div style={{ color: "#555", fontSize: 13, marginBottom: 28 }}>Your user holds USDC, wants dollars</div>
            {[["1", "Create pool", "POST /pools", "On-chain escrow on Base. Set price, limits. Deploys ~30s."], ["2", "Add Zelle", "PUT /pools/{id}/payment-methods/zelle", "Seller's Zelle email/phone for receiving fiat."], ["3", "Deposit USDC", "ERC-20 transfer", "Transfer USDC to pool contract on Base."], ["4", "List pool", "POST /pools/{id}/list", "Live for buyers. Zelle payments arrive automatically."]].map(([n, t, a, d], i) => (
              <div key={n} style={{ display: "flex", gap: 16, paddingBottom: 20, marginBottom: i < 3 ? 20 : 0, borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, color: "#888" }}>{n}</div>
                <div><div style={{ color: "#fff", fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{t}</div><div style={{ color: "#555", fontSize: 11, fontFamily: "var(--mono)", marginBottom: 6 }}>{a}</div><div style={{ color: "#888", fontSize: 13, lineHeight: 1.5 }}>{d}</div></div>
              </div>
            ))}
          </div>
        </div>
        {/* Impact numbers */}
        <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 1, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
          {[["5–10x", "higher conversion", "No KYC, no card declines, no ACH delays. Users pay from their bank."], ["Zero", "custodial risk", "On-chain escrow, not your accounts. Bank-to-bank fiat. Outside MSB."], ["~50%", "cheaper", "3% flat vs 3–5% + hidden spreads from card-based providers."], ["< 1 hr", "to integrate", "A few API calls and one WebView. No licenses. No compliance infra."]].map(([big, label, desc], i) => (
            <div key={label} style={{ padding: "36px 24px", background: "rgba(255,255,255,0.015)", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <div style={{ color: "#fff", fontSize: 36, fontWeight: 800, fontFamily: "var(--mono)", letterSpacing: "-2px", marginBottom: 4 }}>{big}</div>
              <div style={{ color: "#888", fontSize: 13, fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
              <div style={{ color: "#666", fontSize: 13, lineHeight: 1.55 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div></FadeIn>

      {/* ECONOMICS */}
      <FadeIn id="economics"><div style={{ maxWidth: 940, margin: "0 auto", padding: "100px 24px" }}>
        <div style={{ color: "#555", fontSize: 11, fontWeight: 600, letterSpacing: "2px", marginBottom: 12, fontFamily: "var(--mono)" }}>ECONOMICS</div>
        <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-2px", marginBottom: 14, lineHeight: 1.1 }}>How you make money</h2>
        <p style={{ color: "#888", fontSize: 15, marginBottom: 48, maxWidth: 600, lineHeight: 1.7 }}>You control pricing on both sides. Add any spread on buys. Take up to 3% of the seller yield.</p>
        <EconomicsCalc />
      </div></FadeIn>

      {/* POOL SIM (simplified) - LIQUIDITY */}
      <FadeIn id="simulator"><div style={{ maxWidth: 940, margin: "0 auto", padding: "100px 24px" }}>
        <div style={{ color: "#555", fontSize: 11, fontWeight: 600, letterSpacing: "2px", marginBottom: 12, fontFamily: "var(--mono)" }}>LIQUIDITY</div>
        <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-2px", marginBottom: 14 }}>How fast does liquidity clear?</h2>
        <p style={{ color: "#888", fontSize: 15, marginBottom: 40, maxWidth: 600, lineHeight: 1.7 }}>Matching is proportional — larger pools capture more buy volume. Adjust the sliders to model clearing times.</p>
        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "36px 28px" }}><PoolSimulator /></div>
      </div></FadeIn>

      {/* YIELD CALCULATOR */}
      <FadeIn id="yield"><div style={{ maxWidth: 940, margin: "0 auto", padding: "100px 24px" }}>
        <div style={{ color: "#555", fontSize: 11, fontWeight: 600, letterSpacing: "2px", marginBottom: 12, fontFamily: "var(--mono)" }}>SELLER YIELD</div>
        <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-2px", marginBottom: 14, lineHeight: 1.1 }}>The highest-yield farm in crypto</h2>
        <p style={{ color: "#888", fontSize: 15, marginBottom: 48, maxWidth: 600, lineHeight: 1.7 }}>Sellers earn 3% on every match. With reinvestment, the compounding is powerful. Model it yourself.</p>
        <YieldCalculator />
      </div></FadeIn>

      {/* SECURITY */}
      <FadeIn id="security"><div style={{ maxWidth: 940, margin: "0 auto", padding: "100px 24px" }}>
        <div style={{ color: "#555", fontSize: 11, fontWeight: 600, letterSpacing: "2px", marginBottom: 12, fontFamily: "var(--mono)" }}>SECURITY & TRUST</div>
        <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-2px", marginBottom: 14, lineHeight: 1.1 }}>Built on bank-grade verification</h2>
        <p style={{ color: "#888", fontSize: 15, marginBottom: 28, maxWidth: 600, lineHeight: 1.7 }}>Phoenix leverages the compliance infrastructure banks already built.</p>
        <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap", marginBottom: 44 }}>
          {[
            { name: "Bank of America", src: "./assets/banks/bofa-logo.png" },
            { name: "Chase", src: "./assets/banks/chase-logo.png" },
            { name: "Wells Fargo", src: "./assets/banks/wells-fargo-logo.png" },
          ].map(({ name, src }) => (
            <img key={name} src={src} alt={name} title={name} style={{ height: 28, width: "auto", maxWidth: 120, objectFit: "contain", opacity: 0.9 }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
          {[["Bank-verified identity", "Users log into their bank in a sandboxed WebView. Bank KYC + 2FA provides verification. No documents collected."], ["Credentials stay on device", "WebView runs locally. Phoenix navigates but never sees credentials. User types into their bank's real login."], ["Non-custodial escrow", "USDC in smart contracts on Base. Funds move only through verified fiat payment. Code-enforced rules."], ["Irrevocable Zelle", "Unlike cards, Zelle can't be charged back. Once confirmed, money is in the seller's account."]].map(([t, d], i) => (
            <div key={t} style={{ padding: "36px 28px", background: "rgba(255,255,255,0.015)", borderTop: i >= 2 ? "1px solid rgba(255,255,255,0.06)" : "none", borderLeft: i % 2 === 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{t}</div><div style={{ color: "#888", fontSize: 14, lineHeight: 1.65 }}>{d}</div>
            </div>
          ))}
        </div>
      </div></FadeIn>

      {/* ROADMAP */}
      <FadeIn id="roadmap"><div style={{ maxWidth: 940, margin: "0 auto", padding: "100px 24px" }}>
        <div style={{ color: "#555", fontSize: 11, fontWeight: 600, letterSpacing: "2px", marginBottom: 12, fontFamily: "var(--mono)" }}>ROADMAP</div>
        <h2 style={{ fontSize: "clamp(24px,3.5vw,36px)", fontWeight: 800, letterSpacing: "-1.5px", marginBottom: 40 }}>What's coming</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
          {[["More banks", "Expanding beyond BofA, Chase, Wells Fargo."], ["API key auth", "Server-to-server auth without user tokens."], ["Webhooks", "Real-time order and pool notifications."], ["Batch pool ops", "Multiple pools in one API call."], ["Sandbox", "Test with fake funds."], ["More chains/tokens", "Multi-chain and additional stablecoins."]].map(([t, d], i) => (
            <div key={t} style={{ padding: "28px 24px", background: "rgba(255,255,255,0.015)", borderTop: i >= 3 ? "1px solid rgba(255,255,255,0.06)" : "none", borderLeft: i % 3 !== 0 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{t}</div><div style={{ color: "#666", fontSize: 13, lineHeight: 1.5 }}>{d}</div>
            </div>
          ))}
        </div>
      </div></FadeIn>

      {/* CTA */}
      <FadeIn><div style={{ maxWidth: 940, margin: "0 auto", padding: "80px 24px 140px", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(28px,4.5vw,48px)", fontWeight: 800, letterSpacing: "-2px", marginBottom: 16, lineHeight: 1.1 }}>Ready to integrate?</h2>
        <p style={{ color: "#888", fontSize: 15, maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.7 }}>Phoenix turns Zelle — the instant, free, irrevocable payment network 100M+ Americans use — into a crypto on/off-ramp for your app.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <a href="mailto:sidd@phoenix.market" style={{ background: "#fff", color: "#000", borderRadius: 8, padding: "13px 28px", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Talk to the team</a>
          <a href="https://tinyurl.com/pmofframp" target="_blank" rel="noopener noreferrer" style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "13px 28px", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Read the docs</a>
        </div>
      </div></FadeIn>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "36px 24px", textAlign: "center" }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Phoenix Market</div>
        <div style={{ color: "#333", fontSize: 12, marginBottom: 12 }}>P2P crypto infrastructure powered by Zelle</div>
        <div style={{ color: "#222", fontSize: 11 }}>Confidential — for partners and integrators only</div>
      </div>
    </div>
  );
}
