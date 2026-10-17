import { BrowserProvider, Contract } from 'ethers'
import {
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
  LOCAL_CHAIN_CONFIG,
  LOCAL_CHAIN_ID,
} from '../blockchain'

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask was not detected. Install or enable the extension.')
  }

  await window.ethereum.request({ method: 'eth_requestAccounts' })

  let chainId = await window.ethereum.request({ method: 'eth_chainId' })
  if (chainId !== LOCAL_CHAIN_ID) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: LOCAL_CHAIN_ID }],
      })
    } catch (error) {
      if (error.code !== 4902) throw error
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [LOCAL_CHAIN_CONFIG],
      })
    }
  }

  chainId = await window.ethereum.request({ method: 'eth_chainId' })
  if (chainId !== LOCAL_CHAIN_ID) {
    throw new Error('Switch MetaMask to Hardhat Local (chain ID 31337).')
  }

  const provider = new BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  return { provider, signer, address: await signer.getAddress() }
}

export function getSupplyChainContract(signerOrProvider) {
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider)
}
