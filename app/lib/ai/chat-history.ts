import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const COLLECTION = "aiChats";

export interface ChatEntry {
  id?: string;
  title: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  createdAt?: any;
}

/** Get all chat sessions (titles + timestamps only) */
export async function getAllChats(): Promise<ChatEntry[]> {
  const q = query(collection(db, COLLECTION), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatEntry));
}

/** Get a single chat session */
export async function getChat(id: string): Promise<ChatEntry | null> {
  const d = await getDoc(doc(db, COLLECTION, id));
  if (!d.exists()) return null;
  return { id: d.id, ...d.data() } as ChatEntry;
}

/** Create a new chat session, return its ID */
export async function createChat(title: string): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    title: title || "New Chat",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Update chat title */
export async function updateChatTitle(id: string, title: string) {
  await updateDoc(doc(db, COLLECTION, id), {
    title,
    updatedAt: serverTimestamp(),
  });
}

/** Delete a chat session and all its messages */
export async function deleteChat(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}

// ─── Messages (subcollection) ───

const MESSAGES_SUB = "messages";

/** Get all messages for a chat */
export async function getChatMessages(chatId: string): Promise<ChatMessage[]> {
  const q = query(
    collection(db, COLLECTION, chatId, MESSAGES_SUB),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as unknown as ChatMessage);
}

/** Add a message to a chat */
export async function addChatMessage(
  chatId: string,
  role: "user" | "assistant",
  text: string
) {
  const msgRef = await addDoc(
    collection(db, COLLECTION, chatId, MESSAGES_SUB),
    { role, text, createdAt: serverTimestamp() }
  );
  // Update parent's updatedAt
  await updateDoc(doc(db, COLLECTION, chatId), {
    updatedAt: serverTimestamp(),
  });
  return msgRef.id;
}
