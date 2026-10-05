# AI Agent Instructions (agent.md)

## Purpose
This document provides specific guidelines and instructions for any AI agent or developer contributing to the Leo Chat Frontend project. ALWAYS read and adhere to these rules before writing or modifying code.

## 1. UI & Design Fidelity
*   **Match the Figma Designs:** The user has provided specific reference images. The UI must be pixel-perfect, clean, and modern.
*   **Tailwind CSS First:** Do not write custom CSS unless absolutely necessary. Rely on Tailwind's utility classes for layout, typography, colors, and spacing.
*   **Responsiveness:** All pages must look great on mobile, tablet, and desktop. Use Tailwind's `md:`, `lg:`, and `xl:` breakpoints properly.

## 2. Coding Standards
*   **Functional Components:** Use React Functional Components and Hooks exclusively. No Class components.
*   **Clean Code:** Keep components small and focused. If a component grows beyond 150-200 lines, extract parts into smaller sub-components.
*   **Prop Validation:** Even if not using TypeScript immediately, document expected props clearly or use prop-types.
*   **Semantic HTML:** Use proper HTML5 tags (`<main>`, `<section>`, `<nav>`, `<aside>`, `<button>`, `<a>`) for accessibility and SEO.

## 3. Integration Requirements
*   **Follow API Docs:** The backend documentation is located at `/Users/Shared/chat-app-backend/API_DOCUMENTATION.md`.
*   **Authentication:** The backend relies on HTTP-Only cookies. The frontend must send credentials with requests (`credentials: 'include'` in fetch or `withCredentials: true` in Axios). Do NOT attempt to read JWTs manually.
*   **Error Handling:** Implement graceful error handling. Show user-friendly toast notifications for API failures (e.g., "Invalid credentials", "Network error") instead of crashing or silently failing.

## 4. Development Workflow
1.  **Read Before Writing:** Always consult `project_doc.md` to understand the directory structure before placing a new file.
2.  **Modular Features:** If building the Chat interface, place specific logic in `/src/features/chat`, not globally.
3.  **No Placeholders:** When writing components based on designs, use the exact text, colors, and layouts shown in the provided images. Do not use generic `Lorem Ipsum` if the design has actual copy.

## 5. Current Priorities
*   Initialize the core Auth layouts (Landing, Login, Register).
*   Setup global Axios instance configured for HTTP-only cookies.
*   Build the main Chat Application interface (Sidebar, Message Thread, Input Area).
