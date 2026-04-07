import type { Bill, LineItem, PersonLineItemClaim, TabPerson, SplitType } from '~/types'
import { minorToDisplay, formatMinorCurrency } from '~/utils/currency'

/**
 * Check if a line item's claims represent an even split.
 * Even means all claims have the same split_value and cover all people in the tab.
 */
export function isEvenSplit(claims: PersonLineItemClaim[], totalPeople: number): boolean {
  if (claims.length === 0 || claims.length !== totalPeople) return false
  const values = claims.map(c => Number(c.split_value) || 0)
  return values.every(v => v === values[0])
}

/**
 * Calculate the amount a person owes for a line item based on shares.
 * @param lineItemValue - Total value in minor units
 * @param personShares - Number of shares this person has
 * @param totalShares - Total shares across all people
 * @returns Calculated amount in minor units (integer)
 */
export function calculateShareSplit(
  lineItemValue: number,
  personShares: number,
  totalShares: number
): number {
  if (totalShares === 0) return 0
  return Math.round((lineItemValue * personShares) / totalShares)
}

/**
 * Calculate the amount a person owes for a line item based on split type.
 * @param lineItem - The line item
 * @param personSplitValue - The person's split value (shares count or minor units for VALUE type)
 * @param totalShares - Total shares (only used for SHARES split type)
 * @returns Calculated amount in minor units
 */
export function calculatePersonAmount(
  lineItem: LineItem,
  personSplitValue: number,
  totalShares: number = 0
): number {
  if (lineItem.split_type === 'shares') {
    return calculateShareSplit(lineItem.value, personSplitValue, totalShares)
  } else {
    // VALUE split type - already in minor units
    return personSplitValue
  }
}

/**
 * Calculate total shares for a line item from draft splits.
 */
export function calculateTotalShares(
  lineItemId: string,
  draftSplits: { [personId: string]: number | null }
): number {
  const splits = draftSplits || {}
  return Object.values(splits)
    .filter((v) => v !== null)
    .reduce((sum, val) => sum + (val || 0), 0)
}

/**
 * Validate that splits for a VALUE type line item don't exceed the line item value.
 */
export function validateValueSplits(
  lineItem: LineItem,
  draftSplits: { [personId: string]: number | null },
  currency: string
): { valid: boolean; error?: string } {
  if (lineItem.split_type !== 'value') {
    return { valid: true }
  }

  const splitValues = Object.values(draftSplits).filter((v) => v !== null) as number[]
  const total = splitValues.reduce((sum, val) => sum + val, 0)

  if (total > lineItem.value) {
    return {
      valid: false,
      error: `Total split (${minorToDisplay(total, currency)}) exceeds line item value (${minorToDisplay(lineItem.value, currency)})`,
    }
  }

  return { valid: true }
}

/**
 * Calculate the total amount a person owes across all bills (in minor units).
 */
export function calculatePersonTotalAcrossBills(bills: Bill[], personId: string): number {
  let total = 0

  for (const bill of bills) {
    for (const lineItem of bill.line_items) {
      for (const claim of lineItem.person_claims) {
        if (claim.person_id === personId && claim.calculated_amount) {
          total += claim.calculated_amount
        }
      }
    }
  }

  return total
}

/**
 * Calculate the total amount a person has paid across all bills (in minor units).
 */
export function calculatePersonTotalPaid(bills: Bill[], personId: string): number {
  let total = 0

  for (const bill of bills) {
    if (bill.paid_by?.id === personId) {
      total += bill.total_amount
    }
  }

  return total
}

/**
 * Calculate net balance for a person in minor units (positive = owed money, negative = owes).
 */
export function calculatePersonNetBalance(bills: Bill[], personId: string): number {
  const paid = calculatePersonTotalPaid(bills, personId)
  const owed = calculatePersonTotalAcrossBills(bills, personId)
  return paid - owed
}

/**
 * Calculate even split values for all people.
 * @param lineItemValue - Total value in minor units
 * @param people - Array of people to split among
 * @param splitType - Type of split ('shares' or 'value')
 * @returns Map of person ID to split value
 */
export function calculateEvenSplitForAll(
  lineItemValue: number,
  people: TabPerson[],
  splitType: SplitType
): { [personId: string]: number } {
  const result: { [personId: string]: number } = {}

  if (splitType === 'shares') {
    people.forEach((person) => {
      result[person.id] = 1
    })
  } else {
    // Even value split: divide minor units equally, rounding down
    const valuePerPerson = Math.round(lineItemValue / people.length)
    people.forEach((person) => {
      result[person.id] = valuePerPerson
    })
  }

  return result
}

/**
 * Format minor unit currency amount for display.
 */
export function formatCurrency(amount: number, currency: string): string {
  return formatMinorCurrency(amount, currency)
}

/**
 * Calculate preview of what each person will owe based on draft splits.
 * Returns values in minor units.
 */
export function calculateSplitPreview(
  lineItem: LineItem,
  draftSplits: { [personId: string]: number | null }
): { [personId: string]: number } {
  const preview: { [personId: string]: number } = {}

  if (lineItem.split_type === 'shares') {
    const totalShares = calculateTotalShares(lineItem.id, draftSplits)

    Object.entries(draftSplits).forEach(([personId, shares]) => {
      if (shares !== null) {
        preview[personId] = calculateShareSplit(lineItem.value, shares, totalShares)
      }
    })
  } else {
    // VALUE split type - values are already in minor units
    Object.entries(draftSplits).forEach(([personId, value]) => {
      if (value !== null) {
        preview[personId] = value
      }
    })
  }

  return preview
}
