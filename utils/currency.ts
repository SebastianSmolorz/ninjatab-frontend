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
