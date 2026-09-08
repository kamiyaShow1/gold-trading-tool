import { useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import CloseTradeForm from './CloseTradeForm'

// バックエンド(demoTradeController.js)と同じ仮定: XAUUSD 1pip=0.01, $1/pip/標準ロット
const PIP_SIZE = 0.01
const PIP_VALUE_PER_LOT = 1

function calcUnrealized(trade, currentPrice) {
  const price = Number(currentPrice)
  if (!Number.isFinite(price) || price <= 0) return null

  const direction = trade.entryType === 'buy' ? 1 : -1
  const pips = ((price - trade.entryPrice) / PIP_SIZE) * direction
  const profitLoss = pips * PIP_VALUE_PER_LOT * trade.lotSize
  return { pips: Math.round(pips * 100) / 100, profitLoss: Math.round(profitLoss * 100) / 100 }
}

export default function PositionList({ trades, onChanged }) {
  const [activeTradeId, setActiveTradeId] = useState(null)
  const [currentPrices, setCurrentPrices] = useState({})

  if (trades.length === 0) {
    return (
      <Card title="保有中のポジション">
        <p className="text-sm text-gray-500">保有中のポジションはありません</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">保有中のポジション</h2>
      {trades.map((trade) => {
        const unrealized = calcUnrealized(trade, currentPrices[trade.tradeId])
        return (
          <Card key={trade.tradeId}>
            <div className="flex items-start justify-between">
              <div>
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-semibold text-white ${
                    trade.entryType === 'buy' ? 'bg-green-600' : 'bg-red-600'
                  }`}
                >
                  {trade.entryType === 'buy' ? '買い' : '売り'}
                </span>
                <p className="mt-1 text-sm text-gray-900">エントリー価格: {trade.entryPrice}</p>
                <p className="text-xs text-gray-500">{new Date(trade.entryTime).toLocaleString()}</p>
                {trade.entryReason && <p className="mt-1 text-xs text-gray-600">{trade.entryReason}</p>}
              </div>
            </div>

            <div className="mt-3 border-t border-gray-100 pt-3">
              <label className="block text-xs font-medium text-gray-500">
                現在価格（参考入力・未実現損益の目安）
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentPrices[trade.tradeId] || ''}
                onChange={(e) =>
                  setCurrentPrices((prev) => ({ ...prev, [trade.tradeId]: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {unrealized && (
                <p className={`mt-1 text-sm font-medium ${unrealized.pips >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  未実現: {unrealized.pips > 0 ? '+' : ''}
                  {unrealized.pips}pips（{unrealized.profitLoss > 0 ? '+' : ''}
                  {unrealized.profitLoss}ドル）
                </p>
              )}
            </div>

            {activeTradeId === trade.tradeId ? (
              <div className="mt-3">
                <CloseTradeForm
                  trade={trade}
                  onCancel={() => setActiveTradeId(null)}
                  onClosed={() => {
                    setActiveTradeId(null)
                    onChanged?.()
                  }}
                />
              </div>
            ) : (
              <Button variant="danger" className="mt-3 w-full" onClick={() => setActiveTradeId(trade.tradeId)}>
                決済
              </Button>
            )}
          </Card>
        )
      })}
    </div>
  )
}
