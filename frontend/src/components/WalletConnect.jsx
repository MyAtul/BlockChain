import { Wallet, LogOut, CircleCheck, AlertTriangle } from 'lucide-react'
import { shortenAddress } from '../utils/formatters'

export default function WalletConnect({ account, loading, error, isLocalNetwork, onConnect, onDisconnect }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {account ? (
        <>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs ${isLocalNetwork ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'}`}>
            {isLocalNetwork ? <CircleCheck size={14} /> : <AlertTriangle size={14} />}
            {isLocalNetwork ? 'Hardhat Local' : 'Wrong network'}
          </span>
          <span title={account} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-sm">
            {shortenAddress(account)}
          </span>
          <button onClick={onDisconnect} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800">
            <LogOut size={16} /> Clear
          </button>
        </>
      ) : (
        <button onClick={onConnect} disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-50">
          <Wallet size={17} /> {loading ? 'Connecting…' : 'Connect MetaMask'}
        </button>
      )}
      {error && <p className="w-full text-sm text-rose-300">{error}</p>}
    </div>
  )
}
