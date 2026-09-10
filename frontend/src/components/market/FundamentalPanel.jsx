import { useCallback, useEffect, useState } from 'react'
import Card from '../ui/Card'
import api from '../../services/api'

const REFRESH_INTERVAL_MS = 30000

function EventBadge({ label, scheduled }) {
  return (
    <p className="text-sm text-gray-700">
      <span>{scheduled ? '🔴' : '🟢'}</span> {label}発表{scheduled ? '予定あり' : 'なし'}
    </p>
  )
}

export default function FundamentalPanel() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const fetchFundamental = useCallback(() => {
    api
      .get('/market/fundamental-today')
      .then(({ data }) => {
        setData(data)
        setError('')
      })
      .catch(() => setError('ファンダメンタル情報の取得に失敗しました'))
  }, [])

  useEffect(() => {
    fetchFundamental()
    const intervalId = setInterval(fetchFundamental, REFRESH_INTERVAL_MS)
    return () => clearInterval(intervalId)
  }, [fetchFundamental])

  if (error && !data) {
    return (
      <Card title="今日の市場">
        <p className="text-sm text-red-600">{error}</p>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card title="今日の市場">
        <p className="text-sm text-gray-500">読み込み中...</p>
      </Card>
    )
  }

  const hasData = data.dollarIndex !== null && data.vix !== null

  return (
    <Card title="今日の市場">
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      {!hasData && <p className="mb-2 text-sm text-gray-500">本日の情報はまだありません</p>}

      <div className="space-y-1">
        <EventBadge label="FOMC" scheduled={data.fomc.scheduled} />
        <EventBadge label="NFP" scheduled={data.nfp.scheduled} />
      </div>

      {hasData && (
        <div className="mt-3 grid grid-cols-3 gap-2 text-sm text-gray-700">
          <div>
            <p className="text-xs text-gray-500">CPI</p>
            <p className="font-semibold">{data.cpi !== null ? `${data.cpi}%` : '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">ドル指数</p>
            <p className="font-semibold">{data.dollarIndex}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">VIX</p>
            <p className="font-semibold">{data.vix}</p>
          </div>
        </div>
      )}

      {data.analysis && <p className="mt-3 text-sm text-gray-600">{data.analysis}</p>}
    </Card>
  )
}
