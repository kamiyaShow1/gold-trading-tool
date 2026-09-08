import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Layout from '../components/common/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import api from '../services/api'

export default function QuizPage() {
  const { quizId } = useParams()
  return <QuizPageContent key={quizId} quizId={quizId} />
}

function QuizPageContent({ quizId }) {
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api
      .get(`/quiz/${quizId}`)
      .then(({ data }) => {
        setQuiz(data.quiz)
        setQuestions(data.questions)
      })
      .catch(() => setError('クイズの取得に失敗しました'))
  }, [quizId])

  function selectAnswer(questionId, option) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({
          questionId,
          selectedAnswer,
        })),
      }
      const { data } = await api.post(`/quiz/${quizId}/submit`, payload)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.error || '採点に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  if (error && !quiz) return <Layout><p className="text-sm text-red-600">{error}</p></Layout>
  if (!quiz) return <Layout><p className="text-sm text-gray-500">読み込み中...</p></Layout>

  if (result) {
    return (
      <Layout>
        <div className="space-y-4">
          <h1 className="text-xl font-bold text-gray-900">{quiz.title} 結果</h1>
          <Card>
            <p className={`text-3xl font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
              {result.score}点
            </p>
            <p className="mt-1 text-sm text-gray-600">{result.passed ? '合格' : '不合格'}（合格ライン: {quiz.passingScore}点）</p>
          </Card>
          <Card title="フィードバック">
            <p className="text-sm text-gray-700">{result.feedback}</p>
          </Card>
          <Card title="分析">
            <p className="text-sm text-gray-700">{result.analysis}</p>
          </Card>
          <Link to="/learning">
            <Button className="w-full">章一覧に戻る</Button>
          </Link>
        </div>
      </Layout>
    )
  }

  const allAnswered = questions.every((q) => answers[q.questionId])

  return (
    <Layout>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}

        {questions.map((q, index) => (
          <Card key={q.questionId} title={`問題 ${index + 1}/${questions.length}`}>
            <p className="mb-3 text-sm text-gray-800">{q.question}</p>
            <div className="space-y-2">
              {q.options.map((option) => (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                    answers[q.questionId] === option
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name={q.questionId}
                    value={option}
                    checked={answers[q.questionId] === option}
                    onChange={() => selectAnswer(q.questionId, option)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  {option}
                </label>
              ))}
            </div>
          </Card>
        ))}

        <Button type="submit" disabled={!allAnswered || submitting} className="w-full">
          回答を送信する
        </Button>
      </form>
    </Layout>
  )
}
