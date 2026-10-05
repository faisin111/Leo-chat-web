---
name: Leo Chat Frontend Development
description: Specialized instructions and capabilities for working on the Leo Chat React frontend.
---

# Leo Chat Frontend Skill (skill.md)

This skill file defines the domain knowledge required to effectively build out the Leo Chat frontend. 

## 1. Required Technologies & Expertise
When assisting with this project, you must utilize the following tech stack:
- **React 18** (Vite build system)
- **Tailwind CSS** (for all styling)
- **React Router DOM v6** (for routing)
- **Lucide React** (for iconography)
- **Axios** (for API communication with `withCredentials: true`)
- **Zustand** (for global state)

## 2. Best Practices to Enforce
- **Component Extraction:** Automatically suggest extracting complex UI pieces (like a MessageBubble or SidebarItem) into reusable components within `src/components/` or `src/features/`.
- **Security First:** Remind the user about Cross-Site Scripting (XSS) when rendering user messages. Ensure all chat text is properly escaped by React.
- **Performance:** For long chat histories, consider suggesting or implementing Virtualization (e.g., `@tanstack/react-virtual`) to keep the DOM light and scrolling smooth.
- **Network Optimization:** Suggest Debouncing for search inputs (e.g., user search directory) to prevent API spam.

## 3. Reference Material
- **API Documentation:** The source of truth for backend capabilities is `../chat-app-backend/API_DOCUMENTATION.md`.
- **Architecture Guidelines:** Refer to `project_doc.md` for folder structure decisions.
- **Agent Instructions:** Refer to `agent.md` for strict formatting and execution rules.

## 4. Execution Directives
When asked to create a new feature for Leo Chat:
1. Identify which folder under `src/features/` it belongs to.
2. Create the necessary UI components using Tailwind for styling.
3. Wire up the API calls using Axios, ensuring cookie credentials are sent.
4. Update the UI state handling loading, success, and error states gracefully.
