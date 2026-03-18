# Transaction Categorizer

## Current State
The app has a top-nav tab layout with a slim sidebar showing quick actions. The Dashboard renders KPI cards, a bar chart, a pie chart, and a category summary table.

## Requested Changes (Diff)

### Add
- Date range filter (start/end date pickers) in the sidebar that filter all dashboard data
- Net balance KPI card (income minus expenses)
- Larger, more prominent pie chart for expense breakdown as the hero chart on the dashboard

### Modify
- Sidebar: replace quick-action list with a proper fintech filter panel (date range + category filter + action buttons)
- Dashboard KPI strip: show Total Income, Total Expenses, Net Balance, and Categorization Rate
- Dashboard layout: pie chart promoted to primary position, bar chart secondary
- Visual style: darker navy sidebar, cleaner card styling to match professional fintech aesthetic

### Remove
- Separate income/expenses summary row (folded into KPI strip)

## Implementation Plan
1. Add `dateRange` state (`{ from: string; to: string }`) in App.tsx, pass down to Dashboard
2. Refactor sidebar in App.tsx to include date pickers and a category multi-select filter
3. Rewrite Dashboard.tsx to accept and apply `dateRange` + `categoryFilter` props, filter transactions before computing stats
4. Redesign KPI strip: Income, Expenses, Net Balance, Success Rate
5. Promote pie chart to full-width hero, move bar chart below it
6. Apply fintech color tokens: deep navy sidebar, gradient accents on KPI cards
