import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Box, Typography, Button, Chip, TextField,
  MenuItem, Select, LinearProgress, Tooltip,
  Snackbar, Alert,
} from '@mui/material'
import {
  XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts'
import DownloadIcon from '@mui/icons-material/Download'
import RefreshIcon from '@mui/icons-material/Refresh'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

// ── Mock equity curve generator ───────────────────────────────────────────────
function generateEquityCurve(totalReturn = 0.34) {
  const points = []
  let value = 10000
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const years  = ['2022','2023','2024']
  let idx = 0
  for (const yr of years) {
    for (const mo of months) {
      const trend = (totalReturn / 36)
      const noise = (Math.random() - 0.46) * 0.04
      value = value * (1 + trend + noise)
      points.push({ date: `${mo} ${yr}`, value: parseFloat(value.toFixed(2)), idx })
      idx++
    }
  }
  return points
}

// ── Mock result generator ─────────────────────────────────────────────────────
function generateResult(strategy) {
  const totalReturn = parseFloat(((Math.random() * 0.6) - 0.1).toFixed(4))
  const sharpe      = parseFloat(((Math.random() * 2.5) + 0.2).toFixed(2))
  const maxDrawdown = parseFloat(((Math.random() * 0.3) + 0.05).toFixed(4))
  const winRate     = parseFloat(((Math.random() * 35) + 40).toFixed(1))
  const numTrades   = Math.floor(Math.random() * 180 + 20)
  const avgDuration = `${Math.floor(Math.random() * 12 + 1)}d ${Math.floor(Math.random() * 23)}h`
  return {
    strategy,
    totalReturn,
    sharpe,
    maxDrawdown,
    winRate,
    numTrades,
    avgDuration,
    equityCurve: generateEquityCurve(Math.random(), totalReturn),
    completedAt: new Date().toLocaleTimeString(),
  }
}

const INDICATORS = ['RSI', 'MACD', 'Bollinger Bands']
const CONDITIONS  = ['above', 'below', 'crosses above', 'crosses below']

const EMPTY_FORM = {
  name: 'My Strategy',
  indicator: 'RSI',
  condition: 'below',
  threshold: 30,
  from: '2022-01-01',
  to:   '2024-12-31',
  positionSize: 10,
}

// ── Metric card ───────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, color = '#e8eaf0', good, tooltip }) {
  return (
    <Tooltip title={tooltip || ''} placement="top">
      <Box sx={{
        background: '#0a0f1c',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '20px 20px 16px',
        cursor: tooltip ? 'help' : 'default',
        transition: 'border-color 0.2s',
        '&:hover': { borderColor: 'rgba(255,255,255,0.12)' },
      }}>
        <Typography sx={{
          fontSize: '10px', fontWeight: 700,
          color: '#3d4553', letterSpacing: '0.1em',
          textTransform: 'uppercase', mb: 1.5,
        }}>
          {label}
        </Typography>
        <Typography sx={{
          fontFamily: "'Syne', sans-serif",
          fontSize: '28px', fontWeight: 800,
          color, letterSpacing: '-0.02em', lineHeight: 1,
        }}>
          {value}
        </Typography>
        {sub && (
          <Typography sx={{ fontSize: '11px', color: '#3d4553', mt: 0.8 }}>
            {sub}
          </Typography>
        )}
        {good !== undefined && (
          <Box sx={{
            mt: 1.5, display: 'inline-block',
            fontSize: '10px', fontWeight: 600,
            borderRadius: '4px', padding: '2px 7px',
            background: good ? 'rgba(0,229,160,0.1)' : 'rgba(255,82,82,0.1)',
            color: good ? '#00e5a0' : '#ff5252',
            border: `1px solid ${good ? 'rgba(0,229,160,0.25)' : 'rgba(255,82,82,0.25)'}`,
          }}>
            {good ? '▲ Good' : '▼ Weak'}
          </Box>
        )}
      </Box>
    </Tooltip>
  )
}

