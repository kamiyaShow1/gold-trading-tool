import { useEffect, useRef, useState } from 'react'
import { createChart, CandlestickSeries, LineSeries } from 'lightweight-charts'
import Card from '../ui/Card'
import api from '../../services/api'

const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1d']
const CHART_HEIGHT = 400
const RSI_PANE_HEIGHT = 100
const ATR_PANE_HEIGHT = 100

function toChartTime(isoString) {
  return Math.floor(new Date(isoString).getTime() / 1000)
}

export default function PriceChart({ timeframe = '1h', onTimeframeChange, onLatestPriceChange }) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef({})

  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe)
  const [showEMA, setShowEMA] = useState(true)
  const [showRSI, setShowRSI] = useState(false)
  const [showATR, setShowATR] = useState(false)
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // チャートインスタンスの初期化(マウント時に1回)
  useEffect(() => {
    const chart = createChart(containerRef.current, {
      height: CHART_HEIGHT,
      layout: { background: { color: '#ffffff' }, textColor: '#374151' },
      grid: { vertLines: { color: '#f3f4f6' }, horzLines: { color: '#f3f4f6' } },
      timeScale: { timeVisible: true, secondsVisible: false },
    })
    chartRef.current = chart

    const candleSeries = chart.addSeries(
      CandlestickSeries,
      { upColor: '#16a34a', downColor: '#dc2626', borderVisible: false, wickUpColor: '#16a34a', wickDownColor: '#dc2626' },
      0,
    )
    const ema20Series = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, title: 'EMA20' }, 0)
    const ema75Series = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 1, title: 'EMA75' }, 0)
    const ema200Series = chart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 1, title: 'EMA200' }, 0)
    const rsiSeries = chart.addSeries(LineSeries, { color: '#0891b2', lineWidth: 1, title: 'RSI' }, 1)
    const atrSeries = chart.addSeries(LineSeries, { color: '#ea580c', lineWidth: 1, title: 'ATR' }, 2)

    // RSI/ATRは初期状態(未表示)ではペイン高さ0にして無駄な空白を出さない
    chart.panes()[1]?.setHeight(0)
    chart.panes()[2]?.setHeight(0)

    seriesRef.current = { candleSeries, ema20Series, ema75Series, ema200Series, rsiSeries, atrSeries }

    const resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width
      if (width) chart.applyOptions({ width })
    })
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
      chartRef.current = null
    }
  }, [])

  // 時間足変更時にAPIから取得
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    api
      .get(`/market/chart/${selectedTimeframe}`, { timeout: 10000 })
      .then(({ data }) => {
        if (cancelled) return
        setChartData(data.data || [])
      })
      .catch((err) => {
        if (cancelled) return
        const message =
          err.code === 'ECONNABORTED'
            ? 'チャートデータの取得がタイムアウトしました'
            : err.response?.data?.error || 'チャートデータの取得に失敗しました'
        setError(message)
        setChartData([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedTimeframe])

  // 取得データをシリーズへ反映
  useEffect(() => {
    const series = seriesRef.current
    if (!series.candleSeries) return

    const candles = chartData.map((d) => ({
      time: toChartTime(d.timestamp),
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }))
    series.candleSeries.setData(candles)

    const lineData = (field) =>
      chartData
        .filter((d) => d[field] !== null && d[field] !== undefined)
        .map((d) => ({ time: toChartTime(d.timestamp), value: d[field] }))

    series.ema20Series.setData(lineData('ema20'))
    series.ema75Series.setData(lineData('ema75'))
    series.ema200Series.setData(lineData('ema200'))
    series.rsiSeries.setData(lineData('rsi'))
    series.atrSeries.setData(lineData('atr'))

    chartRef.current?.timeScale().fitContent()

    const latestClose = chartData.length > 0 ? chartData[chartData.length - 1].close : null
    onLatestPriceChange?.(latestClose)
  }, [chartData, onLatestPriceChange])

  // 表示切り替え(データ再取得なしでON/OFF)
  useEffect(() => {
    const { ema20Series, ema75Series, ema200Series } = seriesRef.current
    ema20Series?.applyOptions({ visible: showEMA })
    ema75Series?.applyOptions({ visible: showEMA })
    ema200Series?.applyOptions({ visible: showEMA })
  }, [showEMA])

  useEffect(() => {
    seriesRef.current.rsiSeries?.applyOptions({ visible: showRSI })
    chartRef.current?.panes()[1]?.setHeight(showRSI ? RSI_PANE_HEIGHT : 0)
  }, [showRSI])

  useEffect(() => {
    seriesRef.current.atrSeries?.applyOptions({ visible: showATR })
    chartRef.current?.panes()[2]?.setHeight(showATR ? ATR_PANE_HEIGHT : 0)
  }, [showATR])

  function selectTimeframe(tf) {
    setSelectedTimeframe(tf)
    onTimeframeChange?.(tf)
  }

  return (
    <Card title="チャート">
      <div className="mb-3 flex flex-wrap gap-1">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            type="button"
            onClick={() => selectTimeframe(tf)}
            className={`rounded-md px-3 py-1 text-xs font-semibold ${
              selectedTimeframe === tf ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap gap-4 text-sm text-gray-700">
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={showEMA} onChange={(e) => setShowEMA(e.target.checked)} />
          EMA(20/75/200)
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={showRSI} onChange={(e) => setShowRSI(e.target.checked)} />
          RSI
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={showATR} onChange={(e) => setShowATR(e.target.checked)} />
          ATR
        </label>
      </div>

      {loading && <p className="text-sm text-gray-500">読み込み中...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && chartData.length === 0 && (
        <p className="text-sm text-gray-500">この時間足のデータはまだありません</p>
      )}

      <div ref={containerRef} className="w-full" style={{ height: CHART_HEIGHT }} />
    </Card>
  )
}
