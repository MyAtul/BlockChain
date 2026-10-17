import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { getWriteContract, waitForTransaction, getErrorMessage } from '../utils/contract'

const roles = ['Manufacturer', 'Transporter', 'Distributor', 'Retailer']

export default function ParticipantRegistration({ account, isAdmin, onSuccess }) {
  const [address, setAddress] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState(roles[0])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setBusy(true); setMessage(''); setError('')
    try {
      if (!account) throw new Error('Connect MetaMask first.')
      if (!isAdmin) throw new Error('Only the contract admin can register participants. Connect the deployer account.')
      const contract = await getWriteContract()
      const tx = await contract.registerParticipant(address.trim(), name.trim(), role)
      await waitForTransaction(tx)
      setMessage(`Participant registered: ${name.trim()}`)
      setAddress(''); setName('')
      onSuccess?.()
    } catch (err) { setError(getErrorMessage(err)) }
    finally { setBusy(false) }
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center gap-3"><UserPlus className="text-emerald-300" /><div><h3 className="font-semibold">Register participant</h3><p className="text-sm text-slate-400">Admin only · register a wallet address</p></div></div>
      {!isAdmin && <p className="mb-3 rounded-lg bg-amber-950/60 p-3 text-sm text-amber-200">Connect the contract deployer wallet to use this form.</p>}
      <form onSubmit={submit} className="space-y-3">
        <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Participant wallet address (0x…)" required className="field" />
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Participant / company name" required className="field" />
        <select value={role} onChange={e => setRole(e.target.value)} className="field">{roles.map(item => <option key={item}>{item}</option>)}</select>
        <button disabled={busy || !account || !isAdmin} className="primary-button"><UserPlus size={16} />{busy ? 'Registering…' : 'Register participant'}</button>
      </form>
      {message && <p className="notice-success">{message}</p>}{error && <p className="notice-error">{error}</p>}
    </section>
  )
}
