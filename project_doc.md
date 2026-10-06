# Chat Application Frontend: Complete Project Documentation (React)

> **Audience:** developers and AI agents building the web client for the ChatApp backend.
> **Stack:** React 19, TypeScript (strict), Vite, TanStack Query, Zustand, React Router, Tailwind CSS + shadcn/ui, STOMP over WebSocket.
> **Backend contract:** `PROJECT_DOCUMENTATION.md` (REST in section 8, real-time in section 7, roles in 5.4, Swagger in 19). **If this document and the backend document disagree, the backend document wins for API behavior; fix this document.**

---

## Table of Contents

1. Project Overview · 2. Technology Decisions · 3. Architecture · 4. Project Structure · 5. Clean Code Rules
2. Routing and Guards · 7. API Layer · 8. Authentication and Session · 9. Real-Time Layer · 10. Messaging Design
3. Screens and Features · 12. Forms · 13. Errors/Loading/Empty · 14. UI and Design System · 15. Accessibility
4. Security · 17. Performance · 18. Testing · 19. Tooling and Config · 20. Build/CI/CD/Observability
5. Roadmap (Basic → Medium → Advanced) · 22. Backend Agreements · 23. Definition of Done · 24. Agent Instructions · 25. Pitfalls · 26. Glossary

---

## 0. How to Use This Document

1. Read sections 1 to 5 (goals, stack, architecture, structure, clean-code rules) before writing any code.
2. For any feature, find its row in section 21 (roadmap) and its screen in section 11.
3. Follow the layer rules (3.2) and the file templates (section 5 and the code samples in sections 7 to 10).
4. Finish with the Definition of Done (section 23). Agents also follow section 24.

---

## 1. Project Overview

**Product:** a real-time web chat client with direct chats, group chats, media, presence, and a single-owner admin console.

**Users and roles** (from the backend):

- `USER`: chats, manages profile, groups, blocks, reports.
- `ADMIN`: exactly one person. Same chat features plus the admin console (`/app/admin/*`). The UI hides admin screens from non-admins, but **the server is the only real authority** (hiding is convenience, not security).

**Quality goals (priority order):**

1. **Correctness of chat state:** no duplicated, missing, or misordered messages on screen; honest delivery states.
2. **Security:** no token leaks, no XSS, safe handling of user content.
3. **Responsiveness:** instant-feeling UI (optimistic updates), smooth scrolling in long conversations.
4. **Maintainability:** feature modules with strict boundaries, typed API, tests.
5. **Accessibility:** WCAG 2.2 AA.
6. **Performance:** initial JS under 250 KB gzipped, route-level code splitting, LCP under 2.5 s on a mid-range phone.

**Non-goals (for now):** native mobile apps, voice/video, end-to-end encryption.

---

## 2. Technology Decisions

| Concern              | Choice                                                                                                         | Reason                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Language             | **TypeScript** (`strict`)                                                                                      | Compile-time safety, typed API                                                             |
| UI library           | **React 19**                                                                                                   | Standard, large ecosystem                                                                  |
| Build tool           | **Vite**                                                                                                       | Fast dev server, simple config                                                             |
| Routing              | **React Router** (data router)                                                                                 | Nested layouts, lazy routes, guards                                                        |
| Server state         | **TanStack Query v5**                                                                                          | Caching, infinite queries, retries, invalidation                                           |
| Client state         | **Zustand**                                                                                                    | Tiny, no boilerplate, usable outside React (needed by the HTTP client and realtime client) |
| Forms                | **React Hook Form + Zod**                                                                                      | Performance, schema validation shared with types                                           |
| HTTP                 | **Axios**                                                                                                      | Interceptors for token refresh                                                             |
| Real-time            | **@stomp/stompjs** (native WebSocket)                                                                          | Matches Spring STOMP backend                                                               |
| Styling              | **Tailwind CSS** + design tokens (CSS variables)                                                               | Consistency, fast iteration, dark mode                                                     |
| Components           | **shadcn/ui (Radix primitives)** copied into `shared/ui`                                                       | Accessible, owned code, no heavy runtime lib                                               |
| Icons                | `lucide-react`                                                                                                 | Light, tree-shakeable                                                                      |
| Long lists           | `@tanstack/react-virtual`                                                                                      | Smooth message lists                                                                       |
| Dates                | `date-fns`                                                                                                     | Tree-shakeable; server sends UTC ISO, UI formats in local time                             |
| API types            | **openapi-typescript** from the backend's `openapi.json`                                                       | Types never drift from backend                                                             |
| Local persistence    | `idb-keyval` (IndexedDB)                                                                                       | Outbox and drafts (not tokens)                                                             |
| Unit/component tests | **Vitest + React Testing Library + MSW**                                                                       | Fast, realistic                                                                            |
| E2E                  | **Playwright**                                                                                                 | Two-browser-context chat tests                                                             |
| Quality              | ESLint (flat config) + `typescript-eslint` + `jsx-a11y` + `react-hooks` + `eslint-plugin-boundaries`, Prettier | Enforce rules automatically                                                                |
| Package manager      | **pnpm**, Node LTS                                                                                             | Fast, strict                                                                               |
| Monitoring           | Sentry (errors), Web Vitals                                                                                    | Production visibility                                                                      |
| Component docs       | Storybook (Medium)                                                                                             | Review and test UI in isolation                                                            |

Use the latest stable versions at project start and pin them in the lockfile. Do not add libraries that duplicate these roles.

---

## 3. Architecture

### 3.1 Style: Feature-Based, Layered, "Server State Is Not Client State"

```
┌─────────────────────────────── Browser ────────────────────────────────┐
│                                                                          │
│  app/        providers, router, layouts, guards  (wires everything)      │
│    │                                                                     │
│  pages/      route-level screens (compose features, no business logic)   │
│    │                                                                     │
│  features/   auth · users · conversations · messages · presence ·        │
│    │         media · reports · admin · settings  (domain code)           │
│    │                                                                     │
│  shared/     ui · api client · realtime client · hooks · lib · config    │
│              (generic, knows nothing about features)                     │
└───────────────┬───────────────────────────────────────┬──────────────────┘
                │ REST (HTTPS, JSON)                     │ STOMP / WSS
        ┌───────▼────────────────────────────────────────▼───────┐
        │                 ChatApp Backend (Spring Boot)           │
        └─────────────────────────────────────────────────────────┘
```

### 3.2 Layer rules (enforced by ESLint boundaries)

Dependencies point **downward only**:

```
app  →  pages  →  features  →  shared
```

1. `shared` imports nothing from `features`, `pages`, or `app`.
2. `features/X` may import from `shared` only. **A feature never imports another feature's internals.** Cross-feature needs are solved by composing in `pages/` (or `app/`), or by importing another feature's **public API** (`features/Y/index.ts`) when it is a stable, intentional dependency (for example `messages` using `users` types). Avoid circular feature dependencies.
3. `pages` compose features and own route params. No fetching logic inline; use feature hooks.
4. `app` wires providers, routes, and guards. It is the only place that knows the whole app.
5. Every feature exposes a single public entry: `features/X/index.ts`. Deep imports (`features/messages/components/...`) from outside the feature are forbidden.

### 3.3 Inside a feature (consistent shape)

```
features/messages/
├── api/            typed endpoint functions (no React)        messages.api.ts
├── hooks/          React Query hooks + feature hooks          useMessages.ts, useSendMessage.ts
├── components/     feature UI (presentational + containers)   MessageList.tsx, Composer.tsx
├── realtime/       event handlers that update the cache       messageEvents.ts
├── lib/            pure functions (merge, group, format)      mergeMessages.ts  (unit-tested)
├── store/          Zustand slices (client-only state)         outbox.store.ts
├── schemas/        Zod schemas                                sendMessage.schema.ts
├── types.ts        feature types (re-export generated types)
├── constants.ts
└── index.ts        PUBLIC API of the feature
```

Not every feature needs every folder. Create folders only when needed.

### 3.4 State ownership (the most important rule for clean state)

| Kind of state                                | Where it lives                                                 | Examples                                                       |
| -------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| **Server state** (data owned by the backend) | **TanStack Query cache**                                       | users, conversations, messages, members, reports, admin lists  |
| **Realtime-updated server state**            | **Query cache**, updated by realtime handlers (`setQueryData`) | new messages, receipts, reactions, unread counts               |
| **Session**                                  | Zustand `session.store`                                        | access token (memory only), current user, auth status          |
| **Ephemeral cross-component client state**   | Zustand                                                        | realtime connection status, typing map, outbox, UI preferences |
| **URL state**                                | Router                                                         | active conversation (`/app/c/:id`), filters, tabs              |
| **Form state**                               | React Hook Form                                                | login, register, group creation                                |
| **Local component state**                    | `useState`                                                     | open/closed popovers, hover                                    |

**Never copy server data into Zustand or `useState`.** Read it from the query cache through hooks. This removes an entire class of stale-data bugs.

### 3.5 Data flow (read and write)

```
READ:   Component → useConversations() → TanStack Query → api/conversations.api → http client → Backend
WRITE:  Component → useSendMessage() → optimistic outbox entry → STOMP send → ack → cache update
LIVE:   Backend → STOMP topic → realtime handler → queryClient.setQueryData → components re-render
```

### 3.6 Key architectural decisions (ADR summary)

| #   | Decision                                                                                                           | Why                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| 1   | Feature-based folders, not type-based (`components/`, `hooks/` at root)                                            | Code that changes together lives together; scales to many features |
| 2   | TanStack Query owns server data; Zustand only for client state                                                     | One source of truth, built-in caching and retry                    |
| 3   | Realtime client is a framework-free class in `shared/realtime`, wired in `app/`                                    | Testable without React; swappable transport                        |
| 4   | Realtime events **write into the query cache**, they do not keep a parallel message store                          | No dual state, consistent with REST history                        |
| 5   | Unacked outgoing messages live in an **outbox store**, merged at read time, never inserted as fake server messages | Cache stays truthful; retries reuse `clientMessageId`              |
| 6   | Types generated from OpenAPI (`schema.d.ts`)                                                                       | Frontend breaks at compile time when the backend changes           |
| 7   | Access token in memory only                                                                                        | Reduces XSS blast radius (see section 16)                          |
| 8   | Route-level lazy loading; admin code in its own chunk                                                              | Normal users never download admin UI                               |

---

## 4. Project Structure (Full Tree)

