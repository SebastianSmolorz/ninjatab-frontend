import type { Bill, LineItem, PersonLineItemClaim, TabPerson, SplitType } from '~/types'

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
 * Calculate the amount a person owes for a line item based on shares
 * @param lineItemValue - Total value of the line item
 * @param personShares - Number of shares this person has
 * @param totalShares - Total shares across all people
 * @returns Calculated amount rounded to 2 decimal places
 */
export function calculateShareSplit(
  lineItemValue: number,
  personShares: number,
  totalShares: number
): number {
  if (totalShares === 0) return 0
  const amount = (lineItemValue * personShares) / totalShares
  return Math.round(amount * 100) / 100
}

/**
 * Calculate the amount a person owes for a line item based on split type
 * @param lineItem - The line item
 * @param personSplitValue - The person's split value (shares or direct value)
 * @param totalShares - Total shares (only used for SHARES split type)
 * @returns Calculated amount rounded to 2 decimal places
 */
export function calculatePersonAmount(
  lineItem: LineItem,
  personSplitValue: number,
  totalShares: number = 0
): number {
  if (lineItem.split_type === 'shares') {
    return calculateShareSplit(lineItem.value, personSplitValue, totalShares)
  } else {
    // VALUE split type - direct value
    return Math.round(personSplitValue * 100) / 100
  }
}

/**
 * Calculate total shares for a line item from draft splits
 * @param lineItemId - ID of the line item
 * @param draftSplits - Current draft splits state
 * @returns Total shares
 */
export function calculateTotalShares(
  lineItemId: number,
  draftSplits: { [personId: number]: number | null }
): number {
  const splits = draftSplits || {}
  return Object.values(splits)
    .filter((v) => v !== null)
    .reduce((sum, val) => sum + (val || 0), 0)
}

/**
 * Validate that splits for a VALUE type line item don't exceed the line item value
 * @param lineItem - The line item
 * @param draftSplits - Current draft splits for this line item
 * @returns Validation result with error message if invalid
 */
export function validateValueSplits(
  lineItem: LineItem,
  draftSplits: { [personId: number]: number | null }
): { valid: boolean; error?: string } {
  if (lineItem.split_type !== 'value') {
    return { valid: true }
  }

  const splitValues = Object.values(draftSplits).filter((v) => v !== null) as number[]
  const total = splitValues.reduce((sum, val) => sum + val, 0)

  if (total > lineItem.value) {
    return {
      valid: false,
      error: `Total split (${total.toFixed(2)}) exceeds line item value (${lineItem.value.toFixed(2)})`,
    }
  }

  return { valid: true }
}

/**
 * Calculate the total amount a person owes across all bills
 * @param bills - Array of bills
 * @param personId - ID of the person
 * @returns Total amount owed
 */
export function calculatePersonTotalAcrossBills(bills: Bill[], personId: number): number {
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

  return Math.round(total * 100) / 100
}

/**
 * Calculate the total amount a person has paid across all bills
 * @param bills - Array of bills
 * @param personId - ID of the person
 * @returns Total amount paid
 */
export function calculatePersonTotalPaid(bills: Bill[], personId: number): number {
  let total = 0

  for (const bill of bills) {
    if (bill.paid_by?.id === personId) {
      total += bill.total_amount
    }
  }

  return Math.round(total * 100) / 100
}

/**
 * Calculate net balance for a person (what they paid - what they owe)
 * @param bills - Array of bills
 * @param personId - ID of the person
 * @returns Net balance (positive means they're owed money, negative means they owe)
 */
export function calculatePersonNetBalance(bills: Bill[], personId: number): number {
  const paid = calculatePersonTotalPaid(bills, personId)
  const owed = calculatePersonTotalAcrossBills(bills, personId)
  return Math.round((paid - owed) * 100) / 100
}

/**
 * Calculate even split values for all people
 * @param lineItemValue - Total value of the line item
 * @param people - Array of people to split among
 * @param splitType - Type of split ('shares' or 'value')
 * @returns Map of person ID to split value
 */
export function calculateEvenSplitForAll(
  lineItemValue: number,
  people: TabPerson[],
  splitType: SplitType
): { [personId: number]: number } {
  const result: { [personId: number]: number } = {}

  if (splitType === 'shares') {
    // Even shares: 1 share per person
    people.forEach((person) => {
      result[person.id] = 1
    })
  } else {
    // Even value: divide total by number of people
    const valuePerPerson = Math.round((lineItemValue / people.length) * 100) / 100
    people.forEach((person) => {
      result[person.id] = valuePerPerson
    })
  }

  return result
}

/**
 * Format currency amount for display
 * @param amount - Amount to format
 * @param currency - Currency code
 * @returns Formatted string
 */
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

/**
 * Calculate preview of what each person will owe based on draft splits
 * @param lineItem - The line item
 * @param draftSplits - Current draft splits
 * @returns Map of person ID to calculated amount
 */
export function calculateSplitPreview(
  lineItem: LineItem,
  draftSplits: { [personId: number]: number | null }
): { [personId: number]: number } {
  const preview: { [personId: number]: number } = {}

  if (lineItem.split_type === 'shares') {
    const totalShares = calculateTotalShares(lineItem.id, draftSplits)

    Object.entries(draftSplits).forEach(([personIdStr, shares]) => {
      if (shares !== null) {
        const personId = parseInt(personIdStr)
        preview[personId] = calculateShareSplit(lineItem.value, shares, totalShares)
      }
    })
  } else {
    // VALUE split type
    Object.entries(draftSplits).forEach(([personIdStr, value]) => {
      if (value !== null) {
        const personId = parseInt(personIdStr)
        preview[personId] = Math.round(value * 100) / 100
      }
    })
  }

  return preview
}
