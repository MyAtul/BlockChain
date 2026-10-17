import { useState } from 'react'
import { Search, Package, RefreshCw } from 'lucide-react'
import { getReadContract } from '../utils/contract'
import { getErrorMessage } from '../utils/contract'
import { shortenAddress } from '../utils/formatters'
import TrackingTimeline from './TrackingTimeline'

export default function ProductLookup({ refreshKey = 0 }) {
  const [id, setId] = useState('1')
  const [product, setProduct] = useState(null)
  const [history, setHistory] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function search(event) {
    event?.preventDefault()
    setBusy(true); setError(''); setProduct(null); setHistory([])
    try {
      if (!window.ethereum) throw new Error('MetaMask extension not detected.')
      const contract = await getReadContract()
      const result = await contract.getProduct(BigInt(id))
      const records = await contract.getHistory(BigInt(id))
      setProduct({
        id: result.id.toString(),
        name: result.name,
        description: result.description,
        origin: result.origin,
        currentOwner: result.currentOwner,
        status: result.status,
      })
      setHistory(records.map(item => ({
        updatedBy: item.updatedBy,
        location: item.location,
        status: item.status,
        notes: item.notes,
        timestamp: item.timestamp.toString(),
      })))
    } catch (err) { setError(getErrorMessage(err)) }
    finally { setBusy(false) }
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center gap-3"><Search className="text-emerald-300" /><div><h3 className="font-semibold">Track a product</h3><p className="text-sm text-slate-400">Look up on-chain product details and journey</p></div></div>
      <form onSubmit={search} className="flex flex-col gap-3 sm:flex-row">
        <input type="number" min="1" value={id} onChange={e => setId(e.target.value)} placeholder="Product ID" required className="field" />
        <button disabled={busy} className="primary-button sm:max-w-48"><Search size={16} />{busy ? 'Searching…' : 'Track product'}</button>
      </form>
      {error && <p className="notice-error">{error}</p>}
      {product && <div className="mt-5 space-y-5">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-emerald-300">Product #{product.id}</p><h4 className="mt-1 text-xl font-bold">{product.name}</h4><p className="mt-1 text-sm text-slate-400">{product.description || 'No description provided'}</p></div><span className="rounded-full bg-emerald-950 px-3 py-1 text-xs text-emerald-300">{product.status}</span></div>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><p className="text-slate-500">Origin</p><p>{product.origin}</p></div><div><p className="text-slate-500">Current owner</p><p className="font-mono">{shortenAddress(product.currentOwner)}</p></div></div>
        </div>
        <div><div className="mb-3 flex items-center gap-2"><RefreshCw size={16} className="text-emerald-300" /><h4 className="font-semibold">Tracking history</h4></div><TrackingTimeline history={history} /></div>
      </div>}
    </section>
  )
}
