export default function Card({ title, className = '', children }) {
  return (
    <div className={`rounded-lg bg-white p-4 shadow ${className}`}>
      {title ? <h2 className="mb-3 text-lg font-semibold text-gray-900">{title}</h2> : null}
      {children}
    </div>
  )
}
