/**
 * Client-side student session storage.
 *
 * Kept separate from `student-auth.ts` because that module imports
 * `node:crypto` and the Supabase service-role client — importing it from a
 * route guard would pull server-only code into the browser bundle.
 *
 * Every accessor is SSR-safe: `localStorage` does not exist while rendering
 * on the server, and touching it there throws a ReferenceError that surfaces
 * as a blank page.
 */

export const STUDENT_SESSION_KEY = "student_session";

const hasWindow = () => typeof window !== "undefined";

export function getStudentToken(): string | null {
  if (!hasWindow()) return null;
  try {
    return window.localStorage.getItem(STUDENT_SESSION_KEY);
  } catch {
    // Private browsing / storage disabled
    return null;
  }
}

export function setStudentToken(token: string): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(STUDENT_SESSION_KEY, token);
  } catch {
    /* ignore */
  }
}

export function clearStudentToken(): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.removeItem(STUDENT_SESSION_KEY);
  } catch {
    /* ignore */
  }
}
