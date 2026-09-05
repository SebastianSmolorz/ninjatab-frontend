import { Currency } from '~/types'

export const CURRENCY_OPTIONS = [
  { value: Currency.USD, label: 'US Dollar',      symbol: '$'   },
  { value: Currency.EUR, label: 'Euro',            symbol: '€'   },
  { value: Currency.GBP, label: 'British Pound',   symbol: '£'   },
  { value: Currency.JPY, label: 'Japanese Yen',    symbol: '¥'   },
  { value: Currency.CAD, label: 'Canadian Dollar', symbol: 'CA$' },
  { value: Currency.AUD, label: 'Australian Dollar', symbol: 'A$'  },
  { value: Currency.TRY, label: 'Turkish Lira',    symbol: '₺'   },
  { value: Currency.PLN, label: 'Polish Złoty',    symbol: 'zł'  },
  { value: Currency.CZK, label: 'Czech Koruna',    symbol: 'Kč'  },
]

// The backend accepts ~150 currencies but only the ones above are offered in
// the app, and a public tab can be in any of them. The list wins where it has
// an opinion ($ for USD, not US$); Intl covers the rest, in `symbol` mode so
// the dollar variants stay distinguishable (A$, NZ$ rather than a bare $).
const intlCurrencySymbol = (code: string): string => {
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: code })
      .formatToParts(0)
      .find(part => part.type === 'currency')?.value ?? code
  } catch {
    return code
  }
}

export const getCurrencySymbol = (code: string): string =>
  CURRENCY_OPTIONS.find(o => o.value === code)?.symbol ?? intlCurrencySymbol(code)

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

/**
 * Summary formatting for the public trip pages: symbol, no thousands
 * separators, and cents only when there are any.
 * e.g. 254100 + "USD" → "$2541", 63525 → "$635.25".
 */
export function formatMinorCurrencyCompact(amount: number, currency: string): string {
  const [whole, cents] = minorToDisplay(amount, currency).split('.')
  return `${getCurrencySymbol(currency)}${whole}${cents && cents !== '00' ? `.${cents}` : ''}`
}
