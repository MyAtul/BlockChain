
import { Blocks } from 'lucide-react'
import WalletConnect from './WalletConnect'

export default function Navbar({ wallet }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-400 p-2 text-slate-950">
            <Blocks size={23} />
          </div>

          <div>
            <h1 className="font-bold tracking-tight">ChainTrack</h1>
            <p className="text-xs text-slate-500">
              Supply chain transparency
            </p>
          </div>
        </div>

        <WalletConnect
          account={wallet.account}
          loading={wallet.loading}
          error={wallet.error}
          isLocalNetwork={wallet.isLocalNetwork}
          onConnect={wallet.connect}
          onDisconnect={wallet.disconnectView}
        />
      </div>
    </header>
  )
}
