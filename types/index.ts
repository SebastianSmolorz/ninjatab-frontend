// Enums matching backend
export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  CAD = 'CAD',
  TRY = 'TRY'
}

export enum SplitType {
  SHARES = 'shares',
  VALUE = 'value'
}

export enum BillStatus {
  OPEN = 'open',
  ALL_CLAIMED = 'all_claimed',
  ALL_PAID = 'all_paid',
  ARCHIVED = 'archived'
}

export enum SplitMode {
  EVEN = 'even',
  UNEVEN = 'uneven'
}

// User interfaces
export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
}

// Tab Person interfaces
export interface TabPerson {
  id: number
  name: string
  email: string | null
  user: User | null
  created_at: string
  updated_at: string
}

export interface TabPersonCreate {
  name: string
  email?: string
}

// Tab interfaces
export interface TabListItem {
  id: number
  name: string
  description: string
  default_currency: Currency
  is_settled: boolean
  bill_count: number
  created_at: string
  updated_at: string
}

export interface Settlement {
  id: number
  from_person: TabPerson
  to_person: TabPerson
  amount: number
  currency: Currency
  created_at: string
  updated_at: string
}

export interface Tab extends TabListItem {
  people: TabPerson[]
  settlements: Settlement[]
}

export interface SimplifyResult {
  settlements: Settlement[]
  message: string
}

// Line Item and Claim interfaces
export interface PersonLineItemClaim {
  id: number
  person_id: number
  person_name: string
  split_value: number | null
  calculated_amount: number | null
  has_claimed: boolean
  created_at: string
  updated_at: string
}

export interface LineItem {
  id: number
  description: string
  value: number
  split_type: SplitType
  is_closed: boolean
  person_claims: PersonLineItemClaim[]
  created_at: string
  updated_at: string
}

// Bill interfaces
export interface BillListItem {
  id: number
  description: string
  currency: Currency
  status: BillStatus
  date: string
  is_closed: boolean
  total_amount: number
  created_at: string
}

export interface Bill extends Omit<BillListItem, 'total_amount'> {
  creator: TabPerson
  paid_by: TabPerson | null
  line_items: LineItem[]
  total_amount: number
  updated_at: string
}

// Create DTOs
export interface CreateTabData {
  name: string
  description: string
  default_currency: Currency
  people: TabPersonCreate[]
}

export interface PersonSplitCreate {
  person_id: number
  split_value?: number
}

export interface LineItemCreate {
  description: string
  value: number
  split_type: SplitType
  person_splits: PersonSplitCreate[]
}

export interface CreateBillData {
  tab_id: number
  description: string
  currency: Currency
  creator_id: number
  paid_by_id?: number
  date?: string
  line_items: LineItemCreate[]
}

export interface PersonSplitSubmit {
  person_id: number
  split_value: number | null
}

export interface LineItemSplitSubmit {
  line_item_id: number
  person_splits: PersonSplitSubmit[]
}

export interface SubmitSplitsData {
  bill_id: number
  split_mode: SplitMode
  line_item_splits: LineItemSplitSubmit[]
}

export interface UpdateBillData {
  description?: string
  currency?: Currency
  paid_by_id?: number
}

// Draft splits for UI state
export interface DraftSplits {
  [lineItemId: number]: {
    [personId: number]: number | null
  }
}
