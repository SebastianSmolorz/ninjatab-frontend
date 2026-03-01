// Enums matching backend
export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  CAD = 'CAD',
  TRY = 'TRY',
  PLN = 'PLN',
  CZK = 'CZK',
}

export enum SplitType {
  SHARES = 'shares',
  VALUE = 'value'
}

export enum BillStatus {
  OPEN = 'open',
  ARCHIVED = 'archived'
}

export enum SplitMode {
  EVEN = 'even',
  UNEVEN = 'uneven'
}

// User interfaces
export interface User {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
}

// Tab Person interfaces
export interface TabPerson {
  id: string
  name: string
  email: string | null
  user: User | null
  created_at: string
  updated_at: string
}

export interface TabPersonCreate {
  name: string
  email?: string
  user_id?: string
}

// Tab interfaces
export interface TabListItem {
  id: string
  name: string
  description: string
  default_currency: Currency
  is_settled: boolean
  bill_count: number
  people_count: number
  created_at: string
  updated_at: string
}

export interface PersonBalance {
  person_id: string
  person_name: string
  balance: number
}

export interface PersonSpendingTotal {
  person_id: string
  person_name: string
  total: number
}

export interface Settlement {
  id: string
  from_person: TabPerson
  to_person: TabPerson
  amount: number
  currency: Currency
  paid: boolean
  created_at: string
  updated_at: string
}

export interface Tab extends TabListItem {
  people: TabPerson[]
  settlements: Settlement[]
  balances: PersonBalance[]
  settlement_currency: Currency
  total_spent_gbp: number | null
  invite_code: string
}

export interface InviteTabInfo {
  tab_name: string
  people: Array<{ id: string; name: string }>
}

export interface SimplifyResult {
  settlements: Settlement[]
  message: string
}

// Line Item and Claim interfaces
export interface PersonLineItemClaim {
  id: string
  person_id: string
  person_name: string
  split_value: number | null
  calculated_amount: number | null
  has_claimed: boolean
  created_at: string
  updated_at: string
}

export interface LineItem {
  id: string
  description: string
  value: number
  split_type: SplitType
  person_claims: PersonLineItemClaim[]
  created_at: string
  updated_at: string
}

// Bill interfaces
export interface BillListItem {
  id: string
  description: string
  currency: Currency
  status: BillStatus
  date: string
  total_amount: number
  paid_by: TabPerson | null
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
  settlement_currency: Currency
  people: TabPersonCreate[]
}

export interface PersonSplitCreate {
  person_id: string
  split_value?: number
}

export interface LineItemCreate {
  description: string
  value: number
  split_type: SplitType
  person_splits: PersonSplitCreate[]
}

export interface CreateBillData {
  tab_id: string
  description: string
  currency: Currency
  creator_id: string
  paid_by_id?: string
  date?: string
  line_items: LineItemCreate[]
}

export interface PersonSplitSubmit {
  person_id: string
  split_value: number | null
}

export interface LineItemSplitSubmit {
  line_item_id: string
  person_splits: PersonSplitSubmit[]
}

export interface SubmitSplitsData {
  bill_id: string
  split_mode: SplitMode
  line_item_splits: LineItemSplitSubmit[]
}

export interface UpdateBillData {
  description?: string
  currency?: Currency
  paid_by_id?: string
}

// Draft splits for UI state — keyed by string UUIDs
export interface DraftSplits {
  [lineItemId: string]: {
    [personId: string]: number | null
  }
}

// Contact types
export interface Contact {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
}

// Auth types
export interface AuthUser {
  id: string
  email: string
  first_name: string
  last_name: string
}

export interface LoginResponse {
  user: AuthUser
}