```
chat-frontend/
├── public/                         static assets (favicon, manifest, robots.txt)
├── e2e/                            Playwright tests (multi-user chat flows)
├── src/
│   ├── main.tsx                    entry: renders <App/>
│   ├── app/
│   │   ├── App.tsx                 <AppProviders><RouterProvider/></AppProviders>
│   │   ├── providers/
│   │   │   ├── AppProviders.tsx    composes all providers in the right order
│   │   │   ├── QueryProvider.tsx   QueryClient + defaults + devtools (dev only)
│   │   │   ├── ThemeProvider.tsx   light/dark/system
│   │   │   ├── SessionBootstrap.tsx restores session on page load
│   │   │   └── RealtimeProvider.tsx connects/disconnects with auth, wires handlers
│   │   ├── router/
│   │   │   ├── routes.tsx          route table (lazy pages)
│   │   │   └── guards/             RequireAuth, RequireGuest, RequireRole, PasswordChangeGate
│   │   └── layouts/                AuthLayout, AppShell, AdminLayout, SettingsLayout
│   ├── pages/
│   │   ├── auth/                   LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage,
│   │   │                           VerifyEmailPage, ChangePasswordRequiredPage
│   │   ├── chat/                   ChatHomePage, ConversationPage, NewChatPage, NewGroupPage
│   │   ├── settings/               ProfilePage, SecurityPage, SessionsPage, BlockedUsersPage, AppearancePage
│   │   ├── admin/                  DashboardPage, UsersPage, UserDetailPage, ReportsPage,
│   │   │                           ReportDetailPage, ConversationsPage, AuditLogsPage, OwnershipPage
│   │   └── system/                 NotFoundPage, ForbiddenPage, ErrorPage
│   ├── features/
│   │   ├── auth/                   login/register/refresh/logout, session store, token refresh
│   │   ├── users/                  profile, search, public profile, sessions, blocks
│   │   ├── conversations/          list, direct/group creation, members, mute/pin/archive, unread
│   │   ├── messages/               history, composer, send/edit/delete, reactions, outbox, read marking
│   │   ├── presence/               presence + typing (hooks and indicators)
│   │   ├── media/                  presign → upload → confirm, previews, validation
│   │   ├── reports/                report dialog (user side)
│   │   ├── admin/                  stats, user moderation, reports queue, audit, ownership transfer
│   │   └── settings/               appearance, notifications preferences
│   ├── shared/
│   │   ├── api/
│   │   │   ├── http-client.ts      Axios instance + interceptors (auth header, single-flight refresh)
│   │   │   ├── api-error.ts        ApiException + ApiError type guard
│   │   │   ├── query-keys.ts       central query key factories
│   │   │   ├── pagination.ts       CursorPage<T> type and helpers
│   │   │   └── schema.d.ts         GENERATED by openapi-typescript (never edit by hand)
│   │   ├── realtime/
│   │   │   ├── realtime-client.ts  STOMP wrapper (connect, subscribe, send, status)
│   │   │   ├── realtime.types.ts   event envelope types
│   │   │   └── index.ts
│   │   ├── ui/                     Button, Input, Textarea, Dialog, DropdownMenu, Tabs, Toast,
│   │   │                           Avatar, Badge, Skeleton, Tooltip, Popover, ScrollArea (shadcn)
│   │   ├── components/             EmptyState, ErrorBoundary, PageSpinner, ConfirmDialog,
│   │   │                           ConnectionBanner, UserAvatar, RelativeTime
│   │   ├── hooks/                  useDebounce, useThrottle, useEventListener, useMediaQuery,
│   │   │                           useOnlineStatus, useDocumentVisibility
│   │   ├── lib/                    cn.ts, date.ts, id.ts (uuid), url.ts (safe links), storage.ts,
│   │   │                           broadcast.ts (multi-tab), jwt.ts (decode exp only)
│   │   ├── config/                 env.ts (validated env), constants.ts
│   │   └── styles/                 globals.css (tokens), tailwind layers
│   ├── test/
│   │   ├── setup.ts                Vitest setup (jest-dom, MSW server)
│   │   ├── msw/                    handlers.ts, server.ts
│   │   ├── factories/              userFactory, messageFactory, conversationFactory
│   │   └── utils/                  renderWithProviders.tsx, fakeRealtime.ts
│   └── vite-env.d.ts
├── .env.example
├── eslint.config.js
├── prettier.config.js
├── tailwind.config.ts
├── tsconfig.json                   strict, path alias "@/*" → "src/*"
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── Dockerfile / nginx.conf
├── package.json
└── README.md
```

**Path alias:** `@/` maps to `src/`. Use `@/shared/...`, `@/features/...`. Never use long relative paths like `../../../`.

---

## 5. Clean Code Rules (mandatory)

### 5.1 TypeScript

- `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`. **No `any`** (use `unknown` and narrow). No `// @ts-ignore` (use `@ts-expect-error` with a reason, rarely).
- Derive types from the generated API schema; do not retype backend DTOs by hand:
  ```ts
  import type { components } from '@/shared/api/schema';
  export type Message = components['schemas']['MessageResponse'];
  ```
- Model states with **discriminated unions**, not booleans:
  ```ts
  type OutboxStatus = { state: 'sending'; attempts: number } | { state: 'failed'; error: string };
  ```
- Prefer `type` for unions/props, `interface` only when extension is needed. Export types with `export type`.
- Use `as const` objects or string-literal unions instead of `enum`.

### 5.2 Components

- **Function components only.** One component per file. File name = component name (`MessageBubble.tsx`).
- **Small:** aim for under 150 lines; if bigger, split. A component does one job.
- **Separate concerns:** _presentational_ components get props and render; _container/hook_ code fetches and decides. Put logic in custom hooks, not JSX.
- **Props:** explicitly typed `type Props = {...}`; destructure in the signature; no spreading unknown props onto DOM nodes without intent; avoid more than ~6 props (group or compose).
- **Composition over configuration:** prefer `children` and slots to boolean-flag explosions (`<Dialog><Dialog.Header/>...`).
- **No business logic in JSX.** No nested ternaries; early-return or extract a sub-component.
- **Keys:** stable IDs (message `id` or `clientMessageId`), never array index for dynamic lists.
- **Memoization:** do not sprinkle `useMemo`/`useCallback`/`memo` by default. Add them only for measured problems (long lists, expensive derivations) or referential stability that matters (dependencies, memoized children).
- **Effects:** use `useEffect` only to synchronize with the outside world (subscriptions, DOM APIs). Do not use effects to derive state or to fetch data (use Query). Always return cleanup. Never lie in the dependency array.

### 5.3 Hooks

- Name `useXxx`. One responsibility each. Return a small, stable object.
- Data hooks wrap TanStack Query and hide keys, endpoints, and mapping from components.
- Hooks never import components. Feature hooks never import another feature's internals.

### 5.4 Naming and files

| Thing               | Convention                                                                                       | Example                  |
| ------------------- | ------------------------------------------------------------------------------------------------ | ------------------------ |
| Component file/name | `PascalCase.tsx`                                                                                 | `ConversationList.tsx`   |
| Hook                | `useCamelCase.ts`                                                                                | `useSendMessage.ts`      |
| Util/lib            | `kebab-case.ts` or `camelCase.ts` (pick one per project: **kebab-case** for non-component files) | `merge-messages.ts`      |
| API module          | `<noun>.api.ts`                                                                                  | `messages.api.ts`        |
| Store               | `<noun>.store.ts`                                                                                | `session.store.ts`       |
| Schema              | `<noun>.schema.ts`                                                                               | `register.schema.ts`     |
| Test                | next to file: `*.test.ts(x)`                                                                     | `merge-messages.test.ts` |
| Constants           | `UPPER_SNAKE_CASE`                                                                               | `MAX_MESSAGE_LENGTH`     |
| Booleans            | `is/has/can/should` prefix                                                                       | `isConnected`, `canEdit` |
| Event handlers      | `handleX` (defined), `onX` (props)                                                               | `onSend`, `handleSend`   |

### 5.5 Functions and logic

- Small pure functions in `lib/` for anything non-trivial (merging, grouping, formatting). They are unit-tested and framework-free.
- No magic numbers or strings: constants (`MAX_MESSAGE_LENGTH = 4000`, `TYPING_THROTTLE_MS = 2000`).
- No deep nesting (max 3 levels); use early returns.
- Immutable updates only. Never mutate props, state, or cache data.
- Errors are handled where they can be acted on; never swallow silently. No `console.log` in committed code (use a `logger` that is a no-op in production).

### 5.6 Imports

Order: external → `@/shared` → `@/features` → relative. Enforced by ESLint. No default exports for components or hooks (named exports only; easier refactoring and search). Exception: lazy-loaded route modules may use `lazy` with named export mapping.

### 5.7 Comments and docs

Comment **why**, not what. Public hooks and `lib` functions with non-obvious behavior get a short JSDoc. Keep a `README.md` per complex feature (messages, realtime) describing its flow.

### 5.8 Git and reviews

Small PRs, Conventional Commits (`feat(messages): dedupe live and history messages`). Every PR passes lint, type-check, tests, and the Definition of Done. Husky + lint-staged run Prettier and ESLint on staged files.

### 5.9 Anti-patterns to reject

- Copying query data into `useState`/Zustand.
- `useEffect` to fetch data or to derive state.
- Components over ~200 lines, or JSX with business rules.
- Prop drilling more than two levels (use composition or a feature context).
- Storing the access/refresh token in `localStorage`.
- `dangerouslySetInnerHTML` with message or user content (forbidden).
- Index as key for messages; sorting messages by `createdAt` instead of `seq`.
- Optimistic fake messages inserted into the server cache.
- Direct `fetch`/`axios` calls inside components.
- Hard-coded API URLs, role strings, or limits.
- Importing from another feature's internal paths.

---

## 6. Routing and Guards

### 6.1 Route table

