import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { DropdownDoc } from "../types";

/**
 * Fetch a single dropdown document by key.
 */
export const getDropdown = async (key: string): Promise<DropdownDoc | null> => {
  const docSnap = await getDoc(doc(db, "dropdowns", key));
  return docSnap.exists() ? (docSnap.data() as DropdownDoc) : null;
};

/**
 * Fetch ALL dropdown documents and return as a map: { [key]: DropdownDoc }.
 * Useful for populating multiple filter dropdowns in one request.
 */
export const getAllDropdownsMap = async (): Promise<
  Record<string, DropdownDoc>
> => {
  const snap = await getDocs(collection(db, "dropdowns"));
  const map: Record<string, DropdownDoc> = {};
  snap.forEach((doc) => {
    map[doc.id] = doc.data() as DropdownDoc;
  });
  return map;
};

/**
 * Get the options array for a specific dropdown key.
 * Returns an empty array if the key doesn't exist.
 */
export const getDropdownOptions = async (
  key: string
): Promise<string[]> => {
  const doc = await getDropdown(key);
  return doc?.options ?? [];
};