// ── Custom chart tooltip ──────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <Box sx={{
      background: '#0d1220',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px', padding: '10px 14px',
    }}>
      <Typography sx={{ fontSize: '11px', color: '#3d4553', mb: 0.5 }}>{label}</Typography>
      <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#00e5a0' }}>
        ${payload[0].value.toLocaleString()}
      </Typography>
    </Box>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function BacktestPage() {
  const location = useLocation()

  const initialForm = location.state?.strategy
    ? {
        name:         location.state.strategy.name,
        indicator:    location.state.strategy.indicator,
        condition:    location.state.strategy.condition,
        threshold:    location.state.strategy.threshold,
        from:         location.state.strategy.from,
        to:           location.state.strategy.to,
        positionSize: location.state.strategy.positionSize,
      }
    : EMPTY_FORM

  const [form, setForm]         = useState(initialForm)
  const [status, setStatus]     = useState('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult]     = useState(null)
  const [toast, setToast]       = useState({
    open: !!location.state?.strategy,
    msg:  location.state?.strategy
      ? `"${location.state.strategy.name}" loaded — ready to run`
      : '',
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleRun = () => {
    setStatus('running')
    setProgress(0)
    setResult(null)

    const steps = [
      { pct: 12,  delay: 300  },
      { pct: 28,  delay: 700  },
      { pct: 45,  delay: 1200 },
      { pct: 63,  delay: 1800 },
      { pct: 79,  delay: 2400 },
      { pct: 91,  delay: 3000 },
      { pct: 100, delay: 3600 },
    ]

    steps.forEach(({ pct, delay }) => {
      setTimeout(() => {
        setProgress(pct)
        if (pct === 100) {
          setTimeout(() => {
            setResult(generateResult(form))
            setStatus('done')
          }, 400)
        }
      }, delay)
    })
  }

  const handleReset = () => {
    setStatus('idle')
    setProgress(0)
    setResult(null)
  }

  const handleExport = () => {
    if (!result) return
    const rows = [
      ['Date', 'Portfolio Value'],
      ...result.equityCurve.map(p => [p.date, p.value]),
    ]
    const csv  = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${form.name.replace(/\s+/g, '_')}_backtest.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Styles ──────────────────────────────────────────────────────────────────
  const s = {
    page: {
      minHeight: '100vh',
      background: '#080c14',
      color: '#e8eaf0',
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      padding: '32px 32px 64px',
    },
    pageTitle: {
      fontFamily: "'Syne', sans-serif",
      fontSize: '28px', fontWeight: 800,
      letterSpacing: '-0.02em', color: '#e8eaf0',
    },
    pageSub: { fontSize: '13px', color: '#3d4553', mt: 0.5, mb: 4 },
    layout: {
      display: 'grid',
      gridTemplateColumns: '320px 1fr',
      gap: '24px',
      alignItems: 'start',
    },
    formBox: {
      background: '#0a0f1c',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '14px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 2.5,
      position: 'sticky',
      top: '24px',
    },
    label: {
      fontSize: '10px', fontWeight: 700,
      color: '#3d4553', letterSpacing: '0.1em',
      textTransform: 'uppercase', mb: 0.8, display: 'block',
    },
    selectSx: {
      color: '#e8eaf0', background: '#080c14',
      borderRadius: '8px', fontSize: '13px',
      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,229,160,0.4)' },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00e5a0' },
      '& .MuiSvgIcon-root': { color: '#3d4553' },
    },
    menuProps: {
      PaperProps: {
        sx: {
          background: '#0d1220',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#e8eaf0',
          '& .MuiMenuItem-root:hover': { background: 'rgba(0,229,160,0.08)' },
          '& .MuiMenuItem-root.Mui-selected': { background: 'rgba(0,229,160,0.12)' },
        },
      },
    },
    inputSx: {
      '& .MuiOutlinedInput-root': {
        color: '#e8eaf0', background: '#080c14',
        borderRadius: '8px', fontSize: '13px',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
        '&:hover fieldset': { borderColor: 'rgba(0,229,160,0.4)' },
        '&.Mui-focused fieldset': { borderColor: '#00e5a0' },
      },
      '& .MuiInputLabel-root': { color: '#3d4553', fontSize: '13px' },
      '& .MuiInputLabel-root.Mui-focused': { color: '#00e5a0' },
    },
    runBtn: {
      background: '#00e5a0', color: '#080c14',
      fontWeight: 700, fontSize: '14px',
      borderRadius: '8px', textTransform: 'none',
      padding: '10px 0', width: '100%',
      '&:hover': { background: '#00c98c' },
      '&:disabled': { background: 'rgba(0,229,160,0.3)', color: '#080c14' },
    },
    resultsBox: { display: 'flex', flexDirection: 'column', gap: 3 },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: '12px',
    },
    chartBox: {
      background: '#0a0f1c',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '14px',
      padding: '24px',
    },
    idleBox: {
      background: '#0a0f1c',
      border: '1px dashed rgba(255,255,255,0.08)',
      borderRadius: '14px',
      padding: '80px 24px',
      textAlign: 'center',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 2,
    },
  }

  return (
    <Box sx={s.page}>
      <Typography sx={s.pageTitle}>📈 Backtest Engine</Typography>
      <Typography sx={s.pageSub}>
        Simulate a strategy against historical data · Async job execution · CSV export
      </Typography>

      <Box sx={s.layout}>

        {/* ── Left: Form ── */}
        <Box sx={s.formBox}>
          <Typography sx={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '15px', fontWeight: 700, color: '#e8eaf0', mb: 0.5,
          }}>
            Strategy Config
          </Typography>

          {location.state?.strategy && (
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: '13px !important', color: '#00e5a0 !important' }} />}
              label={`Loaded: ${location.state.strategy.name}`}
              size="small"
              sx={{
                fontSize: '11px', background: 'rgba(0,229,160,0.08)',
                color: '#00e5a0', border: '1px solid rgba(0,229,160,0.2)',
                borderRadius: '6px',
              }}
            />
          )}

          <Box>
            <Typography component="label" sx={s.label}>Strategy name</Typography>
            <TextField fullWidth size="small" value={form.name}
              onChange={e => set('name', e.target.value)} sx={s.inputSx} />
          </Box>

          <Box>
            <Typography component="label" sx={s.label}>Indicator</Typography>
            <Select fullWidth size="small" value={form.indicator}
              onChange={e => set('indicator', e.target.value)}
              sx={s.selectSx} MenuProps={s.menuProps}>
              {INDICATORS.map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
            </Select>
          </Box>

          <Box>
            <Typography component="label" sx={s.label}>Condition</Typography>
            <Select fullWidth size="small" value={form.condition}
              onChange={e => set('condition', e.target.value)}
              sx={s.selectSx} MenuProps={s.menuProps}>
              {CONDITIONS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </Box>

          <Box>
            <Typography component="label" sx={s.label}>Threshold</Typography>
            <TextField fullWidth size="small" type="number"
              value={form.threshold}
              onChange={e => set('threshold', parseFloat(e.target.value))}
              sx={s.inputSx} />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <Box>
              <Typography component="label" sx={s.label}>From</Typography>
              <TextField fullWidth size="small" type="date" value={form.from}
                onChange={e => set('from', e.target.value)}
                InputLabelProps={{ shrink: true }} sx={s.inputSx} />
            </Box>
            <Box>
              <Typography component="label" sx={s.label}>To</Typography>
              <TextField fullWidth size="small" type="date" value={form.to}
                onChange={e => set('to', e.target.value)}
                InputLabelProps={{ shrink: true }} sx={s.inputSx} />
            </Box>
          </Box>

          <Box>
            <Typography component="label" sx={s.label}>Position size (%)</Typography>
            <TextField fullWidth size="small" type="number"
              value={form.positionSize}
              onChange={e => set('positionSize', parseFloat(e.target.value))}
              inputProps={{ min: 1, max: 100 }} sx={s.inputSx} />
          </Box>

          <Button variant="contained" sx={s.runBtn}
            onClick={handleRun} disabled={status === 'running'}>
            {status === 'running' ? 'Running...' : 'Run Backtest'}
          </Button>

          {status === 'done' && (
            <Button variant="outlined"
              startIcon={<RefreshIcon sx={{ fontSize: '14px' }} />}
              onClick={handleReset}
              sx={{
                color: '#8892a4', borderColor: 'rgba(255,255,255,0.1)',
                textTransform: 'none', fontWeight: 500, borderRadius: '8px',
                '&:hover': { borderColor: '#8892a4' },
              }}>
              Reset
            </Button>
          )}
        </Box>

        {/* ── Right: Results ── */}
        <Box sx={s.resultsBox}>

          {status === 'running' && (
            <Box sx={{
              background: '#0a0f1c',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px', padding: '32px 28px',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <AccessTimeIcon sx={{ fontSize: '18px', color: '#00e5a0', animation: 'spin 2s linear infinite' }} />
                <Typography sx={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 700 }}>
                  Running backtest...
                </Typography>
                <Typography sx={{ fontSize: '13px', color: '#3d4553', ml: 'auto' }}>
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{
                borderRadius: '4px', height: '6px',
                background: 'rgba(255,255,255,0.06)',
                '& .MuiLinearProgress-bar': { background: '#00e5a0', borderRadius: '4px' },
              }} />
              <Box sx={{ mt: 2.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { pct: 12, label: 'Loading historical data from TimescaleDB' },
                  { pct: 45, label: 'Calculating indicators tick-by-tick'      },
                  { pct: 79, label: 'Simulating trades with position sizing'   },
                  { pct: 95, label: 'Computing Sharpe, drawdown, equity curve' },
                ].map(step => (
                  <Box key={step.pct} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                      background: progress >= step.pct ? '#00e5a0' : 'rgba(255,255,255,0.1)',
                      transition: 'background 0.4s',
                    }} />
                    <Typography sx={{
                      fontSize: '12px',
                      color: progress >= step.pct ? '#8892a4' : '#3d4553',
                      transition: 'color 0.4s',
                    }}>
                      {step.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {status === 'idle' && (
            <Box sx={s.idleBox}>
              <Typography sx={{ fontSize: '40px' }}>🔬</Typography>
              <Typography sx={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 700 }}>
                Ready to backtest
              </Typography>
              <Typography sx={{ fontSize: '14px', color: '#3d4553', maxWidth: '360px', lineHeight: 1.7 }}>
                Configure your strategy on the left and hit Run Backtest. Results appear here with a full equity curve and performance metrics.
              </Typography>
            </Box>
          )}

          {status === 'done' && result && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                    <CheckCircleIcon sx={{ fontSize: '18px', color: '#00e5a0' }} />
                    <Typography sx={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700 }}>
                      {result.strategy.name}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '12px', color: '#3d4553' }}>
                    Completed at {result.completedAt} · {result.strategy.from} → {result.strategy.to}
                  </Typography>
                </Box>
                <Button variant="outlined"
                  startIcon={<DownloadIcon sx={{ fontSize: '14px' }} />}
                  onClick={handleExport} size="small"
                  sx={{
                    color: '#8892a4', borderColor: 'rgba(255,255,255,0.1)',
                    textTransform: 'none', fontWeight: 500, borderRadius: '8px', fontSize: '12px',
                    '&:hover': { borderColor: '#8892a4', color: '#e8eaf0' },
                  }}>
                  Export CSV
                </Button>
              </Box>

              <Box sx={s.metricsGrid}>
                <MetricCard label="Total Return"
                  value={`${result.totalReturn >= 0 ? '+' : ''}${(result.totalReturn * 100).toFixed(2)}%`}
                  color={result.totalReturn >= 0 ? '#00e5a0' : '#ff5252'}
                  good={result.totalReturn > 0.1}
                  tooltip="Total portfolio return over the backtest period" />
                <MetricCard label="Sharpe Ratio"
                  value={result.sharpe.toFixed(2)}
                  color={result.sharpe > 1 ? '#00e5a0' : result.sharpe > 0.5 ? '#f0a500' : '#ff5252'}
                  good={result.sharpe > 1}
                  tooltip="Risk-adjusted return. >1 is good, >2 is excellent"
                  sub="risk-adjusted" />
                <MetricCard label="Max Drawdown"
                  value={`-${(result.maxDrawdown * 100).toFixed(2)}%`}
                  color={result.maxDrawdown > 0.2 ? '#ff5252' : result.maxDrawdown > 0.1 ? '#f0a500' : '#00e5a0'}
                  good={result.maxDrawdown < 0.15}
                  tooltip="Worst peak-to-trough decline. Lower is better"
                  sub="worst decline" />
                <MetricCard label="Win Rate"
                  value={`${result.winRate.toFixed(1)}%`}
                  color={result.winRate > 55 ? '#00e5a0' : result.winRate > 45 ? '#f0a500' : '#ff5252'}
                  good={result.winRate > 50}
                  tooltip="Percentage of trades that were profitable" />
                <MetricCard label="# of Trades"
                  value={result.numTrades} color="#e8eaf0"
                  tooltip="Total number of trades executed in simulation"
                  sub={`${result.strategy.from} → ${result.strategy.to}`} />
                <MetricCard label="Avg Duration"
                  value={result.avgDuration} color="#8892a4"
                  tooltip="Average time a position was held"
                  sub="per trade" />
              </Box>

              <Box sx={s.chartBox}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Typography sx={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 700, mb: 0.3 }}>
                      Equity Curve
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#3d4553' }}>
                      Starting capital $10,000 · {result.strategy.indicator} {result.strategy.condition} {result.strategy.threshold}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '11px', color: '#3d4553' }}>Final value</Typography>
                    <Typography sx={{
                      fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 800,
                      color: result.totalReturn >= 0 ? '#00e5a0' : '#ff5252',
                    }}>
                      ${result.equityCurve[result.equityCurve.length - 1].value.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>

                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={result.equityCurve} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#00e5a0" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#00e5a0" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#3d4553', fontSize: 10 }}
                      axisLine={false} tickLine={false} interval={5} />
                    <YAxis tick={{ fill: '#3d4553', fontSize: 10 }}
                      axisLine={false} tickLine={false}
                      tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} width={44} />
                    <ReTooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="value"
                      stroke="#00e5a0" strokeWidth={2}
                      fill="url(#equityGrad)" dot={false}
                      activeDot={{ r: 4, fill: '#00e5a0', strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>

                <Box sx={{ display: 'flex', gap: 3, mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: '20px', height: '2px', background: '#00e5a0', borderRadius: '1px' }} />
                    <Typography sx={{ fontSize: '11px', color: '#3d4553' }}>Portfolio value</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.15)' }} />
                    <Typography sx={{ fontSize: '11px', color: '#3d4553' }}>Starting capital $10k</Typography>
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="info"
          onClose={() => setToast(t => ({ ...t, open: false }))}
          sx={{
            background: '#0d1220',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#e8eaf0',
            '& .MuiAlert-icon': { color: '#00e5a0' },
          }}>
          {toast.msg}
        </Alert>
      </Snackbar>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Box>
  )
}