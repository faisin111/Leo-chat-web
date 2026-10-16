# AI Agent Instructions (agent.md / AGEND.md)

## Purpose

This document provides strict, non-negotiable guidelines and instructions for any AI agent or developer contributing to the Leo Chat Frontend project.

---

## 1. CORE RULE

**ALWAYS** read and adhere to `project_doc.md` before writing or modifying code. It contains the complete architecture, routing, API layer, real-time strategy, testing, and specific agent instructions (see Section 24).

The frontend relies heavily on specific technology choices, strict layer boundaries (Feature-Based Architecture: `app → pages → features → shared`), TanStack Query for server state, and a framework-free STOMP client for real-time. Do not deviate from the guidelines set in `project_doc.md`.

---

## 2. STYLING RULE

**Use FULL Tailwind CSS only.** All styling must be done using pure Tailwind CSS utility classes and `shadcn/ui` (Radix UI) components. **DO NOT USE BOOTSTRAP** under any circumstances. Never introduce `bootstrap` or any related UI libraries into the dependencies.

---

## 3. AUTHENTICATION & BEARER TOKEN RULES (Backend Contract)

1. **Bearer Token is Authoritative**:
   - All authenticated API requests MUST include `Authorization: Bearer <accessToken>`.
   - The backend treats explicit Bearer credentials as authoritative. An invalid or expired Bearer token **never** falls back to ambient cookies; it returns `401 Unauthorized`.
2. **No CSRF Bootstrap for Bearer Requests**:
   - The backend automatically skips CSRF protection for any request carrying a Bearer token.
   - Frontend **MUST NOT** invoke `/api/v1/auth/csrf` for requests containing a Bearer token.
3. **Cookie-Only Writes Require CSRF**:
   - Only cookie-authenticated write methods (`POST`, `PUT`, `PATCH`, `DELETE` without a Bearer token) require fetching and sending the `X-XSRF-TOKEN` header. Public endpoints (`/auth/login`, `/auth/register`, `/auth/refresh`, etc.) do not require CSRF tokens.
4. **Token Refresh Lifecycle**:
   - On `401 Unauthorized`, `http-client` intercepts the response and triggers a single-flight `POST /api/v1/auth/refresh` using the HttpOnly refresh cookie (without sending the stale Bearer token). The failed request is then retried with the fresh `Authorization: Bearer <newToken>`.

---

## 4. RESPONSIVE UI & CROSS-PLATFORM RULES (Mobile, Tablet, Desktop)

Every page, layout, modal, drawer, and chat element in Leo Chat must deliver a seamless, first-class experience across all form factors: smartphones (iOS/Android), tablets (iPad/Android tablets), and desktop browsers (macOS, Windows, Linux).

All UI development follows a strict **Mobile-First** approach.

### 4.1 Breakpoint System & Target Viewports

Leo Chat adheres to Tailwind CSS standard breakpoints:

| Form Factor    | Breakpoint Range    | Tailwind Prefix     | Target Dimensions (px)                         | Primary Layout Strategy                                                                                                                                                                                   |
| :------------- | :------------------ | :------------------ | :--------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mobile**     | `< 768px`           | Default (no prefix) | 360×640, 375×667, 390×844, 414×896, 428×926    | **Single-Pane Stack**: One primary view at a time (`/app` for conversation list vs `/app/c/:id` for active chat). Responsive bottom navigation bar. Full-width drawers with touch backdrop.               |
| **Tablet**     | `768px` – `1023px`  | `md:`               | 768×1024 (iPad), 820×1180 (iPad Air), 834×1194 | **Two-Pane Split**: Side-by-side conversation list (`w-[320px]`–`w-[340px]`) and active chat. Compact vertical navigation rail (`w-16`). Secondary panels (details) render as slide-over overlay drawers. |
| **Desktop**    | `1024px` – `1439px` | `lg:`               | 1024×768, 1280×800, 1366×768, 1440×900         | **Three-Pane Layout**: Left navigation rail (`w-16`), conversation sidebar (`w-[340px]`–`w-[380px]`), chat pane (`flex-1 min-w-0`), and side-by-side details drawer (`w-80`–`w-96`).                      |
| **Widescreen** | `≥ 1440px`          | `xl:`, `2xl:`       | 1440×1080, 1920×1080, 2560×1440                | **Constrained Content**: Comfortable max-widths for message bubbles (`max-w-2xl`), centered modals, generous spacing without stretched or distorted elements.                                             |

