import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Button, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tooltip, Snackbar, Alert
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import CloseIcon from '@mui/icons-material/Close'

// ── Mock Data ─────────────────────────────────────────────────────────────────
const INITIAL_TICKERS = [
  { id: 1, sym: 'AAPL',  price: 192.43, change: 1.24,  rsi: 42.3, macd: 'Bullish',  bb: 'Normal',    volume: '48.2M', alert: false },
  { id: 2, sym: 'MSFT',  price: 415.20, change: 0.87,  rsi: 61.5, macd: 'Bullish',  bb: 'Upper',     volume: '22.1M', alert: true  },
  { id: 3, sym: 'NVDA',  price: 887.54, change: -2.31, rsi: 28.7, macd: 'Bearish',  bb: 'Lower',     volume: '61.4M', alert: true  },
  { id: 4, sym: 'TSLA',  price: 248.10, change: 3.05,  rsi: 55.1, macd: 'Bullish',  bb: 'Normal',    volume: '93.7M', alert: false },
  { id: 5, sym: 'AMZN',  price: 192.72, change: -0.44, rsi: 49.8, macd: 'Neutral',  bb: 'Normal',    volume: '31.2M', alert: false },
  { id: 6, sym: 'GOOG',  price: 172.38, change: 1.10,  rsi: 53.2, macd: 'Bullish',  bb: 'Normal',    volume: '19.8M', alert: false },
  { id: 7, sym: 'META',  price: 521.90, change: 2.67,  rsi: 71.4, macd: 'Bullish',  bb: 'Upper',     volume: '14.5M', alert: true  },
  { id: 8, sym: 'SPY',   price: 524.11, change: -0.18, rsi: 47.6, macd: 'Neutral',  bb: 'Normal',    volume: '78.3M', alert: false },
  { id: 9, sym: 'AMD',   price: 167.34, change: -1.88, rsi: 31.2, macd: 'Bearish',  bb: 'Lower',     volume: '44.1M', alert: true  },
  { id: 10, sym: 'NFLX', price: 628.45, change: 0.54,  rsi: 58.9, macd: 'Bullish',  bb: 'Normal',    volume: '7.2M',  alert: false },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function getRsiColor(rsi) {
  if (rsi < 30) return '#ff5252'
  if (rsi > 70) return '#00e5a0'
  return '#8892a4'
}

function getRsiLabel(rsi) {
  if (rsi < 30) return 'Oversold'
  if (rsi > 70) return 'Overbought'
  return 'Neutral'
}

function getMacdColor(macd) {
  if (macd === 'Bullish') return '#00e5a0'
  if (macd === 'Bearish') return '#ff5252'
  return '#f0a500'
}

function getBbColor(bb) {
  if (bb === 'Upper') return '#ff5252'
  if (bb === 'Lower') return '#00e5a0'
  return '#8892a4'
}

// RSI mini bar
function RsiBar({ value }) {
  const pct = Math.min(Math.max(value, 0), 100)
  const color = getRsiColor(value)
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{
        width: '72px', height: '4px',
        background: 'rgba(255,255,255,0.07)',
        borderRadius: '2px', overflow: 'hidden', flexShrink: 0,
      }}>
        <Box sx={{
          width: `${pct}%`, height: '100%',
          background: color, borderRadius: '2px',
          transition: 'width 0.6s ease',
        }} />
      </Box>
      <Typography sx={{ fontSize: '13px', fontWeight: 600, color, minWidth: '36px' }}>
        {value.toFixed(1)}
      </Typography>
      <Typography sx={{ fontSize: '10px', color: 'rgba(136,146,164,0.6)', letterSpacing: '0.05em' }}>
        {getRsiLabel(value)}
      </Typography>
    </Box>
  )
}

