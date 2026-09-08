import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/common/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'

export default function DashboardPage() {
  const { user } = useAuth()
  const [progress, setProgress] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/learning/progress')
      .then(({ data }) => setProgress(data))
      .catch(() => setError('進捗の取得に失敗しました'))
  }, [])

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-gray-900">
          こんにちは、{user?.username || 'トレーダー'}さん
        </h1>

        <Card title="あなたの進捗">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {progress && (
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-indigo-600 transition-all"
                  style={{ width: `${progress.progressPercent}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                学習進捗: {progress.progressPercent}%（完了 {progress.completedChapters.length} 章）
              </p>
            </div>
          )}
        </Card>

        <Card title="次のステップ">
          <p className="mb-3 text-sm text-gray-600">
            {progress?.currentChapter ? `次の章: ${progress.currentChapter}` : 'すべての章を完了しました'}
          </p>
          <Link to="/learning">
            <Button className="w-full">学習を続ける</Button>
          </Link>
        </Card>
      </div>
    </Layout>
  )
}
