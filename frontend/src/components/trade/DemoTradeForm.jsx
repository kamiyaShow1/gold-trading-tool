import { useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import api from '../../services/api'

const initialState = {
  entryType: 'buy',
  entryPrice: '',
  lotSize: '1.0',
  entryReason: '',
}

export default function DemoTradeForm({ onCreated, suggestedPrice }) {
  const [form, setForm] = useState(initialState)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const entryPrice = Number(form.entryPrice)
    const lotSize = Number(form.lotSize)

    if (!Number.isFinite(entryPrice) || entryPrice <= 0) {
      setError('エントリー価格は0より大きい数値を入力してください')
      return
    }
    if (!Number.isFinite(lotSize) || lotSize <= 0) {
      setError('ロットサイズは0より大きい数値を入力してください')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/demo-trade/create', {
        symbol: 'XAUUSD',
        entryType: form.entryType,
        entryPrice,
        lotSize,
        entryReason: form.entryReason || undefined,
      })
      setForm((prev) => ({ ...initialState, entryType: prev.entryType }))
      onCreated?.()
    } catch (err) {
      setError(err.response?.data?.error || '通信エラーが発生しました')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card title="新規エントリー">
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => update('entryType', 'buy')}
            className={`flex-1 rounded-md py-2 text-sm font-semibold ${
              form.entryType === 'buy' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            買い
          </button>
          <button
            type="button"
            onClick={() => update('entryType', 'sell')}
            className={`flex-1 rounded-md py-2 text-sm font-semibold ${
              form.entryType === 'sell' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            売り
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">エントリー価格</label>
            {suggestedPrice != null && (
              <button
                type="button"
                onClick={() => update('entryPrice', String(suggestedPrice))}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                現在値を使用（{suggestedPrice}）
              </button>
            )}
          </div>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={form.entryPrice}
            onChange={(e) => update('entryPrice', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">ロットサイズ</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={form.lotSize}
            onChange={(e) => update('lotSize', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">エントリー理由</label>
          <textarea
            rows={3}
            value={form.entryReason}
            onChange={(e) => update('entryReason', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={submitting} className="w-full">
          エントリー
        </Button>
      </form>
    </Card>
  )
}