| Path                                                                         | Page                                                     | Guard                            | Layout                    |
| ---------------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------- | ------------------------- |
| `/login`                                                                     | LoginPage                                                | RequireGuest                     | AuthLayout                |
| `/register`                                                                  | RegisterPage                                             | RequireGuest                     | AuthLayout                |
| `/forgot-password`                                                           | ForgotPasswordPage                                       | RequireGuest                     | AuthLayout                |
| `/reset-password?token=`                                                     | ResetPasswordPage                                        | public                           | AuthLayout                |
| `/verify-email?token=`                                                       | VerifyEmailPage                                          | public                           | AuthLayout                |
| `/change-password-required`                                                  | ChangePasswordRequiredPage                               | RequireAuth                      | AuthLayout                |
| `/app`                                                                       | ChatHomePage (empty state / conversation list on mobile) | RequireAuth + PasswordChangeGate | AppShell                  |
| `/app/c/:conversationId`                                                     | ConversationPage                                         | same                             | AppShell                  |
| `/app/new`                                                                   | NewChatPage (search user → open DM)                      | same                             | AppShell                  |
| `/app/new-group`                                                             | NewGroupPage                                             | same                             | AppShell                  |
| `/app/settings/profile` · `security` · `sessions` · `blocked` · `appearance` | settings pages                                           | same                             | AppShell + SettingsLayout |
| `/app/admin`                                                                 | DashboardPage                                            | same + **RequireRole ADMIN**     | AdminLayout (lazy chunk)  |
| `/app/admin/users` · `users/:id`                                             | UsersPage · UserDetailPage                               | ADMIN                            | AdminLayout               |
| `/app/admin/reports` · `reports/:id`                                         | ReportsPage · ReportDetailPage                           | ADMIN                            | AdminLayout               |
| `/app/admin/conversations`                                                   | ConversationsPage (metadata only)                        | ADMIN                            | AdminLayout               |
| `/app/admin/audit-logs`                                                      | AuditLogsPage                                            | ADMIN                            | AdminLayout               |
| `/app/admin/ownership`                                                       | OwnershipPage (danger zone)                              | ADMIN                            | AdminLayout               |
| `/403`, `/404`, `*`                                                          | ForbiddenPage, NotFoundPage                              | none                             | minimal                   |

### 6.2 Guards (UI convenience only; the server enforces)

```tsx
// app/router/guards/RequireAuth.tsx
export function RequireAuth() {
  const status = useSession((s) => s.status);
  const location = useLocation();
  if (status === 'unknown') return <PageSpinner />; // session bootstrap running
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

// app/router/guards/RequireRole.tsx
export function RequireRole({ role }: { role: 'ADMIN' | 'USER' }) {
  const userRole = useSession((s) => s.user?.role);
  return userRole === role ? <Outlet /> : <Navigate to="/403" replace />;
}

// app/router/guards/PasswordChangeGate.tsx  (bootstrapped admin must change password first)
export function PasswordChangeGate() {
  const must = useSession((s) => s.user?.mustChangePassword);
  return must ? <Navigate to="/change-password-required" replace /> : <Outlet />;
}
```

### 6.3 Rules

- All pages are `lazy()` loaded; the admin subtree is a separate chunk.
- Active conversation, filters, and tabs live **in the URL** so refresh and deep links work.
- After login, redirect to `state.from` or `/app`.
- Show the Admin link in the navigation only when `user.role === 'ADMIN'`. Treat any `403` from an admin endpoint as "not allowed" and navigate to `/403`.

---

## 7. API Layer

### 7.1 Principles

1. **Components never call Axios.** Flow: `component → hook → api module → http client`.
2. API modules are plain async functions with explicit input and output types (generated from OpenAPI).
3. One Axios instance (`shared/api/http-client.ts`), base URL `${VITE_API_BASE_URL}/api/v1`, timeout 15 s.
4. Every failure becomes an `ApiException` carrying the backend `ApiError` fields (`status`, `code`, `message`, `errors[]`, `traceId`).

### 7.2 Typed schema from the backend

```bash
# package.json scripts
"api:gen": "openapi-typescript $OPENAPI_URL -o src/shared/api/schema.d.ts"
# OPENAPI_URL = http://localhost:8080/v3/api-docs  (local)  or the openapi.json artifact published by backend CI
```

CI fails if `schema.d.ts` is out of date (regenerate and `git diff --exit-code`). Use `components['schemas'][...]` and `paths[...]` types in API modules.

### 7.3 Error model

```ts
// shared/api/api-error.ts
export type ApiErrorBody = {
  status: number;
  code: string;
  message: string;
  path?: string;
  traceId?: string;
  errors?: { field: string; message: string }[];
};

export class ApiException extends Error {
  constructor(public readonly body: ApiErrorBody) {
    super(body.message);
  }
  get status() {
    return this.body.status;
  }
  get code() {
    return this.body.code;
  }
  get fieldErrors() {
    return this.body.errors ?? [];
  }
}

export const isApiException = (e: unknown): e is ApiException => e instanceof ApiException;

export function toApiException(error: unknown): ApiException {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (error.response?.data?.code) return new ApiException(error.response.data);
    if (!error.response)
      return new ApiException({
        status: 0,
        code: 'NETWORK_ERROR',
        message: 'Cannot reach the server',
      });
  }
  return new ApiException({ status: 500, code: 'UNKNOWN', message: 'Unexpected error' });
}
```

Code-to-UX mapping (single table in `shared/api/error-messages.ts`):

| Code                             | UX                                                            |
| -------------------------------- | ------------------------------------------------------------- |
| `VALIDATION_ERROR`               | Map `errors[]` onto form fields (`setError`)                  |
| `UNAUTHORIZED` / `TOKEN_EXPIRED` | Silent refresh; if it fails, clear session and go to `/login` |
| `FORBIDDEN`                      | "You don't have access" panel or `/403`                       |
| `NOT_FOUND`                      | Not-found state for that resource                             |
| `CONFLICT`                       | Inline message (for example "Username already taken")         |
| `BUSINESS_RULE`                  | Toast with the server message                                 |
| `RATE_LIMITED`                   | Disable the action; show countdown from `Retry-After`         |
| `NETWORK_ERROR`                  | Offline banner; queries retry; sends go to the outbox         |
| `INTERNAL_ERROR`                 | Generic toast with the `traceId` copyable for support         |

### 7.4 HTTP client with single-flight token refresh

```ts
// shared/api/http-client.ts
export const http = axios.create({ baseURL: `${env.API_BASE_URL}/api/v1`, timeout: 15_000 });

http.interceptors.request.use((config) => {
  const token = useSession.getState().accessToken; // memory only
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string> | null = null; // ONE refresh at a time
const isAuthUrl = (url?: string) => !!url && /\/auth\/(login|register|refresh)/.test(url);

http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as
      (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retried &&
      !isAuthUrl(original.url)
    ) {
      original._retried = true;
      try {
        refreshing ??= authSession.refresh().finally(() => {
          refreshing = null;
        });
        const token = await refreshing;
        original.headers.Authorization = `Bearer ${token}`;
        return http(original); // replay the failed request once
      } catch {
        authSession.expire(); // clears session, redirects to /login
      }
    }
    throw toApiException(error);
  },
);
```

Many parallel requests that all get `401` trigger **one** refresh; the rest wait for it and replay.

### 7.5 API module example

```ts
// features/messages/api/messages.api.ts
import type { components } from '@/shared/api/schema';
type Message = components['schemas']['MessageResponse'];
type SendMessageRequest = components['schemas']['SendMessageRequest'];

export type MessagePage = { items: Message[]; hasMore: boolean; nextCursor: string | null };

export const messagesApi = {
  history: (
    conversationId: string,
    params: { beforeSeq?: number; afterSeq?: number; limit?: number },
  ) =>
    http
      .get<MessagePage>(`/conversations/${conversationId}/messages`, { params })
      .then((r) => r.data),

  send: (conversationId: string, body: SendMessageRequest) =>
    http.post<Message>(`/conversations/${conversationId}/messages`, body).then((r) => r.data),

  edit: (id: string, content: string) =>
    http.patch<Message>(`/messages/${id}`, { content }).then((r) => r.data),

  remove: (id: string) => http.delete<void>(`/messages/${id}`).then(() => undefined),
};
```

### 7.6 Query keys (central, hierarchical)

```ts
// shared/api/query-keys.ts
export const qk = {
  me: ['me'] as const,
  users: {
    search: (q: string) => ['users', 'search', q] as const,
    detail: (id: string) => ['users', id] as const,
    sessions: ['users', 'me', 'sessions'] as const,
    blocks: ['users', 'me', 'blocks'] as const,
    presence: (ids: string[]) => ['users', 'presence', [...ids].sort()] as const,
  },
  conversations: {
    all: ['conversations'] as const,
    list: () => ['conversations', 'list'] as const,
    detail: (id: string) => ['conversations', id] as const,
    members: (id: string) => ['conversations', id, 'members'] as const,
    unread: ['conversations', 'unread-count'] as const,
  },
  messages: {
    list: (conversationId: string) => ['messages', conversationId] as const,
  },
  admin: {
    stats: ['admin', 'stats'] as const,
    users: (filters: object) => ['admin', 'users', filters] as const,
    reports: (filters: object) => ['admin', 'reports', filters] as const,
    audit: (filters: object) => ['admin', 'audit', filters] as const,
  },
};
```

