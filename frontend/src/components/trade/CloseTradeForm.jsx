import { useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import api from '../../services/api'

export default function CloseTradeForm({ trade, onClosed, onCancel }) {
  const [exitPrice, setExitPrice] = useState('')
  const [exitReason, setExitReason] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const price = Number(exitPrice)
    if (!Number.isFinite(price) || price <= 0) {
      setError('決済価格は0より大きい数値を入力してください')
      return
    }

    setSubmitting(true)
    try {
      const { data } = await api.post(`/demo-trade/${trade.tradeId}/close`, {
        exitPrice: price,
        exitReason: exitReason || undefined,
      })
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.error || '通信エラーが発生しました')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    const isWin = (result.profitLoss || 0) > 0
    return (
      <Card className="border-2 border-indigo-200">
        <p className="text-sm font-semibold text-gray-900">決済完了</p>
        <p className={`mt-1 text-2xl font-bold ${isWin ? 'text-green-600' : 'text-red-600'}`}>
          {result.pips > 0 ? '+' : ''}
          {result.pips}pips
        </p>
        <p className="text-sm text-gray-600">
          損益: {result.profitLoss > 0 ? '+' : ''}
          {result.profitLoss}ドル
        </p>
        <Button className="mt-3 w-full" onClick={() => onClosed?.(result)}>
          閉じる
        </Button>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-indigo-200" title="決済">
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">決済価格</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={exitPrice}
            onChange={(e) => setExitPrice(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">決済理由</label>
          <textarea
            rows={2}
            value={exitReason}
            onChange={(e) => setExitReason(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting} className="flex-1">
            決済する
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
            キャンセル
          </Button>
        </div>
      </form>
    </Card>
  )
}
