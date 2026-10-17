const sections = [
  ['overview', 'Overview'],
  ['participants', 'Participants'],
  ['products', 'Products & tracking'],
  ['operations', 'Shipment operations'],
]

export default function Sidebar({ active, onChange }) {
  return (
    <nav className="flex gap-2 overflow-x-auto lg:flex-col">
      {sections.map(([id, label]) => (
        <button key={id} onClick={() => onChange(id)} className={`whitespace-nowrap rounded-xl px-4 py-3 text-left text-sm font-medium transition ${active === id ? 'bg-emerald-400 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
          {label}
        </button>
      ))}
    </nav>
  )
}