### 7.7 Query defaults

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: (count, err) =>
        !(isApiException(err) && [400, 401, 403, 404, 409, 422].includes(err.status)) && count < 2,
      refetchOnWindowFocus: true,
    },
    mutations: { retry: false },
  },
});
```

Chat data (messages, conversations) is kept fresh by realtime events; use a long `staleTime` there (`Infinity` for message lists, with explicit sync on reconnect, see 10.5) to avoid refetch storms.

### 7.8 Pagination (cursor)

Backend lists return `{ items, hasMore, nextCursor }`. Use `useInfiniteQuery` with `getNextPageParam: (p) => p.hasMore ? p.nextCursor : undefined`. Messages use `beforeSeq` (older) and `afterSeq` (sync); never offset pagination.

---

## 8. Authentication and Session

### 8.1 Token policy

| Token               | Where in the browser                                                                                                                                                                                                                           | Why                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Access JWT (15 min) | **Memory only** (`session.store`)                                                                                                                                                                                                              | Not readable by other tabs or persisted; lost on refresh and restored via the refresh token |
| Refresh token       | **Preferred: `HttpOnly; Secure; SameSite` cookie set by the backend.** Current backend contract returns it in the JSON body; until the backend sets a cookie, keep it behind one `tokenStorage` module (in-memory + `sessionStorage` fallback) | Cookie is not readable by JavaScript, so an XSS bug cannot steal it                         |

`localStorage` is **never** used for tokens. Because the refresh token is touched in exactly one module (`features/auth/lib/token-storage.ts`), switching to cookies is a one-file change. This is listed as a backend agreement in section 22.

### 8.2 Session store

```ts
// features/auth/store/session.store.ts
type SessionState = {
  status: 'unknown' | 'anonymous' | 'authenticated';
  accessToken: string | null;
  user: CurrentUser | null; // from GET /users/me (includes role, mustChangePassword)
  setSession: (token: string, user: CurrentUser) => void;
  setAccessToken: (token: string) => void;
  clear: () => void;
};
export const useSession = create<SessionState>()((set) => ({
  status: 'unknown',
  accessToken: null,
  user: null,
  setSession: (accessToken, user) => set({ status: 'authenticated', accessToken, user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clear: () => set({ status: 'anonymous', accessToken: null, user: null }),
}));
```

### 8.3 Flows

**Bootstrap (page load):** `SessionBootstrap` calls `authSession.refresh()` → on success fetch `/users/me` → `authenticated`; on failure → `anonymous`. While `unknown`, guards render a spinner (prevents a flash of the login page).

**Login:** `POST /auth/login` → store tokens → `GET /users/me` → navigate to `from` or `/app` (or to `/change-password-required` when `mustChangePassword`).

**Refresh (`authSession.refresh`)**: `POST /auth/refresh` with the refresh token. **Rotation:** the response contains a **new** refresh token; store it immediately. If the server answers `REFRESH_TOKEN_REUSED` or `INVALID_REFRESH_TOKEN`, call `expire()`.

**Proactive refresh:** decode the JWT `exp` (no verification, display only) and schedule a refresh about 60 s before expiry so the WebSocket reconnect uses a fresh token.

**Logout:** call `POST /auth/logout` (ignore failure) → disconnect realtime → `queryClient.clear()` → clear outbox and drafts of this user → `session.clear()` → broadcast `logout` to other tabs → navigate `/login`.

**Multi-tab:** `BroadcastChannel('chat-auth')` sends `logout` so all tabs sign out together.

**Forced sign-out by the server:** on ban/disable the backend closes the socket and revokes tokens. The next REST call fails refresh → `expire()`. The `/user/queue/notifications` event `ACCOUNT_STATUS_CHANGED` (proposed, section 22) lets the UI show "Your account was disabled" immediately.

### 8.4 Admin UI rules

- `role` comes from `/users/me`; never from the JWT in the UI and never from user input.
- Admin screens are lazy chunks behind `RequireRole`. Dangerous actions (ban, delete, ownership transfer) use `ConfirmDialog`; ownership transfer also requires typing the admin password and the target's username.

---

## 9. Real-Time Layer (STOMP over WebSocket)

### 9.1 Design

- A **framework-free** class `RealtimeClient` in `shared/realtime`. It knows STOMP, reconnection, and subscriptions, and **nothing about chat**.
- Features register handlers; `app/providers/RealtimeProvider` creates the client when the user is authenticated and destroys it on logout.
- Components never touch the socket. They use hooks (`useSendMessage`, `useTyping`, `usePresence`).
- The client sits behind an interface (`RealtimeGateway`) so tests inject a fake.

```ts
// shared/realtime/realtime.types.ts
export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'closed';

export interface RealtimeGateway {
  connect(): void;
  disconnect(): void;
  status(): ConnectionStatus;
  onStatusChange(cb: (s: ConnectionStatus) => void): () => void;
  subscribe<T>(destination: string, handler: (payload: T) => void): () => void; // returns unsubscribe
  publish(destination: string, body: unknown): void;
}
```

### 9.2 Implementation sketch

```ts
// shared/realtime/realtime-client.ts
import { Client, type StompSubscription } from '@stomp/stompjs';

export class RealtimeClient implements RealtimeGateway {
  private client: Client;
  private state: ConnectionStatus = 'idle';
  private listeners = new Set<(s: ConnectionStatus) => void>();
  private subs = new Map<string, { handlers: Set<(p: any) => void>; stomp?: StompSubscription }>();

  constructor(private deps: { url: string; getFreshToken: () => Promise<string> }) {
    this.client = new Client({
      brokerURL: deps.url, // wss://api.example.com/ws
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      reconnectDelay: 3_000, // stompjs retries; beforeConnect runs each time
      beforeConnect: async () => {
        this.client.connectHeaders = { Authorization: `Bearer ${await deps.getFreshToken()}` };
        this.setStatus(
          this.state === 'connected' || this.state === 'reconnecting'
            ? 'reconnecting'
            : 'connecting',
        );
      },
      onConnect: () => {
        this.setStatus('connected');
        this.resubscribeAll();
      },
      onWebSocketClose: () => {
        if (this.state !== 'closed') this.setStatus('reconnecting');
      },
      onStompError: (frame) => logger.warn('stomp_error', frame.headers['message']),
    });
  }

  connect() {
    this.client.activate();
  }
  disconnect() {
    this.setStatus('closed');
    void this.client.deactivate();
  }

  subscribe<T>(dest: string, handler: (p: T) => void) {
    const entry = this.subs.get(dest) ?? { handlers: new Set() };
    entry.handlers.add(handler);
    this.subs.set(dest, entry);
    if (this.client.connected && !entry.stomp) this.attach(dest, entry);
    return () => {
      entry.handlers.delete(handler);
      if (entry.handlers.size === 0) {
        entry.stomp?.unsubscribe();
        this.subs.delete(dest);
      }
    };
  }

  publish(destination: string, body: unknown) {
    this.client.publish({ destination, body: JSON.stringify(body) }); // throws if not connected → caller handles
  }

  private attach(
    dest: string,
    entry: { handlers: Set<(p: any) => void>; stomp?: StompSubscription },
  ) {
    entry.stomp = this.client.subscribe(dest, (msg) => {
      const payload = JSON.parse(msg.body);
      entry.handlers.forEach((h) => h(payload));
    });
  }
  private resubscribeAll() {
    this.subs.forEach((entry, dest) => {
      entry.stomp = undefined;
      this.attach(dest, entry);
    });
  }
  private setStatus(s: ConnectionStatus) {
    this.state = s;
    this.listeners.forEach((l) => l(s));
  }
  status() {
    return this.state;
  }
  onStatusChange(cb: (s: ConnectionStatus) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
}
```

`getFreshToken` returns the current access token, refreshing first if it expires within 30 s. This is why a reconnect after token expiry just works.

### 9.3 Destinations and event envelopes (frontend view of the backend contract)

| Direction | Destination                 | Payload                                                                                              |
| --------- | --------------------------- | ---------------------------------------------------------------------------------------------------- |
| publish   | `/app/chat.send`            | `{ conversationId, clientMessageId, content, replyToId? }`                                           |
| publish   | `/app/chat.typing`          | `{ conversationId, typing: boolean }`                                                                |
| publish   | `/app/chat.read`            | `{ conversationId, upToSeq }`                                                                        |
| subscribe | `/user/queue/acks`          | `{ clientMessageId, id, seq, createdAt, status: 'SENT' }`                                            |
| subscribe | `/user/queue/errors`        | `ApiErrorBody` (with `clientMessageId` when it relates to a send)                                    |
| subscribe | `/user/queue/notifications` | `{ type, payload }` (for example `CONVERSATION_ADDED`, `PRESENCE_CHANGED`, `ACCOUNT_STATUS_CHANGED`) |
| subscribe | `/topic/conversations.{id}` | `ConversationEvent` envelope below                                                                   |

```ts
export type ConversationEvent =
  | { type: 'MESSAGE_CREATED'; payload: Message }
  | { type: 'MESSAGE_EDITED'; payload: Message }
  | {
      type: 'MESSAGE_DELETED';
      payload: { id: string; conversationId: string; seq: number; removedByAdmin?: boolean };
    }
  | {
      type: 'REACTION_CHANGED';
      payload: { messageId: string; userId: string; emoji: string; added: boolean };
    }
  | { type: 'TYPING'; payload: { conversationId: string; userId: string; typing: boolean } }
  | { type: 'READ_RECEIPT'; payload: { conversationId: string; userId: string; upToSeq: number } }
  | { type: 'MEMBERS_CHANGED'; payload: { conversationId: string } }
  | { type: 'CONVERSATION_UPDATED'; payload: { conversationId: string } };
```

> The envelope is the frontend's expectation. It must be added to the backend document (section 7.1) and implemented there (see section 22).

### 9.4 Subscription strategy

- **Active conversation:** always subscribed while its page is open.
- **Conversation list:** subscribe to topics of the conversations in the loaded list (cap at the 50 most recent) so unread counters and last-message previews update live. Older conversations refresh when opened or when the list refetches.
- **User queues** (`acks`, `errors`, `notifications`): subscribed once after connect.
- When `CONVERSATION_ADDED` arrives, invalidate the list and subscribe to the new topic.
- At larger scale the backend should offer one per-user event queue (see section 22) so the client holds one subscription instead of many.

### 9.5 Wiring (app layer)

```tsx
// app/providers/RealtimeProvider.tsx
export function RealtimeProvider({ children }: PropsWithChildren) {
  const status = useSession((s) => s.status);
  const qc = useQueryClient();
  const [gateway, setGateway] = useState<RealtimeGateway | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const client = new RealtimeClient({
      url: env.WS_URL,
      getFreshToken: authSession.getFreshAccessToken,
    });
    client.connect();
    setGateway(client);
    const stop = registerRealtimeHandlers(client, qc); // each feature contributes handlers
    return () => {
      stop();
      client.disconnect();
      setGateway(null);
    };
  }, [status, qc]);

  return <RealtimeContext.Provider value={gateway}>{children}</RealtimeContext.Provider>;
}
```

`registerRealtimeHandlers` (in `app/`) calls each feature's `registerXxxHandlers(gateway, queryClient)` and returns a combined unsubscribe.

### 9.6 Connection UX

`ConnectionBanner` shows nothing when `connected`, "Connecting..." on first connect, and "Reconnecting... messages will be sent when you're back" when `reconnecting`. On every transition **to `connected`** run the sync routine (10.5).

---

## 10. Messaging Design (the core of the frontend)

### 10.1 Types

```ts
type ServerMessage = components['schemas']['MessageResponse']; // has id, seq, createdAt...

type OutboxItem = {
  clientMessageId: string; // generated with crypto.randomUUID()
  conversationId: string;
  content: string;
  replyToId?: string;
  createdAtLocal: number; // for ordering pending bubbles only
  status: { state: 'sending'; attempts: number } | { state: 'failed'; error: string };
};

// What the list renders:
type RenderableMessage =
  { kind: 'server'; message: ServerMessage } | { kind: 'pending'; item: OutboxItem };
```

### 10.2 Message list cache shape

The query `qk.messages.list(conversationId)` is an **infinite query** of `MessagePage` (page 0 = newest, descending `seq`, as returned by the backend). Pure helpers in `features/messages/lib/` (unit-tested) are the only code allowed to change it:

```ts
upsertMessage(data, message); // insert or replace by id; keeps seq order; ignores duplicates
removeMessage(data, id); // mark deleted (soft) or drop
mergeAfterSync(data, items); // append items fetched with afterSeq
highestSeq(data); // number | 0
```

Rules: **identity is `id` (and `seq`).** Ordering is by **`seq`**, never `createdAt`. Applying the same event twice must be a no-op (idempotent), because live events and history can overlap.

### 10.3 Sending (optimistic, idempotent, ack-driven)

```
User presses Enter
  1. validate (non-empty after trim, ≤ 4000 chars)
  2. create OutboxItem {clientMessageId = uuid, status: sending} → persist (IndexedDB)
  3. UI immediately shows a pending bubble ("sending" clock icon), merged from outbox at read time
  4. publish /app/chat.send   (if not connected → go to step 6 directly)
  5. wait for ack on /user/queue/acks matching clientMessageId  (timeout 8 s)
       ack → remove OutboxItem; upsert the server message into the cache; bubble becomes "sent"
  6. timeout or not connected → POST /conversations/{id}/messages with the SAME clientMessageId
       success → same as ack;   network failure → keep sending, retry with backoff (outbox is durable)
       4xx (403/422/429) → status failed with reason; user can retry or delete
  7. the broadcast echo of our own message arrives on the topic → upsertMessage dedupes by id
```

Because the backend is idempotent on `(conversationId, senderId, clientMessageId)`, **retrying can never create duplicates**. Always reuse the same `clientMessageId`.

```ts
// features/messages/hooks/useSendMessage.ts  (shape)
export function useSendMessage(conversationId: string) {
  const gateway = useRealtime();
  const outbox = useOutbox();
  return useCallback(
    (content: string, replyToId?: string) => {
      const item = outbox.enqueue({ conversationId, content, replyToId }); // generates clientMessageId
      outboxSender.dispatch(item, gateway); // publish or REST fallback + retry policy
    },
    [conversationId, gateway, outbox],
  );
}
```

The retry policy (`outboxSender`) is a plain module: exponential backoff (1 s, 2 s, 4 s, max 30 s), pauses when offline, resumes on `online` and on socket `connected`, gives up only on non-retryable 4xx.

### 10.4 Receiving

```ts
// features/messages/realtime/message-events.ts
export function registerMessageHandlers(gw: RealtimeGateway, qc: QueryClient) {
  const offAcks = gw.subscribe<SendAck>('/user/queue/acks', (ack) => outbox.resolve(ack, qc));
  const offErrors = gw.subscribe<ApiErrorBody & { clientMessageId?: string }>(
    '/user/queue/errors',
    (err) => err.clientMessageId && outbox.fail(err.clientMessageId, err),
  );
  return () => {
    offAcks();
    offErrors();
  };
}

export function applyConversationEvent(
  qc: QueryClient,
  activeConversationId: string | null,
  me: string,
  ev: ConversationEvent,
) {
  switch (ev.type) {
    case 'MESSAGE_CREATED': {
      const m = ev.payload;
      const before = highestSeqFromCache(qc, m.conversationId);
      if (before && m.seq > before + 1) {
        void syncConversation(qc, m.conversationId);
        return;
      } // GAP → fetch afterSeq
      patchMessages(qc, m.conversationId, (d) => upsertMessage(d, m));
      patchConversationList(qc, m.conversationId, (c) => ({
        ...c,
        lastMessage: m,
        unreadCount:
          m.senderId === me || m.conversationId === activeConversationId
            ? c.unreadCount
            : c.unreadCount + 1,
      }));
      break;
    }
    case 'MESSAGE_EDITED':
      patchMessages(qc, ev.payload.conversationId, (d) => upsertMessage(d, ev.payload));
      break;
    case 'MESSAGE_DELETED':
      patchMessages(qc, ev.payload.conversationId, (d) => removeMessage(d, ev.payload.id));
      break;
    case 'TYPING':
      typingStore.set(ev.payload);
      break;
    case 'READ_RECEIPT':
      patchReceipts(qc, ev.payload);
      break;
    case 'MEMBERS_CHANGED':
    case 'CONVERSATION_UPDATED':
      void qc.invalidateQueries({ queryKey: qk.conversations.detail(ev.payload.conversationId) });
      break;
    case 'REACTION_CHANGED':
      patchReactions(qc, ev.payload);
      break;
  }
}
```

### 10.5 Reconnect and gap sync (never lose a message)

On every transition to `connected` (and when the tab becomes visible after a long time):

1. Refetch the conversation list (cheap; refreshes last messages and unread counts).
2. For the **active** conversation and each conversation already in the message cache: `GET /conversations/{id}/messages?afterSeq={highestSeq}&limit=100`, repeating until the page is empty, merging with `mergeAfterSync`.
3. Flush the outbox (retry pending items).
4. Resubscribe topics (handled by `RealtimeClient.resubscribeAll`).

**Gap detection:** if a live `MESSAGE_CREATED` arrives with `seq > highestSeq + 1`, do not insert it; run the sync for that conversation (it will fetch the missing and the new one in order).

### 10.6 History and scrolling

- `useInfiniteQuery` loads older pages with `beforeSeq = oldest seq in cache`; trigger when the top sentinel is near the viewport.
- The list is **virtualized** (`@tanstack/react-virtual`) once a conversation has more than ~100 rendered items.
- **Scroll anchoring:** when older pages are prepended, preserve scroll position (adjust `scrollTop` by the added height).
- **Stick-to-bottom:** if the user is within ~80 px of the bottom, new messages auto-scroll. Otherwise show a "New messages" pill with the count; clicking it scrolls down.
- Group consecutive messages from the same sender within 5 minutes; show date separators in the user's local timezone.

### 10.7 Read receipts and unread counts

- A message is "read" when it is visible in the viewport, the tab is focused/visible, and the conversation is active.
- Compute the highest visible `seq`, **debounce 500 ms**, and publish `chat.read` only if it is greater than the last value sent (`last_read_seq` only moves forward).
- Optimistically set `unreadCount = 0` for that conversation in the list cache; `READ_RECEIPT` events from others update the "seen" markers.
- Show "Seen" under the last own message when `min(lastReadSeq of other members) >= message.seq` (direct chat: the other person; groups: show a count or avatars).

### 10.8 Typing indicator

- Sender: on input change, publish `typing: true` at most once every **2 s** (`TYPING_THROTTLE_MS`); publish `typing: false` on send, blur, or after 4 s of inactivity.
- Receiver: keep `typingStore[conversationId][userId] = expiresAt (now + 5 s)`; a single interval clears expired entries. Never persist typing.

### 10.9 Edit, delete, reply, reactions (Medium)

- **Edit:** allowed for own messages within 15 minutes (server rule; the UI hides the action after the window but handles `422`). Optimistic update with rollback on error. Show "(edited)".
- **Delete:** soft delete; render "This message was deleted" (or "Removed by moderator" when `removedByAdmin`).
- **Reply:** composer shows a quoted preview; send `replyToId`; clicking the quote scrolls to the original (fetch around it if not loaded).
- **Reactions:** optimistic toggle; the server event reconciles.

### 10.10 Drafts

Per-conversation draft text is saved to IndexedDB (debounced), restored when reopening the conversation, and cleared on send and on logout.

### 10.11 Content rendering (security-critical)

- Message `content` is **plain text**. Render it as React text nodes. **Never** `dangerouslySetInnerHTML`.
- Linkify with a small safe util: only `http`/`https` URLs, rendered as `<a target="_blank" rel="noopener noreferrer nofollow">`.
- Preserve line breaks with CSS (`white-space: pre-wrap`), not HTML injection. Emoji are plain Unicode.

---

## 11. Screens and Feature Inventory

### 11.1 Layout (responsive)

```
Desktop (≥1024px)                                   Mobile (<768px): one pane at a time
┌───────────┬────────────────────────┬─────────┐    /app            → conversation list
│ Sidebar   │ Conversation           │ Details │    /app/c/:id      → chat (back arrow to list)
│ search    │ header (name, presence)│ (opt.)  │    bottom nav: Chats · New · Settings (· Admin)
│ list      │ message list           │ members │
│ unread    │ typing · composer      │ media   │    Tablet: sidebar + chat, details as a drawer
└───────────┴────────────────────────┴─────────┘
```

### 11.2 Feature map (screens → components → hooks → endpoints)

| Feature           | Key components                                                                                                                                                                                         | Hooks                                                                                                                                                                                                                 | Backend endpoints                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **auth**          | LoginForm, RegisterForm, ForgotPasswordForm, ResetPasswordForm, VerifyEmailStatus, ChangePasswordForm                                                                                                  | useLogin, useRegister, useLogout, useChangePassword, useForgotPassword, useResetPassword                                                                                                                              | `/auth/*`                                                                 |
| **users**         | ProfileForm, AvatarUploader, UserSearchBox, UserCard, SessionsTable, BlockedUsersList                                                                                                                  | useMe, useUpdateProfile, useUserSearch, useUser, useSessions, useRevokeSession, useBlocks, useBlockUser                                                                                                               | `/users/*`                                                                |
| **conversations** | ConversationList, ConversationListItem, NewChatDialog, NewGroupForm, ConversationHeader, MembersPanel, MemberRow, ConversationMenu                                                                     | useConversations, useConversation, useCreateDirect, useCreateGroup, useMembers, useAddMembers, useRemoveMember, useChangeRole, useMute, usePin, useArchive, useUnreadTotal                                            | `/conversations/*`                                                        |
| **messages**      | MessageList, MessageBubble, MessageGroup, DateSeparator, Composer, ReplyPreview, ReactionBar, MessageActions, NewMessagesPill, SeenMarker                                                              | useMessages, useSendMessage, useEditMessage, useDeleteMessage, useReactions, useMarkRead, useConversationSync                                                                                                         | `/conversations/{id}/messages`, `/messages/*`, `/conversations/{id}/read` |
| **presence**      | PresenceDot, TypingIndicator, LastSeen                                                                                                                                                                 | usePresence(ids), useTyping(conversationId)                                                                                                                                                                           | `/users/presence`, STOMP                                                  |
| **media**         | AttachButton, DropZone, UploadProgress, ImagePreview, FileChip, Lightbox                                                                                                                               | useUploadMedia (presign → PUT to storage → confirm), useConversationMedia                                                                                                                                             | `/media/presign`, `/media/confirm`, `/conversations/{id}/media`           |
| **reports**       | ReportDialog                                                                                                                                                                                           | useReportMessage                                                                                                                                                                                                      | `/messages/{id}/report`                                                   |
| **admin**         | StatsCards, UsersTable, UserDetailPanel, StatusDialog (reason required), ReportsTable, ReportReview (shows reported message), ConversationsTable (metadata only), AuditLogTable, OwnershipTransferForm | useAdminStats, useAdminUsers, useChangeUserStatus, useForceLogout, useDeleteUser, useAdminReports, useResolveReport, useRemoveMessage, useAdminConversations, useLockConversation, useAuditLogs, useTransferOwnership | `/admin/*`                                                                |
| **settings**      | ThemeToggle, NotificationPrefs                                                                                                                                                                         | useTheme                                                                                                                                                                                                              | local                                                                     |

### 11.3 Admin console rules

- Shown only for `ADMIN`. Tables use cursor pagination and server-side filters in the URL.
- Status changes require a **reason** (the backend stores it in the audit log). The admin's own row has all destructive actions disabled (the server also rejects them).
- The console never shows private messages. The report review screen shows only the reported message, with a note that the access is audit-logged.
- **Ownership transfer** is a danger-zone page: pick the target user, type the target's username and the admin password, confirm. On success the current user becomes `USER`: clear the session and ask to log in again.

### 11.4 Upload flow (media)

1. Client-side validation: allowed MIME types, max size (match backend limits from config), image dimensions optional.
2. `POST /media/presign` → `{ uploadUrl, storageKey }`.
3. `PUT` the file directly to `uploadUrl` with progress (`XMLHttpRequest` or Axios `onUploadProgress`; use a bare client **without** the auth header).
4. `POST /media/confirm` → attachment id → included in the message send.
5. Show thumbnail and progress inside the pending bubble; cancel aborts the upload.

---

## 12. Forms and Validation

- **React Hook Form + Zod** everywhere. One Zod schema per form, in `features/X/schemas/`. The schema mirrors backend rules (lengths, formats) but **the server stays the authority**: always handle `VALIDATION_ERROR` responses.
- Validate on blur, then on change after the first error. Disable submit while submitting; show inline errors with `aria-describedby`.

```ts
// features/auth/schemas/register.schema.ts
export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'At least 3 characters')
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, underscore'),
  email: z.string().trim().email().max(255),
  displayName: z.string().trim().min(1).max(60),
  password: z.string().min(8, 'At least 8 characters').max(128),
});
export type RegisterInput = z.infer<typeof registerSchema>;
```

```tsx
// map backend field errors onto the form (reusable helper)
export function applyApiErrors<T extends FieldValues>(err: unknown, setError: UseFormSetError<T>) {
  if (!isApiException(err)) return false;
  err.fieldErrors.forEach((f) => setError(f.field as Path<T>, { message: f.message }));
  return err.fieldErrors.length > 0;
}
```

- Never put a `role` field in any form or request. Never trust client validation for security.
- Message composer: trim; reject empty; max 4000 chars with a counter appearing near the limit; Enter sends, Shift+Enter inserts a newline; IME composition (`isComposing`) must not send.

---

## 13. Errors, Loading, and Empty States

Every data-driven view handles **four states** explicitly: loading, empty, error, success.

| State   | Pattern                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------- |
| Loading | Skeletons shaped like the final content (conversation rows, message bubbles). Spinner only for full-page bootstrap. |
| Empty   | `EmptyState` with icon, one sentence, and a primary action ("Start a conversation").                                |
| Error   | Inline `ErrorState` with a Retry button; shows `traceId` in a copyable detail.                                      |
| Offline | `ConnectionBanner`; sends are queued, not lost.                                                                     |

- **Error boundaries:** one at the app root, one per route (React Router `errorElement`), one around the message list. Report to Sentry with `traceId` and route; never include message content.
- **Toasts** for transient results (saved, copied, action failed). **Dialogs** for confirmations. **Inline** messages for form errors.
- Mutations show pending state on the triggering control. Destructive actions confirm first.
- A `429` disables the control and shows a countdown from `Retry-After`.

---

## 14. UI, Design System, and Responsiveness

### 14.1 Design tokens (CSS variables, light and dark)

```css
/* shared/styles/globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222 20% 12%;
  --muted: 220 14% 96%;
  --muted-foreground: 220 9% 40%;
  --primary: 221 83% 53%;
  --primary-foreground: 0 0% 100%;
  --destructive: 0 72% 51%;
  --border: 220 13% 90%;
  --ring: 221 83% 53%;
  --bubble-own: var(--primary);
  --bubble-other: 220 14% 94%;
  --radius: 0.75rem;
}
.dark {
  --background: 224 20% 8%;
  --foreground: 210 20% 96%;
  --muted: 223 16% 14%;
  --muted-foreground: 217 10% 65%;
  --border: 223 14% 20%;
  --bubble-other: 223 16% 16%;
}
```

Tailwind maps these to semantic classes (`bg-background`, `text-foreground`, `bg-primary`). **Never hard-code colors in components.** Theme: `light | dark | system`, stored in `localStorage` (a preference, not a secret), applied via the `dark` class on `<html>` before first paint to avoid flashes.

### 14.2 Component rules

- Build from `shared/ui` primitives (Radix-based). Add a primitive there before using a one-off style.
- Variants with `class-variance-authority`; class merging with `cn()` (`clsx` + `tailwind-merge`).
- Spacing scale from Tailwind only; no arbitrary pixel values without a reason.
- Icons from `lucide-react` with `aria-hidden` when decorative.
- Motion is subtle (150 to 200 ms) and disabled under `prefers-reduced-motion`.

### 14.3 Chat-specific UI rules

- Own messages right-aligned with `bubble-own`; others left with avatar (groups) and sender name (groups only).
- Message status icons: sending (clock), sent (check), seen (double check or avatar), failed (red icon with Retry / Delete).
- Long words and URLs wrap (`overflow-wrap: anywhere`). Images reserve space using known `width/height` to prevent layout shift.
- Timestamps: relative in the list ("2 min", "Yesterday"), absolute on hover/long-press, always in the user's local timezone.

### 14.4 Responsive rules

Mobile first. Breakpoints: `sm 640`, `md 768`, `lg 1024`, `xl 1280`. Below `md` the conversation list and chat are separate routes. Use `100dvh` (not `100vh`) for the app shell and keep the composer above the on-screen keyboard (`visualViewport` handling). Touch targets at least 44 px.

### 14.5 Internationalization

Add `react-i18next` (Medium): all user-facing strings via `t('key')` from the start of Medium work; English first. Dates and numbers with `Intl`/`date-fns` locale. Plan for RTL by using logical properties (`ms-`, `me-`, `ps-`, `pe-`) instead of left/right.

---

## 15. Accessibility (WCAG 2.2 AA)

- Semantic HTML first (`button`, `nav`, `main`, `form`, `ul`). Radix primitives handle dialogs, menus, tooltips, focus traps.
- **Message list:** `role="log"` with `aria-live="polite"` so new messages are announced without stealing focus; each bubble is an `article`/`li` with an accessible name (sender, time).
- **Keyboard:** full operation without a mouse. `Tab` order follows visual order; `Esc` closes dialogs and reply mode; `Ctrl/Cmd+K` focuses user search; visible focus ring always.
- **Forms:** every input has a `<label>`; errors linked via `aria-describedby` and announced.
- **Color and contrast:** at least 4.5:1 for text, 3:1 for UI components; never rely on color alone (status icons have text/aria labels).
- **Images/media:** meaningful `alt` (file name or "Image from {name}"); avatars decorative with name nearby.
- **Motion:** respect `prefers-reduced-motion`. **Zoom:** layout works at 200% and 320 px width.
- **Testing:** `eslint-plugin-jsx-a11y`, `vitest-axe` in component tests, `@axe-core/playwright` in E2E, plus a manual screen-reader pass per release.

---

## 16. Security

| Area         | Rule                                                                                                                                                                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| XSS          | Render user content as text only. **No `dangerouslySetInnerHTML`** with user data (ESLint rule `react/no-danger` = error). Sanitize any rich content with DOMPurify if ever introduced (not planned).                                                              |
| Tokens       | Access token in memory only. Refresh token per section 8.1. Never in `localStorage`, URLs, logs, or Sentry events.                                                                                                                                                 |
| CSP          | Strict Content-Security-Policy at the web server (section 20.4): `script-src 'self'`, no inline scripts, `connect-src` limited to the API, WebSocket, and object storage origins.                                                                                  |
| Links        | Only `http/https`; `rel="noopener noreferrer nofollow"`; show the real domain for external links when external.                                                                                                                                                    |
| Uploads      | Validate type and size client-side (UX only; the server revalidates). Only direct-to-storage via presigned URLs. Never trust file names; display with truncation and escaping (React does this by default). Render images in `<img>`, never inline SVG from users. |
| Admin        | UI hiding is not security. All admin calls are authorized by the server; handle `403` gracefully. Confirm destructive actions.                                                                                                                                     |
| Logout       | Clears query cache, outbox, drafts, closes the socket, notifies other tabs.                                                                                                                                                                                        |
| Dependencies | `pnpm audit` and Dependabot/Renovate in CI; lockfile committed; minimal dependency count.                                                                                                                                                                          |
| Secrets      | Nothing secret in the bundle. Only `VITE_*` public config. No API keys that grant privilege.                                                                                                                                                                       |
| CSRF         | Bearer-token header auth is not CSRF-prone. If the refresh cookie is adopted: `SameSite=Strict`, cookie scoped to `/api/v1/auth`, and the refresh call requires a custom header.                                                                                   |
| Clickjacking | `frame-ancestors 'none'` and `X-Frame-Options: DENY`.                                                                                                                                                                                                              |
| Privacy      | Never log message content or tokens. Sentry `beforeSend` strips request bodies and URLs with tokens.                                                                                                                                                               |
| Source maps  | Upload to Sentry; do not serve publicly in production.                                                                                                                                                                                                             |

---

## 17. Performance

- **Budgets:** initial JS ≤ 250 KB gzipped; each lazy route chunk ≤ 100 KB gzipped; INP under 200 ms; CLS under 0.1. CI checks bundle size (`size-limit`).
- **Code splitting:** `lazy()` per route; admin and settings are separate chunks; heavy widgets (emoji picker, lightbox) load on first use.
- **Rendering:** virtualize long message lists; stable keys; keep message items cheap (`memo` on `MessageBubble`, proven by profiling); avoid creating objects/functions in hot lists unless memoized.
- **Data:** `select` in queries to subscribe to slices; long `staleTime` for realtime-fed lists; prefetch a conversation's first page on hover/focus in the list; debounce search (300 ms); never refetch the full message list on every event (patch the cache).
- **Realtime:** one socket per tab; subscribe only to needed topics (9.4); batch cache updates when many events arrive in the same frame (`queueMicrotask` / React batching).
- **Assets:** lazy-load images, use thumbnails from the media service, reserve dimensions, serve hashed, long-cache static files with gzip/brotli.
- **Measure:** `web-vitals` reported to analytics; React Profiler on the message list before and after changes.

---

## 18. Testing Strategy

| Level             | Tools                             | What to test                                                                                                                                                            |
| ----------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit (pure logic) | Vitest                            | `lib/` functions: `upsertMessage`, `mergeAfterSync`, gap detection, grouping, safe linkify, JWT exp decode, outbox retry policy, error mapping                          |
| Hook              | Vitest + RTL `renderHook` + MSW   | `useSendMessage` (ack path, REST fallback, retry with same `clientMessageId`), `useMessages` pagination, `useMarkRead` monotonic                                        |
| Component         | RTL + `vitest-axe` + MSW          | Forms (validation, server field errors), `MessageList` states, guards, `ConversationList` unread badges                                                                 |
| Realtime          | `FakeRealtimeGateway`             | Event sequences: duplicate event no-op, out-of-order triggers sync, reconnect triggers `afterSeq` fetch                                                                 |
| E2E               | Playwright (two browser contexts) | Register → login → DM between two users → reload → history intact → offline/online resend without duplicates; admin cannot be reached as USER; admin ban kicks the user |
| A11y              | axe in component and E2E          | No critical violations on main screens                                                                                                                                  |
| Visual (optional) | Storybook + Chromatic             | `shared/ui` and message bubbles                                                                                                                                         |

**Mandatory tests for the core (must exist):**

1. Applying the same `MESSAGE_CREATED` twice leaves exactly one message.
2. Ordering is by `seq` even if events arrive out of order.
3. A gap (`seq` jumps) triggers sync and ends with a gapless list.
4. A send retried after a network failure reuses the same `clientMessageId` and never shows a duplicate.
5. Session: parallel `401`s trigger a single refresh; failed refresh logs the user out.
6. `RequireRole` blocks a `USER` from admin routes.

```ts
// features/messages/lib/merge-messages.test.ts
it('ignores duplicates and keeps seq order', () => {
  const data = pagesOf([msg({ id: 'a', seq: 3 }), msg({ id: 'b', seq: 2 })]);
  const next = upsertMessage(
    upsertMessage(data, msg({ id: 'c', seq: 4 })),
    msg({ id: 'c', seq: 4 }),
  );
  expect(flatten(next).map((m) => m.seq)).toEqual([4, 3, 2]);
});
```

```ts
// e2e/chat.spec.ts (shape)
test('two users chat in real time', async ({ browser }) => {
  const alice = await (await browser.newContext()).newPage();
  const bob = await (await browser.newContext()).newPage();
  await login(alice, 'alice');
  await login(bob, 'bob');
  await startDirectChat(alice, 'bob');
  await alice.getByRole('textbox', { name: 'Message' }).fill('hello');
  await alice.keyboard.press('Enter');
  await expect(bob.getByRole('log')).toContainText('hello');
});
```

Rules: test behavior (what the user sees), query by role/label, no implementation details, no `setTimeout` sleeps (use `findBy*`/`waitFor`), fixed clock for time. Coverage target: 80% on `lib/` and hooks, no global % obsession.

---

## 19. Tooling and Configuration

### 19.1 Environment (validated at startup)

```bash
# .env.example
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws
VITE_APP_ENV=local            # local | staging | prod
VITE_SENTRY_DSN=
VITE_MAX_UPLOAD_MB=10
```

```ts
// shared/config/env.ts
const schema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_WS_URL: z.string().regex(/^wss?:\/\//),
  VITE_APP_ENV: z.enum(['local', 'staging', 'prod']),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_MAX_UPLOAD_MB: z.coerce.number().default(10),
});
const parsed = schema.parse(import.meta.env); // fails fast with a clear error
export const env = {
  API_BASE_URL: parsed.VITE_API_BASE_URL,
  WS_URL: parsed.VITE_WS_URL,
  APP_ENV: parsed.VITE_APP_ENV,
  SENTRY_DSN: parsed.VITE_SENTRY_DSN,
  MAX_UPLOAD_MB: parsed.VITE_MAX_UPLOAD_MB,
};
```

Dev server proxy (`vite.config.ts`) can proxy `/api` and `/ws` to the backend to avoid CORS during development; production uses real origins with the backend's CORS and WebSocket `Origin` allowlist set to the frontend origin.

### 19.2 TypeScript (`tsconfig.json` essentials)

`"strict": true`, `"noUncheckedIndexedAccess": true`, `"noImplicitOverride": true`, `"noFallthroughCasesInSwitch": true`, `"verbatimModuleSyntax": true`, `"paths": { "@/*": ["./src/*"] }`.

### 19.3 ESLint (flat config) key rules

- `typescript-eslint` strict + stylistic, `react-hooks` (errors), `jsx-a11y` recommended, `react/no-danger: error`.
- Deep-import ban from outside a feature (certain-to-work rule):

```js
{
  rules: {
    'no-restricted-imports': ['error', { patterns: [
      { group: ['@/features/*/*'], message: 'Import from the feature public API: @/features/<name>' },
    ]}],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    '@typescript-eslint/no-explicit-any': 'error',
  },
}
```

(Inside a feature, use relative imports; the alias pattern above applies to outside code.)

- Layer rules (`app → pages → features → shared`) with `eslint-plugin-boundaries`: define element types for `app`, `pages`, `features`, `shared` and allow only downward imports; allow `features → features` only through public entry points. Check the installed plugin version's rule syntax, and keep the rule set failing the build.

### 19.4 Scripts

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "format": "prettier --write .",
  "test": "vitest run",
  "test:watch": "vitest",
  "e2e": "playwright test",
  "api:gen": "openapi-typescript $OPENAPI_URL -o src/shared/api/schema.d.ts",
  "storybook": "storybook dev -p 6006"
}
```

