import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/dashboard', label: 'ホーム' },
  { to: '/learning', label: '学習' },
  { to: '/demo-trade', label: 'デモトレード' },
]

export default function Navigation() {
  return (
    <nav className="flex border-t border-gray-200 bg-white">
      {LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `flex-1 py-3 text-center text-sm font-medium ${
              isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}