---

### 4.2 Viewport Height & Safe Area Inset Rules

1. **Mandatory Dynamic Viewport Height (`100dvh`)**:
   - **NEVER** use `100vh` on top-level app containers, shells, or fullscreen modals. Standard `100vh` does not account for dynamic address bars and toolbars in mobile browsers (iOS Safari, Android Chrome), resulting in clipped chat composers and hidden buttons.
   - **ALWAYS** use `h-[100dvh]`, `min-h-[100dvh]`, or `max-h-[100dvh]`.
2. **Safe Area Insets (Notches & Home Indicator)**:
   - Fixed or bottom-docked elements (such as bottom navigation rails and chat input composers) must include safe area padding:
     - Bottom bars and composers: `pb-[calc(0.5rem+env(safe-area-inset-bottom))]` or `pb-[env(safe-area-inset-bottom)]`.
     - Edge headers: `pt-[env(safe-area-inset-top)]`.
     - Side navigation: `pl-[env(safe-area-inset-left)]`.
3. **Zero Horizontal Overflow**:
   - Every layout root and flex child container MUST apply `min-w-0` and avoid causing horizontal document scroll. Never allow unintentional horizontal scrolling or horizontal page bounce on mobile.
4. **Touch Scrolling Momentum**:
   - All scrollable areas (conversation list, message scroll container) must support smooth momentum scrolling with `-webkit-overflow-scrolling: touch` and `overscroll-behavior: contain` to prevent conflicts with mobile pull-to-refresh.

---

### 4.3 Platform-Specific Layout Behaviors

#### A. Mobile (`< 768px`)

- **Single-Pane Navigation**:
  - The conversation list (`/app`) and conversation chat (`/app/c/:id`) are mutually exclusive views on mobile.
  - When a user selects a conversation, the sidebar is hidden (`hidden md:flex`), and the chat view is displayed.
  - Active chat views **MUST** include a back button (`< ArrowLeft`) in the header that routes back to `/app` (visible only on mobile `md:hidden`).
- **Responsive Bottom Navigation Bar**:
  - The navigation rail transforms from a desktop vertical sidebar into an ergonomic bottom navigation bar (`w-full h-16 flex-row items-center justify-around border-t border-slate-900 bg-slate-950`).
  - Desktop-only decorative elements (logo header, help icon) are hidden to maximize tap area for core tabs (`Chats`, `People`, `Settings`, `Admin` if authorized, `Profile`).
  - While inside an active chat (`/app/c/:id`) on mobile, the navigation rail is hidden (`hidden md:flex`) so the message list and keyboard composer have maximum vertical space.
- **Overlay Drawers & Sheets**:
  - Secondary details (user profiles, group member lists, media viewers) MUST render as slide-in overlay drawers (`fixed inset-y-0 right-0 z-40 w-full sm:w-80`) with a darkened touch backdrop (`fixed inset-0 bg-slate-900/40 z-30 lg:hidden`) that dismisses on tap. Never let details squish the chat window horizontally on mobile.

#### B. Tablet (`768px` – `1023px`, `md`)

- **Two-Pane Split Layout**:
  - Left navigation rail is a compact vertical icon bar (`w-16`).
  - Conversation list sidebar is permanently docked (`w-[320px]` or `w-[340px]`).
  - The active conversation fills the remaining space (`flex-1 min-w-0`).
  - Detail panels (e.g. `UserProfileSidebar`) open as slide-over overlay drawers with a backdrop, preserving readability of both sidebar and chat.

#### C. Desktop (`≥ 1024px`, `lg`+)