### 19.5 Git hooks

Husky `pre-commit`: `lint-staged` (Prettier + ESLint on staged files). `commit-msg`: commitlint (Conventional Commits). `pre-push`: `typecheck` and `test`.

---

## 20. Build, CI/CD, Deployment, Observability

### 20.1 CI (every pull request)

`install (frozen lockfile)` → `api:gen` + `git diff --exit-code` (types in sync) → `lint` → `typecheck` → `test` (with coverage) → `build` → `size-limit` → `e2e` (against docker-compose backend) → `pnpm audit`. A failing step blocks merge.

### 20.2 Docker (multi-stage)

```dockerfile
FROM node:lts-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG VITE_API_BASE_URL
ARG VITE_WS_URL
ARG VITE_APP_ENV=prod
RUN pnpm build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

### 20.3 Local full stack

`docker compose up` runs backend + Postgres + Redis (backend repo) and the frontend dev server (`pnpm dev`). E2E uses the same compose file with seeded test users.

### 20.4 nginx (SPA fallback and security headers)

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location / { try_files $uri /index.html; }                       # SPA routing
  location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
  location = /index.html { add_header Cache-Control "no-cache"; }

  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "DENY" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
  add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://media.example.com; connect-src 'self' https://api.example.com wss://api.example.com https://storage.example.com; frame-ancestors 'none'; base-uri 'self'; object-src 'none'" always;
}
```

