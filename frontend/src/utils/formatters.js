export function shortenAddress(address = '') {
  if (!address) return ''
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function formatTimestamp(value) {
  const seconds = Number(value)
  if (!Number.isFinite(seconds) || seconds <= 0) return 'Unknown time'
  return new Date(seconds * 1000).toLocaleString()
}

export function safeString(value) {
  return value == null ? '' : String(value)
}
