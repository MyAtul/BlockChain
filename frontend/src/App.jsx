import { useCallback, useEffect, useState } from 'react'
import { Boxes, Users, PackageCheck, Truck, ShieldCheck, Activity, RefreshCw } from 'lucide-react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import StatCard from './components/StatCard'
import ParticipantRegistration from './components/ParticipantRegistration'
import ProductRegistration from './components/ProductRegistration'
import ProductLookup from './components/ProductLookup'
import StatusUpdate from './components/StatusUpdate'
import TransferProduct from './components/TransferProduct'
import { useWallet } from './hooks/useWallet'
import { getReadContract } from './utils/contract'

export default function App() {
  const wallet = useWallet()
  const [active, setActive] = useState('overview')
  const [isAdmin, setIsAdmin] = useState(false)
  const [isParticipant, setIsParticipant] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [productCount, setProductCount] = useState('—')
  const [participantStatus, setParticipantStatus] = useState('Connect wallet')
  const [checkError, setCheckError] = useState('')

  const refreshAccess = useCallback(async () => {
    setIsAdmin(false)
    setIsParticipant(false)
    setCheckError('')
    if (!wallet.account || !wallet.isLocalNetwork) {
      setParticipantStatus('Connect local wallet')
      return
    }
    try {
      const contract = await getReadContract()
      const [adminAddress, participant] = await Promise.all([
        contract.admin(),
        contract.participants(wallet.account),
      ])
      setIsAdmin(adminAddress.toLowerCase() === wallet.account.toLowerCase())
      setIsParticipant(Boolean(participant.registered))
      setParticipantStatus(participant.registered ? participant.role || participant.name || 'Registered' : 'Not registered')
      // This contract has no product-count getter; this placeholder intentionally stays unavailable.
      setProductCount('Use lookup')
    } catch (err) {
      setCheckError(err?.shortMessage || err?.message || 'Could not read contract. Check node and deployment.')
      setParticipantStatus('Unavailable')
    }
  }, [wallet.account, wallet.isLocalNetwork])

  useEffect(() => { refreshAccess() }, [refreshAccess, refreshKey])

  const refreshAll = () => setRefreshKey(v => v + 1)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar wallet={wallet} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Local blockchain workspace</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div><h2 className="text-3xl font-bold sm:text-4xl">Supply chain dashboard</h2><p className="mt-2 max-w-2xl text-slate-400">Register participants, create product records, track shipments and inspect on-chain history.</p></div>
            <button onClick={refreshAll} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"><RefreshCw size={15} /> Refresh status</button>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[210px_minmax(0,1fr)]">
          <aside><Sidebar active={active} onChange={setActive} /></aside>
          <div className="min-w-0 space-y-6">
            {checkError && <p className="notice-error">{checkError}</p>}
            {active === 'overview' && <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard label="Network" value={wallet.isLocalNetwork ? 'Hardhat Local' : 'Not connected'} hint="Chain ID 31337" icon={Activity} />
                <StatCard label="Wallet role" value={isAdmin ? 'Admin' : isParticipant ? 'Participant' : 'Unregistered'} hint={participantStatus} icon={Users} />
                <StatCard label="Products" value={productCount} hint="Use product lookup by ID" icon={Boxes} />
              </div>
              <div className="grid gap-6 xl:grid-cols-2">
                <ParticipantRegistration account={wallet.account} isAdmin={isAdmin} onSuccess={refreshAll} />
                <ProductRegistration account={wallet.account} isParticipant={isParticipant} onSuccess={refreshAll} />
              </div>
              <ProductLookup refreshKey={refreshKey} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><Truck className="text-emerald-300" /><h3 className="mt-3 font-semibold">Shipment operations</h3><p className="mt-1 text-sm text-slate-400">Update locations or transfer ownership from the operations section.</p><button onClick={() => setActive('operations')} className="mt-4 text-sm font-semibold text-emerald-300">Open operations →</button></div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><ShieldCheck className="text-emerald-300" /><h3 className="mt-3 font-semibold">Verifiable history</h3><p className="mt-1 text-sm text-slate-400">Each update is recorded by a blockchain transaction.</p><button onClick={() => setActive('products')} className="mt-4 text-sm font-semibold text-emerald-300">Track product →</button></div>
              </div>
            </>}
            {active === 'participants' && <div className="max-w-2xl"><ParticipantRegistration account={wallet.account} isAdmin={isAdmin} onSuccess={refreshAll} /><p className="mt-3 text-xs text-slate-500">Only the wallet that deployed the contract can register participants.</p></div>}
            {active === 'products' && <div className="space-y-6"><div className="grid gap-6 xl:grid-cols-2"><ProductRegistration account={wallet.account} isParticipant={isParticipant} onSuccess={refreshAll} /><ProductLookup refreshKey={refreshKey} /></div></div>}
            {active === 'operations' && <div className="grid gap-6 xl:grid-cols-2"><StatusUpdate account={wallet.account} isParticipant={isParticipant} onSuccess={refreshAll} /><TransferProduct account={wallet.account} isParticipant={isParticipant} onSuccess={refreshAll} /></div>}
          </div>
        </div>
        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 py-5 text-xs text-slate-500"><span>ChainTrack · Academic mini-project · Local development only</span><span className="inline-flex items-center gap-2"><Activity size={13} /> No paid services required</span></footer>
      </main>
    </div>
  )
}