Replace the example domains. Serve over HTTPS only (HSTS at the load balancer).

### 20.5 Release

Semantic versioning, `CHANGELOG.md`, image tagged with git SHA, deploy staging first, smoke test (login, send a message), then production. Keep the previous image for instant rollback. The backend deploys first for additive API changes.

### 20.6 Observability

Sentry for errors (release + source maps uploaded, user ID only, no content), `web-vitals` for performance, structured `logger` wrapper (no-op in prod except `warn/error`). Include `traceId` from `ApiError` in error reports so frontend and backend issues are correlated.

---

## 21. Roadmap: Basic → Medium → Advanced

Backend references use the IDs from `PROJECT_DOCUMENTATION.md` section 10.

### LEVEL 1: BASIC (usable 1-to-1 chat, solid foundation)

| #    | Feature                                                                                                                       | Needs backend                | Acceptance criteria                                           |
| ---- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------- |
| FB1  | Project scaffold: Vite, strict TS, ESLint/Prettier/Husky, aliases, folder structure, env validation                           | none                         | `pnpm dev/build/lint/test` pass; boundaries rule active       |
| FB2  | Design foundation: tokens, Tailwind, `shared/ui` primitives, dark mode, toasts                                                | none                         | Storybook-free visual check of primitives in both themes      |
| FB3  | Generated API types and typed HTTP client with single-flight refresh                                                          | B13 (Swagger/`openapi.json`) | `api:gen` works; parallel 401s cause one refresh              |
| FB4  | Auth screens: register, login, logout; session bootstrap; guards                                                              | B1, B2                       | Refresh survives page reload; guest/auth redirects correct    |
| FB5  | App shell, routing (lazy), error boundaries, 403/404 pages                                                                    | none                         | Deep links work; unknown route shows 404                      |
| FB6  | Profile view/edit                                                                                                             | B3                           | Edits persist; validation errors shown on fields              |
| FB7  | User search and start direct chat                                                                                             | B4, B5                       | Existing DM is reused (no duplicates)                         |
| FB8  | Conversation list with last message, unread badge, live updates                                                               | B8                           | New message updates list instantly; sorted by activity        |
| FB9  | Chat window: history with infinite scroll, composer, realtime send/receive, optimistic bubble, ack, dedupe, ordering by `seq` | B6, B7                       | Mandatory core tests (section 18) pass                        |
| FB10 | Reconnect and gap sync, connection banner, durable outbox                                                                     | B6                           | Kill the network mid-send: message sends once after reconnect |
| FB11 | Loading/empty/error states everywhere; responsive layout (mobile and desktop)                                                 | none                         | Works at 360 px and 1440 px                                   |
| FB12 | Tests, CI pipeline, Dockerfile, nginx config                                                                                  | none                         | CI green; container serves SPA with CSP                       |

