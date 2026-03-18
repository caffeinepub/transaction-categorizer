# Transaction Categorizer

## Current State
The app stores transactions and mapping rules in React state only (in-memory). Data is lost on page refresh. No persistence layer exists.

## Requested Changes (Diff)

### Add
- `src/frontend/src/lib/db.ts`: IndexedDB wrapper using the native browser API. Stores `transactions` and `mappingRules` in separate object stores within a single `fintrack-db` database.
- On app load, hydrate state from IndexedDB (falling back to sample data if empty).
- On every state change to transactions or rules, persist to IndexedDB automatically.
- A "Clear stored data" action that wipes IndexedDB and resets to sample data.

### Modify
- `App.tsx`: Replace `useState` initializers with async hydration from IndexedDB. Persist on every change to `transactions` and `rules`.

### Remove
- Nothing removed.

## Implementation Plan
1. Create `src/frontend/src/lib/db.ts` with open/read/write helpers for IndexedDB (`fintrack-db`, stores: `transactions`, `mappingRules`).
2. In `App.tsx`, on mount load persisted data from IndexedDB (or sample data if none). After every update to transactions or rules, write to IndexedDB.
3. Add a subtle sidebar button to clear stored data and reset to sample data.
