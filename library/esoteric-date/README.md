# @neverkin/esoteric-date

Custom ("esoteric") calendar date logic, extracted from Styx.

## Status: scaffold

Tooling is ready; the implementation has not been moved yet.

## Dropping in the code

1. Copy the **contents** of `app/styx-frontend/src/app/features/time/calendar/date/`
   into `src/` (keep the internal layout: `utils/`, the `*.spec.ts` files, etc.).
2. Replace the placeholder `export {}` in `src/index.ts` with the public surface,
   e.g. `export { EsotericDate } from './EsotericDate.js'`.

## External references to resolve ("minor path adjustments")

The dropped code imports the following from Styx. The `@api` / `@` aliases are pre-wired
in both `tsconfig.json` and `vitest.config.ts` to resolve under `src/`, so place these
dependencies accordingly (or repoint the aliases):

| Import in the code | Provides | Put it at |
|---|---|---|
| `@api/types/calendarTypes` | `CalendarUnit`, `CalendarDraftUnit` | `src/api/types/calendarTypes.ts` |
| `@api/types/worldTypes` | `WorldCalendar`, `WorldCalendarUnit` | `src/api/types/worldTypes.ts` |
| `@/api/mock/rheaModels.mock` (tests) | `mockCalendar`, `mockCalendarUnit`, `mockCalendarUnitChildRelation`, `mockCalendarUnitParentRelation` | `src/api/mock/rheaModels.mock.ts` |

Note: Styx's `rheaModels.mock.ts` is a monolith that pulls in unrelated internals
(uuid, AuthSlice, several api types). Bring over **only** the calendar mock helpers
above, not the whole file.

## Caveats

- `formatTimestampUnits.tsx` is named `.tsx` but contains no JSX; it compiles as-is
  (rename to `.ts` if you prefer).
- `tsconfig.json` uses `moduleResolution: Bundler`, so the Styx code builds without adding
  `.js` extensions to relative imports. If a **Node** service ever consumes this package,
  switch to `NodeNext` and add `.js` extensions (as `tiptap-schema` does).

## Commands

```
npm install      # node_modules + package-lock.json (the latter is required by the Docker build loop)
npm run build    # tsc → dist
npm test         # vitest (node env)
```