**Exit criteria for Basic:** two users can register, log in, chat in real time, reload, see correct history, survive disconnects with no duplicates or lost messages, on desktop and mobile.

### LEVEL 2: MEDIUM (product features and polish)

| #    | Feature                                                                                                   | Needs backend                 |
| ---- | --------------------------------------------------------------------------------------------------------- | ----------------------------- |
| FM1  | Group chats: create, members panel, add/remove/leave, group roles                                         | M1                            |
| FM2  | Presence and last seen; typing indicator                                                                  | M2, M3                        |
| FM3  | Read receipts, "Seen", accurate unread counts                                                             | M4                            |
| FM4  | Edit/delete message, reply, "(edited)" and deleted placeholders                                           | M5, M6                        |
| FM5  | Reactions                                                                                                 | M7                            |
| FM6  | Media messages: attach, drag-drop, paste image, progress, previews, lightbox, shared-media tab            | M8                            |
| FM7  | Email flows: verify email, forgot/reset password, change password, forced change for bootstrapped admin   | M9, B12                       |
| FM8  | Block, mute, pin, archive; blocked users page                                                             | M10                           |
| FM9  | Sessions/devices page; remote sign-out of a device                                                        | M13                           |
| FM10 | Report message dialog                                                                                     | report endpoint (backend 8.4) |
| FM11 | Admin console v1: dashboard, users (filter, ban/disable, force logout, delete), audit logs; `RequireRole` | M15                           |
| FM12 | Rate-limit UX (`429` countdown), drafts persistence, keyboard shortcuts                                   | M11                           |
| FM13 | i18n scaffold (English), Storybook for `shared/ui`, a11y audit and axe in CI                              | none                          |
| FM14 | Multi-tab logout sync (`BroadcastChannel`), proactive token refresh                                       | none                          |

