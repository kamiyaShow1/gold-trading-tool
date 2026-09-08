import Header from './Header'
import Navigation from './Navigation'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-lg">{children}</div>
      </main>
      <Navigation />
    </div>
  )
}
