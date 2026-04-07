import { Currency } from '~/types'

export const CURRENCY_OPTIONS = [
  { value: Currency.USD, label: 'US Dollar',      symbol: '$'   },
  { value: Currency.EUR, label: 'Euro',            symbol: '€'   },
  { value: Currency.GBP, label: 'British Pound',   symbol: '£'   },
  { value: Currency.JPY, label: 'Japanese Yen',    symbol: '¥'   },
  { value: Currency.CAD, label: 'Canadian Dollar', symbol: 'CA$' },
  { value: Currency.TRY, label: 'Turkish Lira',    symbol: '₺'   },
  { value: Currency.PLN, label: 'Polish Złoty',    symbol: 'zł'  },
  { value: Currency.CZK, label: 'Czech Koruna',    symbol: 'Kč'  },
]

export const getCurrencySymbol = (code: string): string =>
  CURRENCY_OPTIONS.find(o => o.value === code)?.symbol ?? code

const ZERO_DECIMAL_CURRENCIES = new Set(['JPY', 'HUF'])

export function getDecimalPlaces(currency: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(currency) ? 0 : 2
}

/**
 * Convert a user-typed display string to integer minor units.
 * Uses string splitting to avoid floating-point arithmetic.
 * e.g. "12.50" + "USD" → 1250, "1500" + "JPY" → 1500
 */
export function parseDisplayToMinor(input: string, currency: string): number {
  const cleaned = input.trim()
  if (!cleaned || cleaned === '.' || cleaned === '-') return 0
  const dp = getDecimalPlaces(currency)
  if (dp === 0) {
    return parseInt(cleaned, 10) || 0
  }
  const [majorStr, minorStr = ''] = cleaned.split('.')
  const major = parseInt(majorStr || '0', 10) || 0
  // Pad or truncate fractional part to exactly `dp` digits
  const paddedMinor = minorStr.slice(0, dp).padEnd(dp, '0')
  const minor = parseInt(paddedMinor, 10) || 0
  const factor = Math.pow(10, dp)
  return major * factor + minor
}

/**
 * Convert integer minor units to a display string.
 * Uses integer division and modulo to avoid floating-point arithmetic.
 * e.g. 1250 + "USD" → "12.50", 1500 + "JPY" → "1500"
 */
export function minorToDisplay(amount: number, currency: string): string {
  const dp = getDecimalPlaces(currency)
  if (dp === 0) return String(Math.trunc(amount))
  const factor = Math.pow(10, dp)
  const absAmount = Math.abs(amount)
  const major = Math.trunc(absAmount / factor)
  const minor = absAmount % factor
  const sign = amount < 0 ? '-' : ''
  return `${sign}${major}.${String(minor).padStart(dp, '0')}`
}

/**
 * Format integer minor units as a currency string with symbol.
 * e.g. 1250 + "USD" → "$12.50", 1500 + "JPY" → "¥1500"
 */
export function formatMinorCurrency(amount: number, currency: string): string {
  return `${getCurrencySymbol(currency)}${minorToDisplay(amount, currency)}`
}
