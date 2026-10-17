import { useCallback, useEffect, useState } from 'react'
import { connectWallet } from '../utils/wallet'

export function useWallet() {
  const [account, setAccount] = useState('')
  const [chainId, setChainId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!window.ethereum) {
      setChainId('')
      return
    }
    try {
      const [accounts, id] = await Promise.all([
        window.ethereum.request({ method: 'eth_accounts' }),
        window.ethereum.request({ method: 'eth_chainId' }),
      ])
      setAccount(accounts?.[0] || '')
      setChainId(id || '')
    } catch {
      setAccount('')
      setChainId('')
    }
  }, [])

  const connect = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const wallet = await connectWallet()
      setAccount(wallet.address)
      setChainId(await window.ethereum.request({ method: 'eth_chainId' }))
      return wallet.address
    } catch (err) {
      setError(err?.shortMessage || err?.message || 'Wallet connection failed.')
      return ''
    } finally {
      setLoading(false)
    }
  }, [])

  const disconnectView = useCallback(() => {
    // MetaMask does not expose a dapp-side disconnect API; this clears local UI state only.
    setAccount('')
    setError('')
  }, [])

  useEffect(() => {
    refresh()
    if (!window.ethereum?.on) return undefined
    const onAccountsChanged = (accounts) => setAccount(accounts?.[0] || '')
    const onChainChanged = (id) => setChainId(id)
    window.ethereum.on('accountsChanged', onAccountsChanged)
    window.ethereum.on('chainChanged', onChainChanged)
    return () => {
      window.ethereum.removeListener?.('accountsChanged', onAccountsChanged)
      window.ethereum.removeListener?.('chainChanged', onChainChanged)
    }
  }, [refresh])

  return {
    account, chainId, loading, error, connect, refresh, disconnectView,
    isLocalNetwork: chainId === '0x7a69',
  }
}
