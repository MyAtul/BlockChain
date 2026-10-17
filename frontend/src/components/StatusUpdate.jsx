import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { getWriteContract, waitForTransaction, getErrorMessage } from '../utils/contract'

const statuses = ['In Transit', 'At Warehouse', 'Quality Check', 'Out for Delivery', 'Delivered', 'Delayed']

export default function StatusUpdate({ account, isParticipant, onSuccess }) {
  const [form, setForm] = useState({ id: '', location: '', status: statuses[0], notes: '' })
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('')
  function change(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })) }
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMessage(''); setError('')
    try {
      if (!account) throw new Error('Connect MetaMask first.')
      if (!isParticipant) throw new Error('Your wallet is not a registered participant.')
      const contract = await getWriteContract()
      const tx = await contract.updateProduct(BigInt(form.id), form.location.trim(), form.status, form.notes.trim())
      await waitForTransaction(tx)
      setMessage(`Status updated for product #${form.id}.`)
      onSuccess?.(form.id)
    } catch (err) { setError(getErrorMessage(err)) }
    finally { setBusy(false) }
  }
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center gap-3"><MapPin className="text-emerald-300" /><div><h3 className="font-semibold">Update shipment status</h3><p className="text-sm text-slate-400">Only the current owner can update a product</p></div></div>
      <form onSubmit={submit} className="space-y-3">
        <input name="id" type="number" min="1" value={form.id} onChange={change} placeholder="Product ID" required className="field" />
        <input name="location" value={form.location} onChange={change} placeholder="Current location" required className="field" />
        <select name="status" value={form.status} onChange={change} className="field">{statuses.map(s => <option key={s}>{s}</option>)}</select>
        <textarea name="notes" value={form.notes} onChange={change} placeholder="Notes (optional)" rows={2} className="field" />
        <button disabled={busy || !account || !isParticipant} className="primary-button"><MapPin size={16} />{busy ? 'Updating…' : 'Record status update'}</button>
      </form>
      {message && <p className="notice-success">{message}</p>}{error && <p className="notice-error">{error}</p>}
    </section>
  )
}
