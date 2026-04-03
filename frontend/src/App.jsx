import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './features/landing/LandingPage'
import ScreenerPage from './features/screener/ScreenerPage'
import StrategyPage from './features/strategy/StrategyPage'
import BacktestPage from './features/backtest/BacktestPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="screener" element={<ScreenerPage />} />
          <Route path="strategy" element={<StrategyPage />} />
          <Route path="backtest" element={<BacktestPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App