// Sparkline
function Sparkline({ up }) {
  const pts = up
    ? '0,14 10,11 20,13 30,8 40,6 50,4 60,7 70,3'
    : '0,3  10,5  20,3  30,8 40,7 50,11 60,9 70,14'
  return (
    <svg width="70" height="18" viewBox="0 0 70 18" fill="none">
      <polyline points={pts} stroke={up ? '#00e5a0' : '#ff5252'}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ScreenerPage() {
  const [tickers, setTickers]       = useState(INITIAL_TICKERS)
  const [modalOpen, setModalOpen]   = useState(false)
  const [newSym, setNewSym]         = useState('')
  const [symError, setSymError]     = useState('')
  const [filter, setFilter]         = useState('All')
  const [toast, setToast]           = useState({ open: false, msg: '', severity: 'success' })
  const [alertLog, setAlertLog]     = useState([
    { sym: 'NVDA', msg: 'RSI dropped below 30 — Oversold', time: '09:42:11' },
    { sym: 'META', msg: 'RSI exceeded 70 — Overbought',   time: '09:38:54' },
    { sym: 'AMD',  msg: 'RSI dropped below 30 — Oversold', time: '09:31:20' },
  ])

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTickers(prev => prev.map(t => {
        const delta    = (Math.random() - 0.49) * 1.2
        const newPrice = Math.max(1, parseFloat((t.price + delta).toFixed(2)))
        const newRsi   = Math.min(100, Math.max(0, t.rsi + (Math.random() - 0.5) * 1.5))
        const newAlert = newRsi < 30 || newRsi > 70

        // Fire mock WS alert
        if (newAlert && !t.alert) {
          const msg = newRsi < 30
            ? `RSI dropped below 30 — Oversold`
            : `RSI exceeded 70 — Overbought`
          const now = new Date().toLocaleTimeString('en-US', { hour12: false })
          setAlertLog(log => [{ sym: t.sym, msg, time: now }, ...log.slice(0, 9)])
          setToast({ open: true, msg: `⚡ ${t.sym}: ${msg}`, severity: 'warning' })
        }

        return {
          ...t,
          price:  newPrice,
          change: parseFloat((t.change + (Math.random() - 0.5) * 0.1).toFixed(2)),
          rsi:    parseFloat(newRsi.toFixed(1)),
          alert:  newAlert,
        }
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Filter
  const filtered = tickers.filter(t => {
    if (filter === 'Alerts')    return t.alert
    if (filter === 'Oversold')  return t.rsi < 30
    if (filter === 'Overbought') return t.rsi > 70
    return true
  })

  // Add ticker
  const handleAdd = useCallback(() => {
    const sym = newSym.trim().toUpperCase()
    if (!sym) { setSymError('Enter a ticker symbol'); return }
    if (sym.length > 5) { setSymError('Max 5 characters'); return }
    if (tickers.find(t => t.sym === sym)) { setSymError('Already tracking this ticker'); return }

    const newTicker = {
      id:     Date.now(),
      sym,
      price:  parseFloat((Math.random() * 400 + 50).toFixed(2)),
      change: parseFloat(((Math.random() - 0.5) * 4).toFixed(2)),
      rsi:    parseFloat((Math.random() * 60 + 20).toFixed(1)),
      macd:   ['Bullish', 'Bearish', 'Neutral'][Math.floor(Math.random() * 3)],
      bb:     ['Normal', 'Upper', 'Lower'][Math.floor(Math.random() * 3)],
      volume: `${(Math.random() * 80 + 5).toFixed(1)}M`,
      alert:  false,
    }
    setTickers(prev => [...prev, newTicker])
    setToast({ open: true, msg: `${sym} added to screener`, severity: 'success' })
    setModalOpen(false)
    setNewSym('')
    setSymError('')
  }, [newSym, tickers])

  // Remove ticker
  const handleRemove = (id) => {
    setTickers(prev => prev.filter(t => t.id !== id))
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
    header: {
      display: 'flex', alignItems: 'flex-start',
      justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2,
    },
    pageTitle: {
      fontFamily: "'Syne', sans-serif",
      fontSize: '28px', fontWeight: 800,
      letterSpacing: '-0.02em', color: '#e8eaf0',
    },
    pageSub: { fontSize: '13px', color: '#3d4553', mt: 0.5 },
    liveDot: {
      display: 'inline-block', width: '7px', height: '7px',
      borderRadius: '50%', background: '#00e5a0',
      mr: 1, animation: 'pulse 1.8s ease-in-out infinite',
    },
    addBtn: {
      background: '#00e5a0', color: '#080c14',
      fontWeight: 700, fontSize: '13px',
      borderRadius: '8px', textTransform: 'none',
      padding: '8px 20px',
      '&:hover': { background: '#00c98c' },
    },
    filterRow: {
      display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap',
    },
    filterChip: (active) => ({
      fontSize: '12px', fontWeight: 600,
      borderRadius: '6px', cursor: 'pointer',
      border: active ? '1px solid #00e5a0' : '1px solid rgba(255,255,255,0.08)',
      background: active ? 'rgba(0,229,160,0.1)' : 'transparent',
      color: active ? '#00e5a0' : '#8892a4',
      '&:hover': { borderColor: '#00e5a0', color: '#00e5a0' },
      transition: 'all 0.15s',
    }),
    layout: {
      display: 'grid',
      gridTemplateColumns: '1fr 300px',
      gap: '24px',
      alignItems: 'start',
    },
    tableWrap: {
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '12px',
      overflow: 'hidden',
      background: '#0a0f1c',
    },
    th: {
      background: '#0d1220',
      color: '#3d4553',
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '12px 16px',
      whiteSpace: 'nowrap',
    },
    td: {
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      padding: '14px 16px',
      color: '#e8eaf0',
      fontSize: '13px',
    },
    alertPanel: {
      background: '#0a0f1c',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '12px',
      overflow: 'hidden',
    },
    alertHeader: {
      padding: '14px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', gap: 1,
    },
    alertItem: {
      padding: '12px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      '&:last-child': { borderBottom: 'none' },
    },
    modalPaper: {
      background: '#0d1220',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      color: '#e8eaf0',
      minWidth: '360px',
    },
    input: {
      '& .MuiOutlinedInput-root': {
        color: '#e8eaf0',
        background: '#080c14',
        borderRadius: '8px',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
        '&:hover fieldset': { borderColor: 'rgba(0,229,160,0.4)' },
        '&.Mui-focused fieldset': { borderColor: '#00e5a0' },
      },
      '& .MuiInputLabel-root': { color: '#3d4553' },
      '& .MuiInputLabel-root.Mui-focused': { color: '#00e5a0' },
      '& .MuiFormHelperText-root': { color: '#ff5252' },
    },
  }

  return (
    <Box sx={s.page}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        @keyframes flashGreen {
          0% { background: rgba(0,229,160,0.12); }
          100% { background: transparent; }
        }
      `}</style>

      {/* ── Header ── */}
      <Box sx={s.header}>
        <Box>
          <Typography sx={s.pageTitle}>
            <Box component="span" sx={s.liveDot} />
            Live Screener
          </Typography>
          <Typography sx={s.pageSub}>
            {tickers.length} tickers tracked · Updates every 2s · WebSocket feed
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={s.addBtn}
          onClick={() => setModalOpen(true)}
        >
          Add Ticker
        </Button>
      </Box>

      {/* ── Filter chips ── */}
      <Box sx={s.filterRow}>
        {['All', 'Alerts', 'Oversold', 'Overbought'].map(f => (
          <Chip
            key={f}
            label={f}
            onClick={() => setFilter(f)}
            sx={s.filterChip(filter === f)}
            size="small"
          />
        ))}
        <Typography sx={{ fontSize: '12px', color: '#3d4553', alignSelf: 'center', ml: 1 }}>
          Showing {filtered.length} of {tickers.length}
        </Typography>
      </Box>

      {/* ── Main layout ── */}
      <Box sx={s.layout}>

        {/* ── Table ── */}
        <Box sx={s.tableWrap}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Ticker', 'Price', 'Change', 'RSI', 'MACD', 'Bollinger', 'Volume', 'Alert', ''].map(h => (
                    <TableCell key={h} sx={s.th}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(t => (
                  <TableRow
                    key={t.id}
                    sx={{
                      '&:hover': { background: 'rgba(255,255,255,0.02)' },
                      transition: 'background 0.2s',
                    }}
                  >
                    {/* Ticker */}
                    <TableCell sx={s.td}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          background: 'rgba(255,255,255,0.05)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '10px', fontWeight: 800, color: '#8892a4',
                          letterSpacing: '0.03em',
                        }}>
                          {t.sym.slice(0, 2)}
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#e8eaf0' }}>
                            {t.sym}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Price */}
                    <TableCell sx={s.td}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{
                          fontFamily: "'Syne', monospace",
                          fontSize: '14px', fontWeight: 700,
                          color: '#e8eaf0', letterSpacing: '-0.01em',
                          transition: 'color 0.3s',
                        }}>
                          ${t.price.toFixed(2)}
                        </Typography>
                        <Sparkline up={t.change >= 0} />
                      </Box>
                    </TableCell>

                    {/* Change */}
                    <TableCell sx={s.td}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {t.change >= 0
                          ? <TrendingUpIcon sx={{ fontSize: '14px', color: '#00e5a0' }} />
                          : <TrendingDownIcon sx={{ fontSize: '14px', color: '#ff5252' }} />
                        }
                        <Typography sx={{
                          fontSize: '13px', fontWeight: 600,
                          color: t.change >= 0 ? '#00e5a0' : '#ff5252',
                        }}>
                          {t.change >= 0 ? '+' : ''}{t.change.toFixed(2)}%
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* RSI */}
                    <TableCell sx={s.td}>
                      <RsiBar value={t.rsi} />
                    </TableCell>

                    {/* MACD */}
                    <TableCell sx={s.td}>
                      <Chip
                        label={t.macd}
                        size="small"
                        sx={{
                          fontSize: '11px', fontWeight: 700,
                          borderRadius: '5px', height: '22px',
                          background: `${getMacdColor(t.macd)}18`,
                          color: getMacdColor(t.macd),
                          border: `1px solid ${getMacdColor(t.macd)}40`,
                        }}
                      />
                    </TableCell>

                    {/* Bollinger */}
                    <TableCell sx={s.td}>
                      <Tooltip title={
                        t.bb === 'Upper' ? 'Price near upper band — possible overbought'
                        : t.bb === 'Lower' ? 'Price near lower band — possible oversold'
                        : 'Price within normal range'
                      } placement="top">
                        <Chip
                          label={t.bb}
                          size="small"
                          sx={{
                            fontSize: '11px', fontWeight: 700,
                            borderRadius: '5px', height: '22px',
                            background: `${getBbColor(t.bb)}18`,
                            color: getBbColor(t.bb),
                            border: `1px solid ${getBbColor(t.bb)}40`,
                            cursor: 'help',
                          }}
                        />
                      </Tooltip>
                    </TableCell>

                    {/* Volume */}
                    <TableCell sx={{ ...s.td, color: '#8892a4', fontVariantNumeric: 'tabular-nums' }}>
                      {t.volume}
                    </TableCell>

                    {/* Alert */}
                    <TableCell sx={s.td}>
                      {t.alert
                        ? <Tooltip title="Alert condition triggered">
                            <NotificationsActiveIcon sx={{ fontSize: '16px', color: '#f0a500', animation: 'pulse 1.5s ease-in-out infinite' }} />
                          </Tooltip>
                        : <Box sx={{ width: '16px' }} />
                      }
                    </TableCell>

                    {/* Remove */}
                    <TableCell sx={{ ...s.td, padding: '14px 8px' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleRemove(t.id)}
                        sx={{ color: '#3d4553', '&:hover': { color: '#ff5252' }, transition: 'color 0.2s' }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: '16px' }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* ── Alert log ── */}
        <Box sx={s.alertPanel}>
          <Box sx={s.alertHeader}>
            <NotificationsActiveIcon sx={{ fontSize: '14px', color: '#f0a500' }} />
            <Typography sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#8892a4', textTransform: 'uppercase' }}>
              Alert Log
            </Typography>
            <Chip
              label={alertLog.length}
              size="small"
              sx={{ ml: 'auto', fontSize: '10px', height: '18px', background: 'rgba(240,165,0,0.15)', color: '#f0a500', border: '1px solid rgba(240,165,0,0.3)' }}
            />
          </Box>
          {alertLog.length === 0 && (
            <Typography sx={{ fontSize: '12px', color: '#3d4553', padding: '24px 16px', textAlign: 'center' }}>
              No alerts yet
            </Typography>
          )}
          {alertLog.map((a, i) => (
            <Box key={i} sx={s.alertItem}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#e8eaf0' }}>{a.sym}</Typography>
                <Typography sx={{ fontSize: '10px', color: '#3d4553', fontVariantNumeric: 'tabular-nums' }}>{a.time}</Typography>
              </Box>
              <Typography sx={{ fontSize: '11px', color: '#8892a4', lineHeight: 1.5 }}>{a.msg}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Add Ticker Modal ── */}
      <Dialog
        open={modalOpen}
        onClose={() => { setModalOpen(false); setNewSym(''); setSymError('') }}
        PaperProps={{ sx: s.modalPaper }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Typography sx={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700 }}>
            Add Ticker
          </Typography>
          <IconButton
            size="small"
            onClick={() => { setModalOpen(false); setNewSym(''); setSymError('') }}
            sx={{ color: '#3d4553' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ fontSize: '13px', color: '#8892a4', mb: 3, lineHeight: 1.6 }}>
            Enter a ticker symbol to start tracking it in the live screener. Ingestion starts immediately.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Ticker Symbol"
            placeholder="e.g. AAPL"
            value={newSym}
            onChange={e => { setNewSym(e.target.value.toUpperCase()); setSymError('') }}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            error={!!symError}
            helperText={symError}
            inputProps={{ maxLength: 5, style: { textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' } }}
            sx={s.input}
          />
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px', gap: 1 }}>
          <Button
            onClick={() => { setModalOpen(false); setNewSym(''); setSymError('') }}
            sx={{ color: '#8892a4', textTransform: 'none', fontWeight: 500 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAdd}
            sx={{
              background: '#00e5a0', color: '#080c14',
              fontWeight: 700, textTransform: 'none', borderRadius: '8px',
              '&:hover': { background: '#00c98c' },
            }}
          >
            Add to Screener
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Toast ── */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast(t => ({ ...t, open: false }))}
          sx={{
            background: '#0d1220',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#e8eaf0',
            '& .MuiAlert-icon': { color: toast.severity === 'warning' ? '#f0a500' : '#00e5a0' },
          }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}