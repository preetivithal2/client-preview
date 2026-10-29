import { READ_ONLY_REFUSAL, READ_ONLY_TOOL_NAMES } from "./tools";

/**
 * AI security guardrails.
 *
 * Two independent layers:
 *  1. Tool allowlist — the assistant may only execute the read-only tools
 *     declared in TOOL_SCHEMAS. Anything else is refused before it reaches
 *     Firestore.
 *  2. Sensitive-request pre-check — obvious requests for credentials, secrets
 *     or personal data are refused before the model is called, so they cannot
 *     be talked around by prompt injection.
 *
 * The system prompt carries the same policy in natural language. These checks
 * are defence in depth, not a replacement for it.
 */

/** Answer used when a request asks for private or secret information. */
export const PRIVACY_REFUSAL =
  "I'm sorry, but I can't help with that. I don't have access to user passwords, personal privacy data, API keys, or financial secrets. I'm also read-only for operational portal data. I can help with work logs, equipment, environmental logs, crew duties, crew performance or regulations.";

/** Answer used when the model asks for a tool outside the read-only allowlist. */
export const TOOL_REFUSAL = READ_ONLY_REFUSAL;

export function isReadOnlyTool(name: unknown): name is string {
  return typeof name === "string" && READ_ONLY_TOOL_NAMES.has(name);
}

/**
 * Conservative patterns for requests that ask the assistant to reveal or look
 * up private/secret data. Patterns are matched against the raw user message.
 * Keep them specific enough not to catch normal engineering vocabulary.
 */
const SENSITIVE_PATTERNS: RegExp[] = [
  /\bpassword(s)?\b/i,
  /\bpasswd\b/i,
  /\bpass\s?phrase\b/i,
  /\bapi[\s_-]?key(s)?\b/i,
  /\baccess[\s_-]?key(s)?\b/i,
  /\bsecret[\s_-]?key(s)?\b/i,
  /\bprivate[\s_-]?key(s)?\b/i,
  /\bencryption[\s_-]?key(s)?\b/i,
  /\bsecret(s)?\b/i,
  /\bcredential(s)?\b/i,
  /\baccess[\s_-]?token(s)?\b/i,
  /\brefresh[\s_-]?token(s)?\b/i,
  /\bbearer[\s_-]?token(s)?\b/i,
  /\bauth(orization)?[\s_-]?token(s)?\b/i,
  /\bsession[\s_-]?token(s)?\b/i,
  /\b(\.env|env\s+file|environment\s+variable(s)?)\b/i,
  /\bfirebase\s+(admin\s+)?config\b/i,
  /\bservice[\s_-]?account(s)?\b/i,
  /\bclient[\s_-]?secret(s)?\b/i,
  /\b(system|developer|hidden)\s+(prompt|instructions?)\b/i,
  /\b(reveal|show|tell|print|repeat)\b.{0,30}\b(instructions?|prompt)\b/i,
  /\bpersonal\s+(privacy\s+)?(data|information|details)\b/i,
  /\bprivate\s+(data|information|details)\b/i,
  /\b(e-?mail|phone|mobile|home)\s+(address|number)\b/i,
  /\bpassport\s+(number|no\.?)\b/i,
  /\bnational\s+(id|identification)\b/i,
  /\bdate\s+of\s+birth\b/i,
  /\bbank\s+(account|details)\b/i,
  /\bcredit\s+card\s+(number|details)\b/i,
  /\b(iban|swift|bic)\b/i,
  /\b(salary|payroll|wages?)\b/i,
];

/**
 * True when the message clearly asks for private or secret information.
 * The check is intentionally narrow: a false negative is handled by the
 * system prompt, while a false positive would block a legitimate question.
 */
export function detectSensitiveRequest(message: string): boolean {
  if (typeof message !== "string" || !message.trim()) return false;
  const text = message.replace(/\s+/g, " ").trim();
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(text));
}

export interface SafeChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MAX_HISTORY_MESSAGES = 30;
const MAX_MESSAGE_CHARS = 8000;

/**
 * Accept only user/assistant turns with string content from the client.
 * This prevents a caller from injecting a fake `system` message (which would
 * let them replace the assistant's instructions) or oversized payloads.
 */
export function sanitizeHistory(input: unknown): SafeChatMessage[] {
  if (!Array.isArray(input)) return [];

  const out: SafeChatMessage[] = [];
  for (const item of input.slice(-MAX_HISTORY_MESSAGES)) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string" || !content.trim()) continue;
    out.push({ role, content: content.slice(0, MAX_MESSAGE_CHARS) });
  }
  return out;
}
