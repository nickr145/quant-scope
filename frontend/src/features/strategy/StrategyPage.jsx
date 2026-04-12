import { useState } from 'react'
import {
  Box, Typography, Button, Chip, TextField,
  MenuItem, Select, FormControl, InputLabel,
  Slider, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CloseIcon from '@mui/icons-material/Close'
import TuneIcon from '@mui/icons-material/Tune'
import { useNavigate } from 'react-router-dom'

// ── Mock saved strategies ─────────────────────────────────────────────────────
const INITIAL_STRATEGIES = [
  {
    id: 1,
    name: 'RSI Oversold Bounce',
    indicator: 'RSI',
    condition: 'below',
    threshold: 30,
    from: '2022-01-01',
    to: '2024-12-31',
    positionSize: 10,
    createdAt: 'Apr 1, 2026',
    tag: 'Mean Reversion',
  },
  {
    id: 2,
    name: 'MACD Bullish Cross',
    indicator: 'MACD',
    condition: 'crosses above',
    threshold: 0,
    from: '2023-01-01',
    to: '2024-12-31',
    positionSize: 15,
    createdAt: 'Apr 3, 2026',
    tag: 'Trend Following',
  },
  {
    id: 3,
    name: 'BB Lower Band Entry',
    indicator: 'Bollinger Bands',
    condition: 'below',
    threshold: -2,
    from: '2021-06-01',
    to: '2024-12-31',
    positionSize: 8,
    createdAt: 'Apr 5, 2026',
    tag: 'Volatility',
  },
]

const INDICATORS = ['RSI', 'MACD', 'Bollinger Bands']
const CONDITIONS  = ['above', 'below', 'crosses above', 'crosses below']
const TAGS        = ['Mean Reversion', 'Trend Following', 'Volatility', 'Momentum', 'Breakout']

const TAG_COLORS = {
  'Mean Reversion':  { bg: 'rgba(0,229,160,0.1)',  color: '#00e5a0',  border: 'rgba(0,229,160,0.25)'  },
  'Trend Following': { bg: 'rgba(99,153,255,0.1)', color: '#6399ff',  border: 'rgba(99,153,255,0.25)' },
  'Volatility':      { bg: 'rgba(240,165,0,0.1)',  color: '#f0a500',  border: 'rgba(240,165,0,0.25)'  },
  'Momentum':        { bg: 'rgba(255,82,82,0.1)',  color: '#ff5252',  border: 'rgba(255,82,82,0.25)'  },
  'Breakout':        { bg: 'rgba(180,100,255,0.1)','color': '#b464ff', border: 'rgba(180,100,255,0.25)'},
}

const EMPTY_FORM = {
  name: '', indicator: 'RSI', condition: 'below',
  threshold: 30, from: '2022-01-01', to: '2024-12-31',
  positionSize: 10, tag: 'Mean Reversion',
}

// ── Indicator description helper ──────────────────────────────────────────────
function indicatorHint(indicator, condition, threshold) {
  if (indicator === 'RSI')
    return `Fire when RSI is ${condition} ${threshold}. RSI < 30 = oversold, RSI > 70 = overbought.`
  if (indicator === 'MACD')
    return `Fire when MACD line ${condition} the signal line. Classic trend-change signal.`
  return `Fire when price ${condition} the ${threshold > 0 ? 'upper' : 'lower'} Bollinger Band.`
}

// ── Strategy Card ─────────────────────────────────────────────────────────────
function StrategyCard({ strategy, onDelete, onRunBacktest }) {
  const tagStyle = TAG_COLORS[strategy.tag] || TAG_COLORS['Momentum']

  return (
    <Box sx={{
      background: '#0a0f1c',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '14px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      transition: 'border-color 0.2s, transform 0.2s',
      '&:hover': {
        borderColor: 'rgba(0,229,160,0.2)',
        transform: 'translateY(-2px)',
      },
    }}>
      {/* Top row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography sx={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '16px', fontWeight: 700,
            color: '#e8eaf0', letterSpacing: '-0.01em', mb: 0.5,
          }}>
            {strategy.name}
          </Typography>
          <Typography sx={{ fontSize: '11px', color: '#3d4553' }}>
            Created {strategy.createdAt}
          </Typography>
        </Box>
        <Chip
          label={strategy.tag}
          size="small"
          sx={{
            fontSize: '10px', fontWeight: 700,
            borderRadius: '5px', height: '20px',
            background: tagStyle.bg,
            color: tagStyle.color,
            border: `1px solid ${tagStyle.border}`,
          }}
        />
      </Box>

      {/* Strategy details */}
      <Box sx={{
        background: '#080c14',
        borderRadius: '8px',
        padding: '12px 14px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px 16px',
      }}>
        {[
          ['Indicator',  strategy.indicator],
          ['Condition',  `${strategy.condition} ${strategy.threshold}`],
          ['Date range', `${strategy.from} → ${strategy.to}`],
          ['Position',   `${strategy.positionSize}% per trade`],
        ].map(([label, value]) => (
          <Box key={label}>
            <Typography sx={{ fontSize: '10px', color: '#3d4553', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', mb: 0.3 }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#8892a4', fontWeight: 500 }}>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<PlayArrowIcon sx={{ fontSize: '14px' }} />}
          onClick={() => onRunBacktest(strategy)}
          sx={{
            background: '#00e5a0', color: '#080c14',
            fontWeight: 700, fontSize: '12px',
            borderRadius: '7px', textTransform: 'none',
            padding: '7px 0',
            '&:hover': { background: '#00c98c' },
          }}
        >
          Run Backtest
        </Button>
        <IconButton
          size="small"
          onClick={() => onDelete(strategy.id)}
          sx={{
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '7px', color: '#3d4553',
            '&:hover': { color: '#ff5252', borderColor: 'rgba(255,82,82,0.3)' },
            transition: 'all 0.2s',
          }}
        >
          <DeleteOutlineIcon sx={{ fontSize: '16px' }} />
        </IconButton>
      </Box>
    </Box>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function StrategyPage() {
  const navigate = useNavigate()
  const [strategies, setStrategies]   = useState(INITIAL_STRATEGIES)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [errors, setErrors]           = useState({})
  const [drawerOpen, setDrawerOpen]   = useState(false)
  const [toast, setToast]             = useState({ open: false, msg: '', severity: 'success' })
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())       e.name      = 'Strategy name is required'
    if (!form.from)              e.from      = 'Required'
    if (!form.to)                e.to        = 'Required'
    if (form.from >= form.to)    e.to        = 'End date must be after start date'
    return e
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    const newStrategy = {
      ...form,
      id: Date.now(),
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }
    setStrategies(prev => [newStrategy, ...prev])
    setForm(EMPTY_FORM)
    setDrawerOpen(false)
    setToast({ open: true, msg: `"${form.name}" saved successfully`, severity: 'success' })
  }

  const handleDelete = (id) => {
    setStrategies(prev => prev.filter(s => s.id !== id))
    setDeleteConfirm(null)
    setToast({ open: true, msg: 'Strategy deleted', severity: 'info' })
  }

  const handleRunBacktest = (strategy) => {
    navigate('/backtest', { state: { strategy } })
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
      justifyContent: 'space-between', mb: 5, flexWrap: 'wrap', gap: 2,
    },
    pageTitle: {
      fontFamily: "'Syne', sans-serif",
      fontSize: '28px', fontWeight: 800,
      letterSpacing: '-0.02em', color: '#e8eaf0',
    },
    pageSub: { fontSize: '13px', color: '#3d4553', mt: 0.5 },
    addBtn: {
      background: '#00e5a0', color: '#080c14',
      fontWeight: 700, fontSize: '13px',
      borderRadius: '8px', textTransform: 'none',
      padding: '8px 20px',
      '&:hover': { background: '#00c98c' },
    },
    emptyState: {
      textAlign: 'center', padding: '80px 24px',
      border: '1px dashed rgba(255,255,255,0.08)',
      borderRadius: '16px',
    },
    modalPaper: {
      background: '#0d1220',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      color: '#e8eaf0',
      width: '520px',
      maxWidth: '95vw',
    },
    label: {
      fontSize: '11px', fontWeight: 700,
      color: '#3d4553', letterSpacing: '0.1em',
      textTransform: 'uppercase', mb: 1, display: 'block',
    },
    selectSx: {
      color: '#e8eaf0', background: '#080c14',
      borderRadius: '8px', fontSize: '14px',
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
        borderRadius: '8px', fontSize: '14px',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
        '&:hover fieldset': { borderColor: 'rgba(0,229,160,0.4)' },
        '&.Mui-focused fieldset': { borderColor: '#00e5a0' },
      },
      '& .MuiInputLabel-root': { color: '#3d4553' },
      '& .MuiInputLabel-root.Mui-focused': { color: '#00e5a0' },
      '& .MuiFormHelperText-root': { color: '#ff5252' },
    },
    hintBox: {
      background: 'rgba(0,229,160,0.06)',
      border: '1px solid rgba(0,229,160,0.15)',
      borderRadius: '8px', padding: '10px 14px', mt: 1,
    },
  }

  return (
    <Box sx={s.page}>
      {/* ── Header ── */}
      <Box sx={s.header}>
        <Box>
          <Typography sx={s.pageTitle}>
            <TuneIcon sx={{ fontSize: '24px', mr: 1, verticalAlign: 'middle', color: '#00e5a0' }} />
            Strategy Builder
          </Typography>
          <Typography sx={s.pageSub}>
            {strategies.length} saved {strategies.length === 1 ? 'strategy' : 'strategies'} · Define entry/exit conditions and run backtests
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={s.addBtn}
          onClick={() => setDrawerOpen(true)}
        >
          New Strategy
        </Button>
      </Box>

      {/* ── Strategy grid ── */}
      {strategies.length === 0 ? (
        <Box sx={s.emptyState}>
          <Typography sx={{ fontSize: '32px', mb: 2 }}>📊</Typography>
          <Typography sx={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 700, mb: 1 }}>
            No strategies yet
          </Typography>
          <Typography sx={{ color: '#3d4553', fontSize: '14px', mb: 3 }}>
            Build your first strategy and run a backtest against historical data.
          </Typography>
          <Button variant="contained" sx={s.addBtn} onClick={() => setDrawerOpen(true)}>
            Create Strategy
          </Button>
        </Box>
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
        }}>
          {strategies.map(strategy => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              onDelete={(id) => setDeleteConfirm(id)}
              onRunBacktest={handleRunBacktest}
            />
          ))}
        </Box>
      )}

      {/* ── Builder Modal ── */}
      <Dialog
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: s.modalPaper }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0 }}>
          <Typography sx={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', fontWeight: 700 }}>
            New Strategy
          </Typography>
          <IconButton size="small" onClick={() => setDrawerOpen(false)} sx={{ color: '#3d4553' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Name */}
          <TextField
            fullWidth label="Strategy Name"
            placeholder="e.g. RSI Oversold Bounce"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            sx={s.inputSx}
          />

          {/* Indicator + Condition row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography component="label" sx={s.label}>Indicator</Typography>
              <Select
                fullWidth value={form.indicator}
                onChange={e => set('indicator', e.target.value)}
                sx={s.selectSx} MenuProps={s.menuProps}
              >
                {INDICATORS.map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
              </Select>
            </Box>
            <Box>
              <Typography component="label" sx={s.label}>Condition</Typography>
              <Select
                fullWidth value={form.condition}
                onChange={e => set('condition', e.target.value)}
                sx={s.selectSx} MenuProps={s.menuProps}
              >
                {CONDITIONS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </Box>
          </Box>

          {/* Threshold */}
          <Box>
            <Typography component="label" sx={s.label}>
              Threshold value — <Box component="span" sx={{ color: '#00e5a0' }}>{form.threshold}</Box>
            </Typography>
            <Slider
              value={form.threshold}
              onChange={(_, v) => set('threshold', v)}
              min={form.indicator === 'RSI' ? 0 : -3}
              max={form.indicator === 'RSI' ? 100 : 3}
              step={form.indicator === 'RSI' ? 1 : 0.1}
              sx={{
                color: '#00e5a0',
                '& .MuiSlider-thumb': { background: '#00e5a0', width: 14, height: 14 },
                '& .MuiSlider-track': { background: '#00e5a0' },
                '& .MuiSlider-rail': { background: 'rgba(255,255,255,0.1)' },
              }}
            />
            <Box sx={s.hintBox}>
              <Typography sx={{ fontSize: '12px', color: '#8892a4', lineHeight: 1.6 }}>
                💡 {indicatorHint(form.indicator, form.condition, form.threshold)}
              </Typography>
            </Box>
          </Box>

          {/* Date range */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="From" type="date" fullWidth
              value={form.from}
              onChange={e => set('from', e.target.value)}
              error={!!errors.from} helperText={errors.from}
              InputLabelProps={{ shrink: true }}
              sx={s.inputSx}
            />
            <TextField
              label="To" type="date" fullWidth
              value={form.to}
              onChange={e => set('to', e.target.value)}
              error={!!errors.to} helperText={errors.to}
              InputLabelProps={{ shrink: true }}
              sx={s.inputSx}
            />
          </Box>

          {/* Position size */}
          <Box>
            <Typography component="label" sx={s.label}>
              Position size — <Box component="span" sx={{ color: '#00e5a0' }}>{form.positionSize}% per trade</Box>
            </Typography>
            <Slider
              value={form.positionSize}
              onChange={(_, v) => set('positionSize', v)}
              min={1} max={100} step={1}
              marks={[
                { value: 10, label: '10%' },
                { value: 25, label: '25%' },
                { value: 50, label: '50%' },
                { value: 100, label: '100%' },
              ]}
              sx={{
                color: '#00e5a0',
                '& .MuiSlider-thumb': { background: '#00e5a0', width: 14, height: 14 },
                '& .MuiSlider-track': { background: '#00e5a0' },
                '& .MuiSlider-rail': { background: 'rgba(255,255,255,0.1)' },
                '& .MuiSlider-markLabel': { color: '#3d4553', fontSize: '11px' },
              }}
            />
          </Box>

          {/* Tag */}
          <Box>
            <Typography component="label" sx={s.label}>Strategy type</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {TAGS.map(tag => {
                const tc = TAG_COLORS[tag]
                const active = form.tag === tag
                return (
                  <Chip
                    key={tag} label={tag} size="small"
                    onClick={() => set('tag', tag)}
                    sx={{
                      fontSize: '11px', fontWeight: 600,
                      borderRadius: '6px', cursor: 'pointer',
                      background: active ? tc.bg : 'transparent',
                      color: active ? tc.color : '#3d4553',
                      border: active ? `1px solid ${tc.border}` : '1px solid rgba(255,255,255,0.08)',
                      transition: 'all 0.15s',
                      '&:hover': { background: tc.bg, color: tc.color },
                    }}
                  />
                )
              })}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ padding: '16px 24px', gap: 1 }}>
          <Button
            onClick={() => setDrawerOpen(false)}
            sx={{ color: '#8892a4', textTransform: 'none', fontWeight: 500 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained" onClick={handleSave}
            sx={{
              background: '#00e5a0', color: '#080c14',
              fontWeight: 700, textTransform: 'none', borderRadius: '8px',
              '&:hover': { background: '#00c98c' },
            }}
          >
            Save Strategy
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete confirm ── */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        PaperProps={{ sx: { ...s.modalPaper, width: '360px' } }}
      >
        <DialogTitle>
          <Typography sx={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 700 }}>
            Delete strategy?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '14px', color: '#8892a4' }}>
            This can't be undone. Any associated backtest results will also be removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px', gap: 1 }}>
          <Button onClick={() => setDeleteConfirm(null)} sx={{ color: '#8892a4', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained" onClick={() => handleDelete(deleteConfirm)}
            sx={{ background: '#ff5252', color: '#fff', fontWeight: 700, textTransform: 'none', borderRadius: '8px', '&:hover': { background: '#e04040' } }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Toast ── */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
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
            '& .MuiAlert-icon': { color: toast.severity === 'success' ? '#00e5a0' : '#8892a4' },
          }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}