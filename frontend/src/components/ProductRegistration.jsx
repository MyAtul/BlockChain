import { useState } from 'react'
import { PackagePlus } from 'lucide-react'
import { getWriteContract, waitForTransaction, getErrorMessage } from '../utils/contract'

export default function ProductRegistration({ account, isParticipant, onSuccess }) {
  const [form, setForm] = useState({ name: '', description: '', origin: '' })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function change(event) { setForm(prev => ({ ...prev, [event.target.name]: event.target.value })) }

  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage(''); setError('')
    try {
      if (!account) throw new Error('Connect MetaMask first.')
      if (!isParticipant) throw new Error('Your wallet is not registered as a participant. Ask the admin to register it first.')
      const contract = await getWriteContract()
      const tx = await contract.registerProduct(form.name.trim(), form.description.trim(), form.origin.trim())
      const receipt = await waitForTransaction(tx)
      let productId = ''
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log)
          if (parsed?.name === 'ProductRegistered') productId = parsed.args.productId.toString()
        } catch { /* Ignore logs from other contracts */ }
      }
      setMessage(`Product registered successfully${productId ? ` · Product ID: ${productId}` : ''}`)
      setForm({ name: '', description: '', origin: '' })
      onSuccess?.(productId)
    } catch (err) { setError(getErrorMessage(err)) }
    finally { setBusy(false) }
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center gap-3"><PackagePlus className="text-emerald-300" /><div><h3 className="font-semibold">Register product</h3><p className="text-sm text-slate-400">Create an on-chain product record</p></div></div>
      {!isParticipant && <p className="mb-3 rounded-lg bg-amber-950/60 p-3 text-sm text-amber-200">Your connected wallet must be registered by the admin before creating products.</p>}
      <form onSubmit={submit} className="space-y-3">
        <input name="name" value={form.name} onChange={change} placeholder="Product name / batch" required className="field" />
        <textarea name="description" value={form.description} onChange={change} placeholder="Description (optional)" rows={3} className="field" />
        <input name="origin" value={form.origin} onChange={change} placeholder="Origin / starting location" required className="field" />
        <button disabled={busy || !account || !isParticipant} className="primary-button"><PackagePlus size={16} />{busy ? 'Submitting transaction…' : 'Register on blockchain'}</button>
      </form>
      {message && <p className="notice-success">{message}</p>}{error && <p className="notice-error">{error}</p>}
    </section>
  )
}
