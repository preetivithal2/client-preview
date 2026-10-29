import { NextRequest } from "next/server";
import { getProvider } from "../../../lib/ai/getProvider";
import { TOOL_SCHEMAS, executeTool } from "../../../lib/ai/tools";
import { buildChatSystemPrompt } from "../../../lib/ai/system-prompt";
import {
  PRIVACY_REFUSAL,
  TOOL_REFUSAL,
  detectSensitiveRequest,
  isReadOnlyTool,
  sanitizeHistory,
} from "../../../lib/ai/security";
import type { ChatMessage, ToolCallResult } from "../../../lib/ai/providers/provider";

function sendSSE(stream: WritableStreamDefaultWriter, event: string, data: any) {
  const encoder = new TextEncoder();
  return stream.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
}

// ──────────────────────────────────────────────
// Simple in-memory rate limiter (per IP)
// Prevents AI token budget abuse
// ──────────────────────────────────────────────
const RATE_LIMIT = { windowMs: 60_000, max: 20 }; // 20 requests per minute per IP
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT.max;
}

const TOOL_SCHEMA_TOKENS_ESTIMATE = 1200;

/** Built once per server process — the manifest and tool list are static. */
const SYSTEM_PROMPT = buildChatSystemPrompt();

export async function POST(req: NextRequest) {
  try {
    // Rate limit check
    const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    if (isRateLimited(ip)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait a minute." }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { message, sessionId, history: clientHistory } = await req.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Cap the user turn and accept only genuine user/assistant history from the
    // client. Without this, a caller could inject a fake `system` message and
    // replace the assistant's security/privacy rules.
    const userMessage = message.trim().slice(0, 8000);
    const safeHistory = sanitizeHistory(clientHistory);

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    const response = new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });

    (async () => {
      try {
        // 1. Session tracking
        const chatId = sessionId || "session-" + Date.now();
        await sendSSE(writer, "session", { sessionId: chatId });

        await sendSSE(writer, "step", { text: "Analyzing your question..." });

        // 1b. Privacy pre-check — refuse obvious secret/personal-data requests
        // before any model call. The system prompt carries the same policy;
        // this is defence in depth against prompt injection.
        if (detectSensitiveRequest(userMessage)) {
          const completionTokens = Math.round(PRIVACY_REFUSAL.length / 4);
          await sendSSE(writer, "step", { text: "Generating response..." });
          await sendSSE(writer, "usage", {
            promptTokens: 0,
            completionTokens,
            totalTokens: completionTokens,
          });
          await sendSSE(writer, "token", { text: PRIVACY_REFUSAL });
          await sendSSE(writer, "done", {});
          return;
        }

        const provider = getProvider();
        if (!provider.chatWithTools) {
          throw new Error("AI provider does not support tool calling.");
        }

        // 2. Build the full message history with tools
        const aiMessages: ChatMessage[] = [
          { role: "system", content: SYSTEM_PROMPT },
          ...safeHistory,
          { role: "user", content: userMessage },
        ];

        // 3. Agent loop — call tools until the AI has enough data to answer
        const MAX_TOOL_ROUNDS = 6;
        // Store each round: raw assistant message + its executed tool results (interleaved correctly)
        let rounds: { rawMessage: any; toolResults: { toolCallId: string; result: string }[] }[] = [];
        let finalContent: string | null = null;

        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          // Build the message array: base history, then each round interleaved (assistant msg → its tool results)
          const messagesForCall: any[] = aiMessages.map((m) => ({ role: m.role, content: m.content }));

          for (const r of rounds) {
            messagesForCall.push(r.rawMessage);
            for (const tr of r.toolResults) {
              messagesForCall.push({
                role: "tool",
                tool_call_id: tr.toolCallId,
                content: tr.result,
              });
            }
          }

          const result: ToolCallResult = await provider.chatWithTools(messagesForCall, TOOL_SCHEMAS);

          if (result.toolCalls && result.toolCalls.length > 0) {
            // Execute each tool call for this round
            const currentRound: { rawMessage: any; toolResults: { toolCallId: string; result: string }[] } = {
              rawMessage: result.rawMessage,
              toolResults: [],
            };
            for (const tc of result.toolCalls) {
              // Enforce the read-only allowlist before touching Firestore.
              if (!isReadOnlyTool(tc.name)) {
                currentRound.toolResults.push({ toolCallId: tc.id, result: TOOL_REFUSAL });
                continue;
              }
              await sendSSE(writer, "step", { text: `Searching ${tc.name.replace(/_/g, " ")}...` });
              const toolResult = await executeTool(tc.name, tc.args);
              currentRound.toolResults.push({ toolCallId: tc.id, result: toolResult });
            }
            rounds.push(currentRound);
            continue; // go to next round with the interleaved results appended
          }

          // No more tool calls — this is the final answer
          finalContent = result.content;
          break;
        }

        if (finalContent === null) {
          finalContent = "I'm sorry, I couldn't complete that request. Please try again.";
        }

        await sendSSE(writer, "step", { text: "Generating response..." });

        // 4. Estimate token usage (includes system prompt + history + tool schemas + tool results)
        const inputText = [
          SYSTEM_PROMPT,
          ...aiMessages.slice(1).map((m) => m.content || ""),
          ...rounds.flatMap((r) => r.toolResults.map((t) => t.result)),
        ].join(" ");
        const promptTokens = Math.round(inputText.length / 4) + TOOL_SCHEMA_TOKENS_ESTIMATE;
        const completionTokens = Math.round(finalContent.length / 4);
        await sendSSE(writer, "usage", { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens });

        // 5. Stream the final answer
        await sendSSE(writer, "token", { text: finalContent });
        await sendSSE(writer, "done", {});
      } catch (err: any) {
        console.error("AI Chat error:", err);
        await sendSSE(writer, "error", { message: err.message || "Internal error" });
      } finally {
        await writer.close();
      }
    })();

    return response;
  } catch (error: any) {
    console.error("AI Chat API error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
