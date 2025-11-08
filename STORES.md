# Frontend Stores Documentation

This document explains how to use the Pinia stores for managing tabs and bills in the NinjaTab frontend.

## Overview

The frontend uses Pinia for state management with two main stores:
- `useTabStore` - Manages tabs and participants
- `useBillStore` - Manages bills, line items, and splitting

## Store Setup

### Configuration

The API base URL is configured in `nuxt.config.ts` and can be overridden with environment variable:

```bash
# .env
NUXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```

## Tab Store (`stores/tabs.ts`)

### Usage Example

```vue
<script setup lang="ts">
import { useTabStore } from '~/stores/tabs'
import { Currency } from '~/types'

const tabStore = useTabStore()

// Fetch all tabs
await tabStore.fetchTabs()

// Create a new tab
const newTab = await tabStore.createTab({
  name: 'Weekend Trip',
  description: 'Expenses for our weekend getaway',
  default_currency: Currency.USD,
  people: [
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' },
    { name: 'Charlie' } // email is optional
  ]
})

// Fetch a specific tab with all people
await tabStore.fetchTabById(1)

// Access current tab
const currentTab = tabStore.currentTab
const people = tabStore.tabPeople

// Delete a tab
await tabStore.deleteTab(1)
</script>
```

### State

```typescript
{
  tabs: TabListItem[]           // All tabs (list view)
  currentTab: Tab | null         // Currently selected tab (with people)
  loading: boolean               // Loading state
  error: string | null           // Error message
}
```

### Getters

- `tabById(id)` - Find a tab by ID
- `tabPeople` - Get people from current tab
- `isLoading` - Check if loading
- `hasError` - Check if there's an error

### Actions

- `fetchTabs()` - Get all tabs
- `fetchTabById(id)` - Get specific tab with people
- `createTab(data)` - Create new tab
- `deleteTab(id)` - Delete a tab
- `setCurrentTab(tab)` - Set current tab
- `clearError()` - Clear error state

## Bill Store (`stores/bills.ts`)

### Usage Example

```vue
<script setup lang="ts">
import { useBillStore } from '~/stores/bills'
import { useTabStore } from '~/stores/tabs'
import { Currency, SplitType } from '~/types'

const billStore = useBillStore()
const tabStore = useTabStore()

// Fetch bills for a tab
await billStore.fetchBills(tabId)

// Create a bill with line items
const newBill = await billStore.createBill({
  tab_id: 1,
  description: 'Dinner at Restaurant',
  currency: Currency.USD,
  creator_id: 1,
  paid_by_id: 1,
  date: '2025-11-08',
  line_items: [
    {
      description: 'Pizza',
      value: 30.00,
      split_type: SplitType.SHARES,
      person_splits: [
        { person_id: 1, split_value: 2 },  // Alice gets 2 shares
        { person_id: 2, split_value: 1 }   // Bob gets 1 share
      ]
    },
    {
      description: 'Drinks',
      value: 15.00,
      split_type: SplitType.VALUE,
      person_splits: [
        { person_id: 1, split_value: 10 },  // Alice pays $10
        { person_id: 2, split_value: 5 }    // Bob pays $5
      ]
    }
  ]
})

// Fetch a specific bill
await billStore.fetchBillById(1)

// Update splits (UI workflow)
const people = tabStore.tabPeople
const lineItem = billStore.currentLineItems[0]

// Set split mode
billStore.setSplitMode('even')

// Calculate even split for everyone
billStore.calculateEvenSplit(lineItem, people)

// Or manually update individual splits
billStore.updateDraftSplit(lineItem.id, person.id, 2) // 2 shares

// Validate before submitting
const validation = billStore.validateSplits()
if (validation.valid) {
  await billStore.submitSplits(billStore.currentBill!.id)
} else {
  console.error(validation.errors)
}
</script>
```

### State

```typescript
{
  bills: BillListItem[]          // All bills (list view)
  currentBill: Bill | null       // Currently selected bill (with line items)
  loading: boolean               // Loading state
  error: string | null           // Error message
  splitMode: 'even' | 'uneven'   // Current split mode
  draftSplits: DraftSplits       // Working state for split editing
}
```

### Getters

- `billById(id)` - Find a bill by ID
- `billsByTabId(tabId)` - Filter bills by tab
- `currentLineItems` - Get line items from current bill
- `totalBillAmount` - Total amount of current bill
- `isValidSplit` - Check if draft splits are valid
- `personTotalOwed(personId)` - Calculate what person owes
- `isLoading` - Check if loading
- `hasError` - Check if there's an error

