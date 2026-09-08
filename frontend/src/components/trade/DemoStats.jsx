import Card from '../ui/Card'

function StatItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  )
}

export default function DemoStats({ stats }) {
  if (!stats) {
    return (
      <Card title="デモ成績">
        <p className="text-sm text-gray-500">読み込み中...</p>
      </Card>
    )
  }

  const avgPips = stats.closedTrades > 0 ? Math.round((stats.totalPips / stats.closedTrades) * 100) / 100 : 0

  return (
    <Card title="デモ成績">
      <div className="grid grid-cols-2 gap-4">
        <StatItem label="総トレード数" value={stats.totalTrades} />
        <StatItem label="勝ち数 / 負け数" value={`${stats.wins} / ${stats.losses}`} />
        <StatItem label="勝率" value={`${stats.winRate}%`} />
        <StatItem label="総獲得pips" value={stats.totalPips} />
        <StatItem label="総損益" value={`${stats.totalProfitLoss > 0 ? '+' : ''}${stats.totalProfitLoss}ドル`} />
        <StatItem label="平均pips/トレード" value={avgPips} />
      </div>
    </Card>
  )
}
