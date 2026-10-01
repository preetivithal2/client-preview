export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ToolCall {
  id: string;
  name: string;
  args: any;
}

export interface ToolCallResult {
  content: string | null;
  toolCalls: ToolCall[] | null;
  /** Full raw assistant message from the API — must be replayed verbatim (includes reasoning_content) */
  rawMessage?: any;
}

export interface AiProvider {
  name: string;
  chat(messages: ChatMessage[]): Promise<string>;
  chatStream?(messages: ChatMessage[]): AsyncGenerator<string, void, unknown>;
  /** Send messages with tool schemas — returns either content or tool calls to execute */
  chatWithTools?(messages: ChatMessage[], tools: any[]): Promise<ToolCallResult>;
}