### LEVEL 3: ADVANCED (scale, resilience, differentiation)

| #    | Feature                                                                                          | Needs backend          |
| ---- | ------------------------------------------------------------------------------------------------ | ---------------------- |
| FA1  | Message search UI (conversation and global)                                                      | A3                     |
| FA2  | Web push and desktop notifications (service worker), per-conversation mute respected             | A2                     |
| FA3  | PWA: installable, offline app shell, cached last conversations (read-only offline)               | none                   |
| FA4  | Moderation UI: reports queue, review reported message, remove message, lock conversation         | A6                     |
| FA5  | Ownership transfer UI (danger zone with confirmations)                                           | A14                    |
| FA6  | Per-recipient delivery status UI                                                                 | A4                     |
| FA7  | Single per-user event stream (replace many topic subscriptions)                                  | backend agreement 22.2 |
| FA8  | Performance hardening: virtualization tuning, bundle budgets in CI, Web Vitals dashboard         | none                   |
| FA9  | Full i18n + RTL, accessibility certification pass                                                | none                   |
| FA10 | Feature flags, error budgets, Sentry release health, visual regression with Chromatic            | none                   |
| FA11 | Optional: emoji picker, link previews, message forwarding, threads, pinned messages, voice notes | optional backend work  |
| FA12 | Optional: end-to-end encryption client (design with backend A11)                                 | A11                    |

---

## 22. Backend Agreements Needed by the Frontend

These items are **not yet in the backend document** (or are only implied). Agree on them, then record them in `PROJECT_DOCUMENTATION.md`:

| #     | Agreement                                                                                                                                   | Why                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 22.1  | **Realtime event envelope** `{type, payload}` on `/topic/conversations.{id}` and `/user/queue/notifications` (types listed in 9.3)          | Frontend dispatch depends on it                |
| 22.2  | (Advanced) one per-user event queue `/user/queue/events` carrying events for all the user's conversations                                   | Avoids dozens of subscriptions; simpler client |
| 22.3  | Refresh token delivered as an **HttpOnly, Secure, SameSite=Strict cookie** scoped to `/api/v1/auth`; refresh requires a custom header       | Removes the refresh token from JS reach        |
| 22.4  | `GET /users/me` and the login response include `role` and `mustChangePassword`                                                              | Guards and forced password change              |
| 22.5  | Conversation list item: `id, type, title, avatarUrl, otherUser (DM), lastMessage, unreadCount, mutedUntil, pinnedAt, archivedAt, lastSeq`   | Sidebar needs no extra requests                |
| 22.6  | `GET /conversations/{id}/members` returns each member's `lastReadSeq`                                                                       | "Seen" markers                                 |
| 22.7  | Send request/response support `attachmentIds[]` and `attachments[]`                                                                         | Media messages                                 |
| 22.8  | WebSocket error frames include `clientMessageId` when relevant                                                                              | Fail the right pending bubble                  |
| 22.9  | CORS and WebSocket `Origin` allowlist contain the frontend origin; `Retry-After` exposed via `Access-Control-Expose-Headers`                | Browser access and 429 UX                      |
| 22.10 | CI publishes `openapi.json` with stable `operationId`s                                                                                      | Type generation                                |
| 22.11 | Upload limits (allowed MIME types, max size) exposed by config endpoint or documented constants                                             | Client-side validation                         |
| 22.12 | Presence events on `/user/queue/notifications` (`PRESENCE_CHANGED {userId, online, lastSeenAt}`) for users in the current user's open chats | Live presence                                  |
| 22.13 | `ACCOUNT_STATUS_CHANGED` notification before the server closes a banned user's socket                                                       | Friendly sign-out message                      |

---

## 23. Definition of Done (every frontend task)

- [ ] Matches this document and the backend contract (types come from the generated schema).
- [ ] Loading, empty, error, and success states handled; works offline-safe where relevant.
- [ ] No server data copied into local state; cache updated through helpers.
- [ ] Layer and feature-boundary rules respected (lint passes).
- [ ] Keyboard and screen-reader usable; axe checks pass; focus managed.
- [ ] No `any`, no `console.log`, no hard-coded URLs/limits/roles, no tokens in storage or logs.
- [ ] Tests added: unit for logic, component or hook tests for UI, E2E when a user flow changed.
- [ ] Responsive at 360 px and desktop; dark mode checked.
- [ ] Bundle budget unchanged or justified; lazy loading kept.
- [ ] Docs updated (this file, feature README) if behavior or contract changed.

---

## 24. Agent Instructions (frontend)

You are a **senior React/TypeScript engineer**. Follow this file and `PROJECT_DOCUMENTATION.md`.

**Read order:** this document → backend documentation (sections 5.4, 7, 8, 9, 19) → the feature folder you will touch → existing tests.

**Workflow per task:** (1) restate the task and locate its roadmap ID (`FB9`, `FM2`...); (2) plan files, hooks, endpoints, tests in a few lines; (3) implement in small steps (one feature per change); (4) write tests with the code; (5) run `pnpm lint && pnpm typecheck && pnpm test`; (6) report using the format below.

**Hard rules**

1. Respect the layers `app → pages → features → shared`. Import another feature only through its `index.ts`.
2. Server data lives in TanStack Query; client-only state in Zustand; URL state in the router; forms in React Hook Form. Never copy query data into state.
3. Types come from `shared/api/schema.d.ts`. Never hand-write DTOs the backend already defines. Regenerate with `pnpm api:gen` when the backend changes.
4. All HTTP goes through `shared/api/http-client.ts` and feature `api/` modules. No `axios/fetch` in components.
5. Messages: identity by `id`/`seq`, order by `seq`, idempotent updates, optimistic items only in the outbox, retries reuse `clientMessageId`, realtime events patch the cache, reconnect runs gap sync.
6. Security: tokens never in `localStorage`; no `dangerouslySetInnerHTML`; links sanitized; never log message content or tokens; admin UI hidden for non-admins but never trusted.
7. Never put `role` in a request; never assume admin from anything except `/users/me`.
8. Components under ~150 lines, logic in hooks/`lib`, named exports, no `any`, constants for limits.
9. Every new endpoint use has typed API function + hook + tests; every new view has loading/empty/error states.
10. Do not add dependencies that duplicate a stack role (section 2). Do not change the architecture, routes, or contracts silently; update docs in the same change.

**Ask the human when:** the requirement conflicts with the docs; a backend agreement from section 22 is needed but missing; a security trade-off appears; tests fail and the cause is unclear (never weaken a test to pass).

**Report format**

```
## Summary        (2-4 lines, roadmap ID)
## Changes        (file: what and why)
## Tests          (added; result of lint/typecheck/test)
## Assumptions / Risks / Follow-ups
```

**Code templates to follow:** API function (7.5), query keys (7.6), cache helper + event handler (10.2, 10.4), send flow (10.3), guard (6.2), form + server errors (12), realtime provider (9.5).

---

## 25. Common Pitfalls and Fixes

| Pitfall                                            | Fix                                                                                                |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Duplicate messages after reconnect                 | Idempotent `upsertMessage` by `id`; outbox retries reuse `clientMessageId`; dedupe live vs history |
| Messages out of order                              | Always sort by `seq`; detect gaps and sync with `afterSeq`                                         |
| Flash of login page on refresh                     | Session status `unknown` + `SessionBootstrap` + spinner in guards                                  |
| Many `401`s cause refresh storms                   | Single-flight refresh promise in the HTTP client                                                   |
| Socket uses an expired token after sleep/reconnect | `beforeConnect` fetches a fresh token via `getFreshToken`                                          |
| Scroll jumps when loading older messages           | Preserve scroll offset when prepending; virtualized list with measured sizes                       |
| Unread badge wrong                                 | Patch the list cache on live events; set to 0 optimistically on `chat.read`; resync on reconnect   |
| Stale data after logout/login as another user      | `queryClient.clear()` and clear outbox/drafts on logout                                            |
| Memory leaks from subscriptions                    | Every subscribe returns an unsubscribe; effects return cleanup; tested with fake gateway           |
| Enter sends while using an IME                     | Check `event.nativeEvent.isComposing` before sending                                               |
| Mobile keyboard hides the composer                 | `100dvh` layout and `visualViewport` adjustment                                                    |
| Admin page visible via URL to a USER               | `RequireRole` guard plus server `403` handling; admin chunk never loaded for users                 |
| Layout shift from images                           | Reserve width/height from attachment metadata                                                      |
| Flaky E2E                                          | Two isolated browser contexts, seeded users, `expect` auto-waiting, no sleeps                      |

---

## 26. Glossary

- **Server state:** data owned by the backend and cached on the client (TanStack Query).
- **Client state:** data that exists only in the browser (UI prefs, typing, outbox).
- **Outbox:** durable queue of messages not yet acknowledged by the server.
- **seq:** per-conversation, strictly increasing message number assigned by the server.
- **clientMessageId:** client-generated UUID that makes sending idempotent.
- **Ack:** server confirmation, on `/user/queue/acks`, that a message was persisted.
- **Gap sync:** fetching `afterSeq` messages when a gap or reconnect is detected.
- **Single-flight refresh:** only one token refresh runs at a time; concurrent requests wait for it.
- **Feature public API:** the `index.ts` of a feature; the only allowed import surface.
- **Role `ADMIN`:** the single platform owner; unrelated to group roles (`OWNER/ADMIN/MEMBER`).
