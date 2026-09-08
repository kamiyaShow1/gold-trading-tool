import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/common/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import api from '../services/api'

function ChapterList() {
  const [chapters, setChapters] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/learning/chapters')
      .then(({ data }) => setChapters(data.chapters))
      .catch(() => setError('章一覧の取得に失敗しました'))
  }, [])

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold text-gray-900">学習チャプター</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {chapters.map((chapter) => (
        <Link key={chapter.chapterId} to={`/learning/${chapter.chapterId}`}>
          <Card className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">{chapter.title}</p>
              <p className="text-xs text-gray-500">学習時間: 約{chapter.estimatedTime}分</p>
            </div>
            <span className={`text-sm font-medium ${chapter.completed ? 'text-green-600' : 'text-gray-400'}`}>
              {chapter.completed ? '完了' : '未完了'}
            </span>
          </Card>
        </Link>
      ))}
    </div>
  )
}

function ChapterDetail({ chapterId }) {
  const navigate = useNavigate()
  const [chapter, setChapter] = useState(null)
  const [error, setError] = useState('')
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    api
      .get(`/learning/chapter/${chapterId}`)
      .then(({ data }) => setChapter(data.chapter))
      .catch(() => setError('章の取得に失敗しました'))
  }, [chapterId])

  async function handleMarkComplete() {
    setMarking(true)
    try {
      await api.post(`/learning/mark-complete/${chapterId}`)
      navigate('/learning')
    } catch {
      setError('完了の記録に失敗しました')
    } finally {
      setMarking(false)
    }
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>
  if (!chapter) return <p className="text-sm text-gray-500">読み込み中...</p>

  return (
    <div className="space-y-4">
      <Link to="/learning" className="text-sm text-indigo-600">
        ← 章一覧に戻る
      </Link>
      <h1 className="text-xl font-bold text-gray-900">{chapter.title}</h1>

      <Card>
        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{chapter.content}</p>
      </Card>

      {chapter.keyPoints?.length > 0 && (
        <Card title="重要ポイント">
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
            {chapter.keyPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </Card>
      )}

      {chapter.examples?.length > 0 && (
        <Card title="実例">
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
            {chapter.examples.map((example, i) => (
              <li key={i}>{example}</li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex gap-3">
        <Button onClick={handleMarkComplete} disabled={marking} className="flex-1">
          学習を完了にする
        </Button>
        {chapter.quizId && (
          <Link to={`/quiz/${chapter.quizId}`} className="flex-1">
            <Button variant="secondary" className="w-full">
              テストに進む
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}

export default function LearningPage() {
  const { chapterId } = useParams()

  return <Layout>{chapterId ? <ChapterDetail key={chapterId} chapterId={chapterId} /> : <ChapterList />}</Layout>
}