### Actions

- `fetchBills(tabId?)` - Get all bills, optionally filtered by tab
- `fetchBillById(id)` - Get specific bill with line items
- `createBill(data)` - Create new bill
- `submitSplits(billId)` - Submit draft splits to backend
- `updateDraftSplit(lineItemId, personId, value)` - Update local split state
- `calculateEvenSplit(lineItem, people)` - Auto-calculate even split
- `resetDraftSplits()` - Reset to saved splits
- `validateSplits()` - Validate current draft splits
- `setCurrentBill(bill)` - Set current bill
- `setSplitMode(mode)` - Set split mode ('even' or 'uneven')
- `clearError()` - Clear error state

## Calculation Utilities (`utils/calculations.ts`)

Helper functions for split calculations:

```typescript
// Calculate share-based split
calculateShareSplit(lineItemValue, personShares, totalShares)

// Calculate person amount based on split type
calculatePersonAmount(lineItem, personSplitValue, totalShares)

// Validate VALUE splits don't exceed line item value
validateValueSplits(lineItem, draftSplits)

// Calculate totals across bills
calculatePersonTotalAcrossBills(bills, personId)
calculatePersonTotalPaid(bills, personId)
calculatePersonNetBalance(bills, personId)

// Calculate even split for all people
calculateEvenSplitForAll(lineItemValue, people, splitType)

// Preview what each person will owe
calculateSplitPreview(lineItem, draftSplits)

// Format currency for display
formatCurrency(amount, currency)
```

## Split Types

### SHARES Split Type
People get proportional shares of the total:
```typescript
// Example: $30 pizza, Alice gets 2 shares, Bob gets 1 share
// Total shares = 3
// Alice owes: $30 * 2 / 3 = $20
// Bob owes: $30 * 1 / 3 = $10
```

### VALUE Split Type
Direct value assignment:
```typescript
// Example: $15 drinks
// Alice pays: $10
// Bob pays: $5
// Total must not exceed $15
```

## Workflow Examples

### Creating a Tab and Bill

```vue
<script setup lang="ts">
const tabStore = useTabStore()
const billStore = useBillStore()

// 1. Create a tab
const tab = await tabStore.createTab({
  name: 'Road Trip',
  description: 'Expenses for our road trip',
  default_currency: Currency.USD,
  people: [
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' }
  ]
})

// 2. Create a bill with even split
const people = tab.people
const bill = await billStore.createBill({
  tab_id: tab.id,
  description: 'Gas',
  currency: Currency.USD,
  creator_id: people[0].id,
  paid_by_id: people[0].id,
  line_items: [
    {
      description: 'Gas fill up',
      value: 60.00,
      split_type: SplitType.SHARES,
      person_splits: people.map(p => ({
        person_id: p.id,
        split_value: 1  // Even split
      }))
    }
  ]
})
</script>
```

### Editing Splits

```vue
<script setup lang="ts">
const billStore = useBillStore()

// 1. Load the bill
await billStore.fetchBillById(billId)

// 2. Update splits in UI
const lineItem = billStore.currentLineItems[0]
billStore.updateDraftSplit(lineItem.id, person1.id, 2)
billStore.updateDraftSplit(lineItem.id, person2.id, 1)

// 3. Validate
const { valid, errors } = billStore.validateSplits()
if (!valid) {
  alert(errors.join('\n'))
  return
}

// 4. Submit
await billStore.submitSplits(billStore.currentBill!.id)
```

## Error Handling

Both stores handle errors consistently:

```vue
<script setup lang="ts">
const tabStore = useTabStore()

try {
  await tabStore.createTab(data)
} catch (error) {
  // Error is automatically set in store.error
  console.error(tabStore.error)
}

// Or use the error in template
if (tabStore.hasError) {
  // Show error to user
}

// Clear error when needed
tabStore.clearError()
</script>
```

## TypeScript Support

All stores are fully typed with TypeScript. Import types from `~/types`:

```typescript
import type {
  Tab,
  TabListItem,
  Bill,
  BillListItem,
  LineItem,
  TabPerson,
  CreateTabData,
  CreateBillData,
  Currency,
  SplitType,
  SplitMode
} from '~/types'
```