- **Three-Pane Architecture**:
  - Left navigation rail (`w-16`).
  - Conversation list sidebar (`w-[340px]`–`w-[380px]`).
  - Active chat view (`flex-1 min-w-0`).
  - Details panel (`UserProfileSidebar`) sits side-by-side (`w-80` or `w-96`) without covering the chat area.
  - Modals and settings dialogs are centered floating cards with accessible focus traps.

---

### 4.4 Touch, Interaction & Form Control Rules

1. **Minimum Touch Targets (WCAG 2.2 AA)**:
   - All interactive elements (buttons, icon buttons, list items, checkboxes, menu triggers) MUST have a minimum tap area of **44 × 44 pixels** on touch screens (`min-h-[44px] min-w-[44px]` or padded hit-boxes).
2. **Preventing iOS Safari Auto-Zoom on Input Focus**:
   - All form inputs, search bars, and the chat composer textarea MUST have a font size of at least **16px** on mobile (`text-base md:text-sm`).
   - Font sizes smaller than 16px cause iOS Safari to auto-zoom the page viewport on focus, disorienting the user and breaking layout alignment.
3. **No Hover-Only Affordances**:
   - Never hide essential controls behind mouse hover alone (e.g., `opacity-0 group-hover:opacity-100` for message delete, reply, or reaction actions).
   - On touch devices, primary message actions must be accessible via direct tap, long-press, or an accessible action button.
4. **Virtual Keyboard Compatibility**:
   - The message composer must remain pinned above the mobile virtual keyboard.
   - Do not use fixed pixel heights on main chat containers; allow the flex column to resize dynamically when the on-screen keyboard appears.
5. **Text Truncation & Flex Shrink**:
   - Always apply `truncate` and `min-w-0` on parent flex containers for usernames, message previews, and titles to prevent text from forcing container expansion.

---

### 4.5 Chat Messages & Media Responsiveness

1. **Message Bubble Sizing & Word Breaking**:
   - Mobile: `max-w-[85%]`
   - Tablet / Desktop: `max-w-[75%]` or `max-w-xl`
   - Always apply `break-words` and `[overflow-wrap:anywhere]` to message bubbles to guarantee that long URLs, code blocks, or unbroken strings wrap without clipping or breaking layout boundaries.
2. **Media, Images & Attachments**:
   - Images and media attachments must specify `max-w-full h-auto` with reserved aspect ratios (`aspect-video`, `aspect-square`) and skeleton loaders to eliminate Cumulative Layout Shift (CLS).
   - Lightboxes and media previews must support touch dismiss, swipe gestures, and responsive scaling.

---

### 4.6 Definition of Done: Responsive UI Checklist for Agents

Before completing any task that introduces or modifies UI, every AI agent MUST verify:

- [ ] **Mobile (360px & 390px)**:
  - Single pane active (conversation list OR chat, never squished together).
  - Header back button routes cleanly back to `/app`.
  - Bottom navigation docked at screen bottom with safe area padding, hidden during active chat.
  - Tap targets ≥ 44 × 44px.
  - Inputs and textareas ≥ 16px font size (`text-base md:text-sm`).
  - No horizontal scrolling (`overflow-x-hidden`).
- [ ] **Tablet (768px & 820px)**:
  - Two-pane split layout (sidebar + chat visible side-by-side).
  - Vertical navigation rail docked on left (`w-16`).
  - Detail panels open as slide-over drawers with backdrop.
- [ ] **Desktop (1024px & 1440px)**:
  - Three-pane layout functional (rail + sidebar + chat + details).
  - Centered dialogs and comfortable maximum widths.
  - Full keyboard accessibility and focus management.
- [ ] **Dynamic Viewport Height**:
  - `h-[100dvh]` used on app shells and fullscreen containers (never `100vh`).
- [ ] **Safe Area Insets**:
  - `env(safe-area-inset-*)` applied to fixed bars and edges.
- [ ] **Dark & Light Mode**:
  - Correct contrast, borders, and colors preserved across all responsive breakpoints.
