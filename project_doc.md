# Leo Chat Frontend - Project Documentation

## 1. Project Overview
Leo Chat is a modern, real-time messaging application. This frontend connects to the Spring Boot backend via REST APIs and WebSockets to deliver a seamless, responsive, and highly secure user experience.

## 2. Tech Stack & Tools
* **Core Framework:** React 18 (via Vite for blazing-fast builds and HMR)
* **Routing:** React Router v6
* **Styling:** Tailwind CSS (for utility-first, responsive design)
* **Icons:** Lucide React
* **State Management:** Zustand (lightweight, unopinionated state management for UI states and user sessions)
* **Data Fetching:** Axios + React Query (for caching, background updates, and handling API states)
* **Real-time Communication:** Native `WebSocket` API (or `sockjs-client`/`stompjs` depending on backend strictness)
* **Forms & Validation:** React Hook Form + Zod

## 3. Architecture Pattern
We will use a **Feature-Based Architecture** (inspired by Feature-Sliced Design) to keep the codebase modular, scalable, and easy to maintain. Instead of grouping files by type (e.g., all components together, all hooks together), we group them by the domain feature they belong to.

### 4. Clean Code Directory Structure
```text
/src
  /assets        # Static assets (images, global CSS, SVGs)
  /components    # Global shared components (Buttons, Inputs, Modals, Navbar, Footer)
  /features      # Feature-specific modules (The core of the app)
    /auth        # Login, Register, Password Reset logic and UI
    /chat        # Message lists, Chat inputs, WebSocket logic
    /users       # Profile management, User presence
    /admin       # Moderation tools, Admin dashboard
  /hooks         # Global custom hooks (e.g., useTheme, useDebounce)
  /layouts       # Page layout wrappers (e.g., MainLayout, AuthLayout)
  /pages         # Route-level components that combine features and layouts
  /services      # Global API configurations (Axios instances, WebSocket setup)
  /store         # Global Zustand stores (e.g., AuthStore, ThemeStore)
  /utils         # Helper functions (e.g., date formatting, class merging)
```

## 5. Security & Authentication Handling
* **No Local Token Storage:** The backend uses **HTTP-Only Cookies** (`leo_chat_jwt`, `leo_chat_jwt_refresh`). The frontend will **never** store tokens in `localStorage` or `sessionStorage`.
* **API Configuration:** The Axios instance must be configured with `withCredentials: true` so that the browser automatically attaches the cookies to every request.
* **Token Rotation:** When a `401 Unauthorized` response is received, the frontend will transparently call `/api/v1/auth/refresh` to rotate the cookies and retry the failed request.

## 6. Real-Time Implementation Strategy
* Use a global WebSocket context/provider initialized at the root level (only when the user is authenticated).
* Listen for events: `NEW_MESSAGE`, `USER_TYPING`, `MESSAGE_READ`, `PRESENCE_UPDATE`.
* Dispatch updates directly to the Zustand store or invalidate React Query caches to instantly update the UI without manual page refreshes.
