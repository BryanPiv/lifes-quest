# Pocket Peak

Mobile-first personal finance quest prototype.

Features:
- Five elemental companions
- XP and four evolution milestones
- Food, gas, entertainment and misc quick-add
- Weekly spending allowance
- Savings goals
- Recurring bill calendar
- Mountain-top journey map
- Local browser persistence

Designed for iPhone testing through GitHub Pages.

## Functional checks

Run `npm install` and `npm test` (Node 20.19+). The suite uses isolated sample
budgets in jsdom; it never reads or changes a user's saved budget.

The 29 checks cover navigation, paycheck reserves, weekly/biweekly periods,
Quick Add, spending search/edit/delete, side income, savings goals/deposits,
retirement accounts and matching, recurring/extra transfers, projections,
loan planning, advice allocation, calendar totals and dates, local persistence,
backup recovery/download, onboarding, and referenced local assets.

These are DOM and calculation checks. They do not verify real iPhone layout,
native file downloads/import pickers, service-worker offline operation, or
browser-specific storage behavior.
