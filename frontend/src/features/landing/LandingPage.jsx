import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, Chip } from '@mui/material'

const TICKERS = [
  { sym: 'AAPL', price: '192.43', change: '+1.24%', up: true },
  { sym: 'MSFT', price: '415.20', change: '+0.87%', up: true },
  { sym: 'NVDA', price: '887.54', change: '-2.31%', up: false },
  { sym: 'TSLA', price: '248.10', change: '+3.05%', up: true },
  { sym: 'AMZN', price: '192.72', change: '-0.44%', up: false },
  { sym: 'GOOG', price: '172.38', change: '+1.10%', up: true },
  { sym: 'META', price: '521.90', change: '+2.67%', up: true },
  { sym: 'SPY',  price: '524.11', change: '-0.18%', up: false },
]

const FEATURES = [
  {
    icon: '⚡',
    title: 'Real-Time Screener',
    desc: 'Tick-by-tick price updates across 500+ tickers with RSI, MACD, and Bollinger Band alerts pushed instantly to your dashboard.',
  },
  {
    icon: '🧪',
    title: 'Backtesting Engine',
    desc: 'Test any strategy against 3+ years of historical data. Get Sharpe ratio, max drawdown, win rate, and a full equity curve.',
  },
  {
    icon: '📡',
    title: 'Live Alert System',
    desc: 'WebSocket-powered alerts fire the moment a ticker crosses your threshold — no polling, no delay.',
  },
]

const STATS = [
  { value: '500+', label: 'Tickers Tracked' },
  { value: '3yrs', label: 'Historical Data' },
  { value: '<50ms', label: 'Alert Latency' },
  { value: '3', label: 'Indicators Built-in' },
]

