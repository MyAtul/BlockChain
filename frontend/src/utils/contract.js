import { BrowserProvider } from 'ethers'
import { getSupplyChainContract } from './wallet'

export async function getReadContract() {
  const provider = new BrowserProvider(window.ethereum)
  return getSupplyChainContract(provider)
}

export async function getWriteContract() {
  const provider = new BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  return getSupplyChainContract(signer)
}

export async function waitForTransaction(tx) {
  const receipt = await tx.wait()
  if (!receipt || receipt.status !== 1) {
    throw new Error('Transaction failed. Please try again.')
  }
  return receipt
}

export function getErrorMessage(error) {
  return (
    error?.shortMessage ||
    error?.reason ||
    error?.info?.error?.message ||
    error?.message ||
    'Something went wrong.'
  )
}
