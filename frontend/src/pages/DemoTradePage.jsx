import { useCallback, useEffect, useState } from 'react'
import Layout from '../components/common/Layout'
import DemoTradeForm from '../components/trade/DemoTradeForm'
import DemoStats from '../components/trade/DemoStats'
import PositionList from '../components/trade/PositionList'
import api from '../services/api'

export default function DemoTradePage() {
  const [data, setData] = useState({ trades: [], stats: null })
  const [error, setError] = useState('')

  const load = useCallback(() => {
    api
      .get('/demo-trades')
      .then(({ data }) => {
        setData(data)
        setError('')
      })
      .catch(() => setError('デモトレード情報の取得に失敗しました'))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openTrades = data.trades.filter((t) => t.status === 'open')

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-gray-900">デモトレード</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DemoTradeForm onCreated={load} />
          <DemoStats stats={data.stats} />
        </div>

        <PositionList trades={openTrades} onChanged={load} />
      </div>
    </Layout>
  )
}