// Tiny animated sparkline SVG
function Sparkline({ up }) {
  const points = up
    ? '0,18 8,15 16,17 24,12 32,10 40,7 48,9 56,4 64,6 72,2'
    : '0,4 8,6 16,4 24,9 32,8 40,13 48,11 56,15 64,14 72,18'
  return (
    <svg width="72" height="20" viewBox="0 0 72 20" fill="none">
      <polyline
        points={points}
        stroke={up ? '#00e5a0' : '#ff5252'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [prices, setPrices] = useState(TICKERS)
  const heroRef = useRef(null)

  // Entry animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  // Simulate live price flicker
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev =>
        prev.map(t => {
          const delta = (Math.random() - 0.49) * 0.6
          const newPrice = (parseFloat(t.price) + delta).toFixed(2)
          const changePct = delta >= 0
            ? `+${(Math.random() * 3).toFixed(2)}%`
            : `-${(Math.random() * 3).toFixed(2)}%`
          return { ...t, price: newPrice, change: changePct, up: delta >= 0 }
        })
      )
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  const styles = {
    page: {
      minHeight: '100vh',
      background: '#080c14',
      color: '#e8eaf0',
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      overflowX: 'hidden',
    },
    // ── Hero ──────────────────────────────────────────────
    hero: {
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '0 24px',
      overflow: 'hidden',
    },
    gridBg: {
      position: 'absolute',
      inset: 0,
      backgroundImage: `
        linear-gradient(rgba(0,229,160,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,229,160,0.04) 1px, transparent 1px)
      `,
      backgroundSize: '48px 48px',
      zIndex: 0,
    },
    glow: {
      position: 'absolute',
      top: '30%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '600px',
      height: '600px',
      background: 'radial-gradient(circle, rgba(0,229,160,0.08) 0%, transparent 70%)',
      zIndex: 0,
      pointerEvents: 'none',
    },
    chip: {
      background: 'rgba(0,229,160,0.1)',
      border: '1px solid rgba(0,229,160,0.3)',
      color: '#00e5a0',
      fontSize: '11px',
      letterSpacing: '0.1em',
      fontWeight: 600,
      mb: 3,
      zIndex: 1,
    },
    heroTitle: {
      fontFamily: "'Syne', 'DM Sans', sans-serif",
      fontSize: 'clamp(48px, 8vw, 96px)',
      fontWeight: 800,
      lineHeight: 1.0,
      letterSpacing: '-0.03em',
      zIndex: 1,
      mb: 1,
    },
    accent: {
      color: '#00e5a0',
      display: 'block',
    },
    heroSub: {
      fontSize: 'clamp(15px, 2vw, 19px)',
      color: '#8892a4',
      maxWidth: '520px',
      lineHeight: 1.7,
      zIndex: 1,
      mb: 4,
      fontWeight: 400,
    },
    btnPrimary: {
      background: '#00e5a0',
      color: '#080c14',
      fontWeight: 700,
      fontSize: '15px',
      borderRadius: '8px',
      padding: '12px 32px',
      textTransform: 'none',
      letterSpacing: '0.01em',
      zIndex: 1,
      '&:hover': {
        background: '#00c98c',
        transform: 'translateY(-1px)',
        boxShadow: '0 8px 32px rgba(0,229,160,0.25)',
      },
      transition: 'all 0.2s ease',
    },
    btnSecondary: {
      border: '1px solid rgba(232,234,240,0.15)',
      color: '#8892a4',
      fontWeight: 500,
      fontSize: '15px',
      borderRadius: '8px',
      padding: '12px 32px',
      textTransform: 'none',
      zIndex: 1,
      '&:hover': {
        border: '1px solid rgba(232,234,240,0.3)',
        color: '#e8eaf0',
        background: 'rgba(255,255,255,0.04)',
      },
      transition: 'all 0.2s ease',
    },
    // ── Ticker tape ──────────────────────────────────────
    tickerSection: {
      width: '100%',
      zIndex: 1,
      mt: 8,
      position: 'relative',
    },
    tickerLabel: {
      fontSize: '10px',
      letterSpacing: '0.12em',
      color: '#3d4553',
      fontWeight: 600,
      textTransform: 'uppercase',
      mb: 2,
    },
    tickerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1px',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '12px',
      overflow: 'hidden',
      maxWidth: '780px',
      margin: '0 auto',
    },
    tickerCell: {
      background: '#0d1220',
      padding: '14px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      transition: 'background 0.3s ease',
      '&:hover': { background: '#111827' },
    },
    // ── Stats ─────────────────────────────────────────────
    statsBar: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1px',
      background: 'rgba(255,255,255,0.05)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    },
    statCell: {
      padding: '40px 24px',
      textAlign: 'center',
      background: '#080c14',
    },
    statValue: {
      fontFamily: "'Syne', sans-serif",
      fontSize: '42px',
      fontWeight: 800,
      color: '#00e5a0',
      lineHeight: 1,
      letterSpacing: '-0.02em',
    },
    statLabel: {
      fontSize: '12px',
      color: '#3d4553',
      fontWeight: 500,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      mt: 1,
    },
    // ── Features ──────────────────────────────────────────
    featuresSection: {
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '100px 24px',
    },
    sectionEyebrow: {
      fontSize: '11px',
      letterSpacing: '0.15em',
      color: '#00e5a0',
      fontWeight: 600,
      textTransform: 'uppercase',
      mb: 2,
    },
    sectionTitle: {
      fontFamily: "'Syne', sans-serif",
      fontSize: 'clamp(28px, 4vw, 48px)',
      fontWeight: 800,
      letterSpacing: '-0.02em',
      lineHeight: 1.1,
      mb: 2,
    },
    sectionSub: {
      color: '#8892a4',
      fontSize: '16px',
      maxWidth: '480px',
      lineHeight: 1.7,
      mb: 8,
    },
    featureGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '16px',
      overflow: 'hidden',
    },
    featureCard: {
      background: '#0a0f1c',
      padding: '36px 32px',
      transition: 'background 0.2s',
      cursor: 'default',
      '&:hover': { background: '#0e1525' },
    },
    featureIcon: {
      fontSize: '28px',
      mb: 2,
      display: 'block',
    },
    featureTitle: {
      fontFamily: "'Syne', sans-serif",
      fontSize: '18px',
      fontWeight: 700,
      mb: 1.5,
      letterSpacing: '-0.01em',
    },
    featureDesc: {
      color: '#8892a4',
      fontSize: '14px',
      lineHeight: 1.75,
    },
    // ── CTA ───────────────────────────────────────────────
    ctaSection: {
      textAlign: 'center',
      padding: '100px 24px',
      position: 'relative',
      overflow: 'hidden',
    },
    ctaGlow: {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '800px',
      height: '300px',
      background: 'radial-gradient(ellipse, rgba(0,229,160,0.06) 0%, transparent 70%)',
      pointerEvents: 'none',
    },
    ctaTitle: {
      fontFamily: "'Syne', sans-serif",
      fontSize: 'clamp(32px, 5vw, 60px)',
      fontWeight: 800,
      letterSpacing: '-0.03em',
      lineHeight: 1.1,
      mb: 2,
    },
    ctaSub: {
      color: '#8892a4',
      fontSize: '16px',
      mb: 5,
    },
    // ── Footer ────────────────────────────────────────────
    footer: {
      borderTop: '1px solid rgba(255,255,255,0.05)',
      padding: '24px',
      textAlign: 'center',
      color: '#3d4553',
      fontSize: '13px',
    },
  }

  const fadeUp = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
  })

  return (
    <Box sx={styles.page}>
      {/* ── Hero ── */}
      <Box sx={styles.hero} ref={heroRef}>
        <Box sx={styles.gridBg} />
        <Box sx={styles.glow} />

        <Box style={fadeUp(0)}>
          <Chip label="LIVE MARKET DATA · REAL-TIME ALERTS" sx={styles.chip} size="small" />
        </Box>

        <Typography sx={styles.heroTitle} style={fadeUp(100)}>
          Screen smarter.
          <Box component="span" sx={styles.accent}> Trade sharper.</Box>
        </Typography>

        <Typography sx={styles.heroSub} style={fadeUp(200)}>
          QuantScope is a real-time stock screener and backtesting engine built
          for traders who want edge — not noise.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, zIndex: 1 }} style={fadeUp(300)}>
          <Button
            variant="contained"
            sx={styles.btnPrimary}
            onClick={() => navigate('/screener')}
          >
            Open Screener
          </Button>
          <Button
            variant="outlined"
            sx={styles.btnSecondary}
            onClick={() => navigate('/backtest')}
          >
            Run a Backtest
          </Button>
        </Box>

        {/* Ticker grid */}
        <Box sx={styles.tickerSection} style={fadeUp(400)}>
          <Typography sx={styles.tickerLabel}>Live market feed</Typography>
          <Box sx={styles.tickerGrid}>
            {prices.map((t) => (
              <Box key={t.sym} sx={styles.tickerCell}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#e8eaf0', letterSpacing: '0.05em' }}>
                    {t.sym}
                  </Typography>
                  <Typography sx={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: t.up ? '#00e5a0' : '#ff5252',
                    transition: 'color 0.3s',
                  }}>
                    {t.change}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <Typography sx={{
                    fontFamily: "'Syne', monospace",
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#e8eaf0',
                    letterSpacing: '-0.01em',
                    transition: 'all 0.4s ease',
                  }}>
                    ${t.price}
                  </Typography>
                  <Sparkline up={t.up} />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── Stats bar ── */}
      <Box sx={styles.statsBar}>
        {STATS.map((s) => (
          <Box key={s.label} sx={styles.statCell}>
            <Typography sx={styles.statValue}>{s.value}</Typography>
            <Typography sx={styles.statLabel}>{s.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* ── Features ── */}
      <Box sx={styles.featuresSection}>
        <Typography sx={styles.sectionEyebrow}>What's inside</Typography>
        <Typography sx={styles.sectionTitle}>
          Everything you need.<br />Nothing you don't.
        </Typography>
        <Typography sx={styles.sectionSub}>
          Three pipelines. One dashboard. Built on the same patterns used in production quant systems.
        </Typography>
        <Box sx={styles.featureGrid}>
          {FEATURES.map((f) => (
            <Box key={f.title} sx={styles.featureCard}>
              <Box component="span" sx={styles.featureIcon}>{f.icon}</Box>
              <Typography sx={styles.featureTitle}>{f.title}</Typography>
              <Typography sx={styles.featureDesc}>{f.desc}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── CTA ── */}
      <Box sx={styles.ctaSection}>
        <Box sx={styles.ctaGlow} />
        <Typography sx={styles.ctaTitle}>
          Ready to find your edge?
        </Typography>
        <Typography sx={styles.ctaSub}>
          Start screening live tickers or test a strategy right now.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            sx={styles.btnPrimary}
            onClick={() => navigate('/screener')}
          >
            Open Screener
          </Button>
          <Button
            variant="outlined"
            sx={styles.btnSecondary}
            onClick={() => navigate('/strategy')}
          >
            Build a Strategy
          </Button>
        </Box>
      </Box>

      {/* ── Footer ── */}
      <Box sx={styles.footer}>
        <Typography sx={{ fontSize: '13px', color: '#3d4553' }}>
          QuantScope · Built with FastAPI, Redis, TimescaleDB & React
        </Typography>
      </Box>
    </Box>
  )
}
