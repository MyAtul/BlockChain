import { Clock3, MapPin, PackageCheck } from 'lucide-react'
import { formatTimestamp, shortenAddress } from '../utils/formatters'

export default function TrackingTimeline({ history = [] }) {
  if (!history.length) return <p className="text-sm text-slate-400">No tracking history loaded.</p>
  return (
    <ol className="space-y-4">
      {history.map((item, index) => (
        <li key={`${item.timestamp}-${index}`} className="relative flex gap-3">
          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300"><PackageCheck size={18} /></div>
          <div className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><strong>{item.status}</strong><span className="inline-flex items-center gap-1 text-xs text-slate-500"><Clock3 size={13} />{formatTimestamp(item.timestamp)}</span></div>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-300"><MapPin size={14} />{item.location}</p>
            {item.notes && <p className="mt-2 text-sm text-slate-400">{item.notes}</p>}
            <p className="mt-2 text-xs text-slate-500">Recorded by {shortenAddress(item.updatedBy)}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
