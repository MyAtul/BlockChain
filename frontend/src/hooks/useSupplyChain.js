import { useCallback, useState } from 'react'
import { getReadContract } from '../utils/contract'

export function useSupplyChain() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const run = useCallback(async (operation) => {
    setBusy(true)
    setError('')
    try {
      return await operation()
    } catch (err) {
      const message = err?.shortMessage || err?.reason || err?.message || 'Blockchain request failed.'
      setError(message)
      throw new Error(message)
    } finally {
      setBusy(false)
    }
  }, [])

  const getProduct = useCallback((id) => run(async () => {
    const contract = await getReadContract()
    return contract.getProduct(BigInt(id))
  }), [run])

  const getHistory = useCallback((id) => run(async () => {
    const contract = await getReadContract()
    return contract.getHistory(BigInt(id))
  }), [run])

  const getParticipant = useCallback((address) => run(async () => {
    const contract = await getReadContract()
    return contract.participants(address)
  }), [run])

  const getAdmin = useCallback(() => run(async () => {
    const contract = await getReadContract()
    return contract.admin()
  }), [run])

  return { busy, error, getProduct, getHistory, getParticipant, getAdmin }
}
