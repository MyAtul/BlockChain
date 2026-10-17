import { useState } from 'react'
import { ArrowRightLeft } from 'lucide-react'
import { getWriteContract, waitForTransaction, getErrorMessage } from '../utils/contract'

export default function TransferProduct({ account, isParticipant, onSuccess }) {
  const [form, setForm] = useState({ id: '', recipient: '', location: '', notes: '' })
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('')
  function change(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })) }
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMessage(''); setError('')
    try {
      if (!account) throw new Error('Connect MetaMask first.')
      if (!isParticipant) throw new Error('Your wallet is not a registered participant.')
      const contract = await getWriteContract()
      const tx = await contract.transferProduct(BigInt(form.id), form.recipient.trim(), form.location.trim(), form.notes.trim())
      await waitForTransaction(tx)
      setMessage(`Product #${form.id} transferred. The recipient is now the owner.`)
      onSuccess?.(form.id)
      setForm({ id: '', recipient: '', location: '', notes: '' })
    } catch (err) { setError(getErrorMessage(err)) }
    finally { setBusy(false) }
  }
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center gap-3"><ArrowRightLeft className="text-emerald-300" /><div><h3 className="font-semibold">Transfer product</h3><p className="text-sm text-slate-400">Hand over ownership to a registered participant</p></div></div>
      <form onSubmit={submit} className="space-y-3">
        <input name="id" type="number" min="1" value={form.id} onChange={change} placeholder="Product ID" required className="field" />
        <input name="recipient" value={form.recipient} onChange={change} placeholder="Recipient wallet address (0x…)" required className="field" />
        <input name="location" value={form.location} onChange={change} placeholder="Handover location" required className="field" />
        <textarea name="notes" value={form.notes} onChange={change} placeholder="Handover notes (optional)" rows={2} className="field" />
        <button disabled={busy || !account || !isParticipant} className="primary-button"><ArrowRightLeft size={16} />{busy ? 'Transferring…' : 'Transfer ownership'}</button>
      </form>
      {message && <p className="notice-success">{message}</p>}{error && <p className="notice-error">{error}</p>}
    </section>
  )
}
