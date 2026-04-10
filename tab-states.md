# Plan: Tab Status — State Machine Redesign

## Context

`Tab.is_settled` (bool) tracks a single lifecycle state. Two new states are needed:
- **Archived**: soft-delete — tab hidden from default UI listing
- **Paid-up**: derived from all `Settlement.paid == True`

Tabs can be archived from any state. ARCHIVED is a terminal state. A first-class FSM on the model formalises valid transitions and prevents invalid state changes without any third-party dependency.

---

## State Diagram

```
OPEN ──close──► SETTLED ──mark_paid_up──► PAID_UP
 │                 │                         │
 └───────────── archive ───────────────────► ARCHIVED
                   │
          reopen_settlements
                   ▲
              PAID_UP ──┘
```

---

## Implementation

### 1. `TabStatus` enum + simple FSM on `Tab` model

**File: `backend/ninjatab/tabs/models.py`**

```python
class TabStatus(models.TextChoices):
    OPEN     = "open",     "Open"
    SETTLED  = "settled",  "Settled"   # closed for new bills; settlements visible
    PAID_UP  = "paid_up",  "Paid Up"   # all settlements marked paid
    ARCHIVED = "archived", "Archived"  # soft-deleted, hidden by default


class TabTransitionError(Exception):
    pass


class Tab(BaseModel):
    status = models.CharField(
        max_length=20,
        choices=TabStatus.choices,
        default=TabStatus.OPEN,
    )

    # Maps transition name → (valid source states, target state)
    _TRANSITIONS: ClassVar[dict[str, tuple[set[str], str]]] = {
        "close": (
            {TabStatus.OPEN},
            TabStatus.SETTLED,
        ),
        "mark_paid_up": (
            {TabStatus.SETTLED},
            TabStatus.PAID_UP,
        ),
        "reopen_settlements": (
            {TabStatus.PAID_UP},
            TabStatus.SETTLED,
        ),
        "archive": (
            {TabStatus.OPEN, TabStatus.SETTLED, TabStatus.PAID_UP},
            TabStatus.ARCHIVED,
        ),
    }

    def transition(self, name: str) -> None:
        valid_sources, target = self._TRANSITIONS[name]
        if self.status not in valid_sources:
            raise TabTransitionError(
                f"Cannot apply '{name}' from status '{self.status}'"
            )
        self.status = target
```

`transition()` mutates `status` in memory; the caller calls `tab.save()` after any other field updates (e.g. setting `settlement_currency_settled_total` before calling `tab.transition("close")`).

### 2. Migration

- Add `status = CharField(...)` defaulting to `"open"`
- Data migration: `Tab.objects.filter(is_settled=True).update(status="settled")`
- Remove `is_settled` field

### 3. Update API views (`backend/ninjatab/tabs/api.py`)

| Location | Current | New |
|---|---|---|
| `close_tab` (L307–309) | `tab.is_settled = True` | `tab.transition("close")` |
| `add_tab_person` (L449) | `is_settled=False` filter | `status=TabStatus.OPEN` |
| `submit_bill_splits` (L649) | `if bill.tab.is_settled` | `if bill.tab.status != TabStatus.OPEN` |
| `update_bill` (L714) | same | same |
| `delete_bill` (L774) | same | same |

Catch `TabTransitionError` in API views and return HTTP 400.

Settlement paid logic (add to the endpoint that toggles `Settlement.paid`):
- After toggle, check `tab.settlements.filter(paid=False).exists()`
- None unpaid and tab is SETTLED → `tab.transition("mark_paid_up"); tab.save()`
- One unpaid and tab is PAID_UP → `tab.transition("reopen_settlements"); tab.save()`

New archive endpoint:
- Calls `tab.transition("archive"); tab.save()`
- Default tab list: `Tab.objects.exclude(status=TabStatus.ARCHIVED)` (add `?include_archived=true` param)

### 4. Update Schemas (`backend/ninjatab/tabs/schemas.py`)

- Replace `is_settled: bool` → `status: str` in `TabSchema` and `TabListSchema`

### 5. Update Admin (`backend/ninjatab/tabs/admin.py`)

- Update `list_display` and `list_filter` to use `status`

---

## Files to Modify

- `backend/ninjatab/tabs/models.py` — `TabStatus`, `TabTransitionError`, `_TRANSITIONS`, `transition()`, remove `is_settled`
- `backend/ninjatab/tabs/migrations/` — new migration + data migration
- `backend/ninjatab/tabs/api.py` — ~5 `is_settled` sites, settlement paid logic, new archive endpoint
- `backend/ninjatab/tabs/schemas.py` — replace `is_settled` with `status`
- `backend/ninjatab/tabs/admin.py` — update display/filter

---

## Verification

1. `python manage.py migrate` — no errors
2. New tab → `status: "open"`
3. `POST /api/tabs/{id}/close` → `status: "settled"`; calling again → 400 TransitionError
4. Mark all settlements paid → `status: "paid_up"`
5. Un-mark one settlement → reverts to `"settled"`
6. Archive any tab (open/settled/paid_up) → excluded from default list
7. Attempt to edit a bill on a non-open tab → 400 unchanged
