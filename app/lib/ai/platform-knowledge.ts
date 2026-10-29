import {
  COLLECTIONS,
  DROPDOWNS,
  PLATFORM_CONVENTIONS,
  PORTAL_ROUTES,
} from "./platform-manifest";

/**
 * Static knowledge about the SM Engineer Portal, rendered from the curated
 * manifest in ./platform-manifest.ts.
 *
 * The AI always has this context — no database fetch needed. It describing the
 * portal's architecture (routes, data store, models and controls) rather than a
 * snapshot of any single screen.
 */

function renderRoutes(): string {
  const groups = ["active", "hidden", "placeholder"] as const;
  const labels = {
    active: "ACTIVE PAGES",
    hidden: "PAGES PRESENT IN CODE BUT HIDDEN FROM THE NAVIGATION",
    placeholder: "UNIMPLEMENTED / NOT LINKED",
  };

  return groups
    .map((status) => {
      const routes = PORTAL_ROUTES.filter((r) => r.status === status);
      if (routes.length === 0) return "";
      const body = routes
        .map((r) => {
          const capabilities = r.capabilities.length
            ? `\n     Controls: ${r.capabilities.join("; ")}.`
            : "";
          return `  - ${r.path} — ${r.label} (${r.section}): ${r.purpose}${capabilities}`;
        })
        .join("\n");
      return `${labels[status]}:\n${body}`;
    })
    .filter(Boolean)
    .join("\n\n");
}

function renderCollections(): string {
  return COLLECTIONS.filter((c) => c.aiAccessible)
    .map((c) => {
      const model = c.model ? ` Model: ${c.model}.` : "";
      const fields = ` Fields: ${c.fields.join(", ")}.`;
      const sensitive = c.sensitiveFields?.length
        ? ` NEVER expose: ${c.sensitiveFields.join(", ")}.`
        : "";
      return `  - ${c.name}: ${c.purpose}${model}${fields}${sensitive}`;
    })
    .join("\n");
}

function renderBlockedCollections(): string {
  const blocked = COLLECTIONS.filter((c) => !c.aiAccessible);
  if (blocked.length === 0) return "  - none";
  return blocked.map((c) => `  - ${c.name}: ${c.purpose}`).join("\n");
}

function renderDropdowns(): string {
  const line = (status: "active" | "hidden") =>
    DROPDOWNS.filter((d) => d.status === status)
      .map((d) => `${d.label} (${d.key})`)
      .join(", ");

  return `  - Active: ${line("active")}.\n  - Hidden: ${line("hidden")}.`;
}

export const PLATFORM_KNOWLEDGE = `SM ENGINEER PORTAL — PLATFORM ARCHITECTURE

The SM Engineer Portal is a shipboard marine engineering management platform. It helps marine engineers track maintenance work, manage equipment, comply with regulations and log environmental operations. The platform features an AI assistant named Michail (you).

This document describes the portal's architecture — its routes, data store, data models and current controls. It does not grant access to any data; only the tool results in this conversation do.

================================================================================
ROUTES AND FEATURES
================================================================================
${renderRoutes()}

================================================================================
DATA STORE — FIRESTORE COLLECTIONS
================================================================================
${renderCollections()}

COLLECTIONS THE ASSISTANT MUST NEVER QUERY:
${renderBlockedCollections()}

================================================================================
CONFIGURED DROPDOWNS
================================================================================
${renderDropdowns()}

================================================================================
PLATFORM CONVENTIONS
================================================================================
${PLATFORM_CONVENTIONS.map((c) => `- ${c}`).join("\n")}

================================================================================
AI DATA ACCESS POLICY
================================================================================
- Operational data only: work logs, equipment, regulations, environmental logs, dropdown configuration, crew roster (operational fields only), Chief Engineer orders and their per-crew duty entries.
- Never read, expose or discuss personal privacy data, passwords, API keys, access tokens, internal secrets, authentication data, credentials, financial data or AI chat history.
- The crew roster's email and role fields are reserved for a future crew-login phase and are NEVER shown. If a question depends on them, say the information is not available.
- If asked for any of the above, politely refuse and offer an operational alternative (for example, a crew member's rank or duty completion instead of their email).
- When a module is marked hidden or placeholder above, describe it honestly as not currently available in the navigation.`;
