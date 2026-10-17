import SupplyChainArtifact from './contracts/SupplyChain.json'

export const CONTRACT_ADDRESS =
  '0x5FbDB2315678afecb367f032d93F642f64180aa3'

export const CONTRACT_ABI = SupplyChainArtifact.abi
export const LOCAL_CHAIN_ID = '0x7a69'

export const LOCAL_CHAIN_CONFIG = {
  chainId: LOCAL_CHAIN_ID,
  chainName: 'Hardhat Local',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['http://127.0.0.1:8545'],
}
