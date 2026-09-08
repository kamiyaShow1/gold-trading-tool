import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
      <span className="text-lg font-bold text-indigo-600">Gold Trading AI Learning</span>
      <div className="flex items-center gap-3">
        {user ? <span className="text-sm text-gray-600">{user.username} さん</span> : null}
        <Button variant="secondary" onClick={logout}>
          ログアウト
        </Button>
      </div>
    </header>
  )
}
