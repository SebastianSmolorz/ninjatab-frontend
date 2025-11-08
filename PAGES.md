# Pages Documentation

This document describes the pages and UI flows in the NinjaTab frontend.

## Overview

The application currently has three main pages:
1. **Home** (`/`) - List of all tabs
2. **Create Tab** (`/tabs/create`) - Two-step tab creation flow
3. **Tab Detail** (`/tabs/:id`) - View a specific tab

## Page: Create Tab (`/tabs/create`)

A mobile-friendly, two-step form for creating new tabs with smooth animations.

### Features

✓ **Two-step process** - One decision at a time
✓ **Slide animations** - 0.3s swipe transitions between steps
✓ **Mobile-first design** - Optimized for mobile devices
✓ **Progress indicator** - Visual feedback on current step
✓ **Form validation** - Real-time validation with helpful feedback
✓ **Keyboard shortcuts** - Enter to continue/add

### Step 1: Tab Information

**What it asks:**
- Tab name (required)
- Description (optional)

**Interactions:**
- Press Enter to continue
- Back button returns to home
- Continue button disabled until name is entered

### Step 2: Add People

**What it asks:**
- Names of people involved (at least 1 required)

**Interactions:**
- Add multiple people
- Remove people (except the last one)
- Press Enter to add another person
- Back button returns to Step 1
- Create button disabled until at least one person with a name is added

### Animation Details

**Forward (Step 1 → Step 2):**
- Current step slides out to the left
- Next step slides in from the right
- Duration: 0.3s with ease-out timing

**Backward (Step 2 → Step 1):**
- Current step slides out to the right
- Previous step slides in from the left
- Duration: 0.3s with ease-out timing

### Code Example

```vue
<script setup lang="ts">
import { useTabStore } from '~/stores/tabs'
import { Currency } from '~/types'

const tabStore = useTabStore()

// Create a tab
const newTab = await tabStore.createTab({
  name: 'Weekend Trip',
  description: 'Expenses for our weekend getaway',
  default_currency: Currency.GBP,
  people: [
    { name: 'Alice' },
    { name: 'Bob' },
    { name: 'Charlie' }
  ]
})

// Navigate to the new tab
router.push(`/tabs/${newTab.id}`)
</script>
```

### Mobile Optimization

- Full-screen layout
- Large touch targets (buttons, inputs)
- Keyboard management (auto-focus on new inputs)
- Smooth transitions
- Fixed header and footer for easy navigation

## Page: Home (`/`)

List view of all tabs with quick access to create new tabs.

### Features

- Tab cards with summary information
- Empty state with call-to-action
- Loading and error states
- Quick navigation to tab details

### States

**Loading:**
- Shows spinner while fetching tabs

**Empty:**
- Welcome message
- "Create Your First Tab" button

**Loaded:**
- Grid of tab cards
- Each card shows:
  - Tab name
  - Description (if any)
  - Number of bills
  - Default currency
- Click card to view tab details

## Page: Tab Detail (`/tabs/:id`)

View a specific tab with all its details.

### Features

- Tab information
- List of people on the tab
- Bills section (placeholder for now)
- Back navigation

### Sections

**Tab Info:**
- Name
- Description
- Currency
- Bill count

**People:**
- Avatar with initial
- Name
- Email (if available)

**Bills:**
- Placeholder for bill list
- "Add Bill" button (future feature)

## Navigation Flow

```
Home (/)
  │
  ├─→ Create Tab (/tabs/create)
  │     │
  │     └─→ Tab Detail (/tabs/:id)
  │
  └─→ Tab Detail (/tabs/:id)
```

## Running the App

### Prerequisites

1. Backend server running:
```bash
cd backend
source .venv/bin/activate
python manage.py runserver
```

2. Node version 22.12.0 or later

### Start Development Server

```bash
cd frontend/ninjatab
source ~/.nvm/nvm.sh
nvm use 22.12.0
yarn dev
```

The app will be available at `http://localhost:3000`

## Testing the Create Tab Flow

1. Navigate to `http://localhost:3000`
2. Click "New Tab" button
3. **Step 1:**
   - Enter a tab name (e.g., "Weekend Trip")
   - Optionally add a description
   - Press Enter or click "Continue"
4. **Step 2:**
   - Enter names for people (at least 1)
   - Click "Add Another Person" to add more
   - Remove people with the trash icon
   - Click "Create Tab"
5. You'll be redirected to the new tab's detail page

## Design Principles

### One Decision at a Time

Following the user memory input, each step focuses on a single decision:
- Step 1: "What is this tab for?" → Name and description
- Step 2: "Who's involved?" → Add people

This reduces cognitive load and makes the process feel simple and straightforward.

### Mobile-First

- Touch-friendly button sizes (min 44x44px)
- Large form inputs
- Fixed header/footer for thumb access
- Smooth animations to maintain context
- No horizontal scrolling

### Accessibility

- Semantic HTML
- Keyboard navigation support
- Focus management
- Clear labels and placeholders
- Error messages

## Future Enhancements

- [ ] Email input for people (optional)
- [ ] Currency selection in Step 1
- [ ] Tab templates (pre-filled people)
- [ ] Photo/avatar upload for tab
- [ ] Undo delete person
- [ ] Duplicate person detection
- [ ] Save draft (local storage)
- [ ] Share tab link
