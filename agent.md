# AI Agent Instructions (agent.md)

## Purpose

This document provides specific guidelines and instructions for any AI agent or developer contributing to the Leo Chat Frontend project.

## CORE RULE

**ALWAYS** read and adhere to `project_doc.md` before writing or modifying code. It contains the complete architecture, routing, API layer, real-time strategy, testing, and specific agent instructions (see Section 24).

The frontend relies heavily on specific technology choices, strict layer boundaries (Feature-Based Architecture), TanStack Query for server state, and a framework-free STOMP client for real-time. Do not deviate from the guidelines set in `project_doc.md`.

## STYLING RULE

**Use FULL Tailwind CSS only.** All styling must be done using pure Tailwind CSS utility classes and `shadcn/ui` components. **DO NOT USE BOOTSTRAP** under any circumstances. Never introduce `bootstrap` or any related UI libraries into the dependencies.
