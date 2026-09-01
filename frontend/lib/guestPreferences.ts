import type { GuestPreferences } from "@/lib/types";

// Namespaced to avoid clashing with anything else that might use
// localStorage on this origin.
const STORAGE_KEY = "smart-meal-planner:guest-preferences";

// Mirrors the Preference model's own column defaults on the backend
// (config.py's Preference.dietary_type/calorie_goal), and the same
// defaults get_current_user_or_guest_preference() falls back to when a
// guest hasn't set anything yet.
export const GUEST_PREFERENCES_DEFAULTS: GuestPreferences = {
  dietary_type: "omnivore",
  calorie_goal: 2000,
  allergies: [],
  disliked_foods: [],
};

export function getGuestPreferences(): GuestPreferences {
  if (typeof window === "undefined") return GUEST_PREFERENCES_DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return GUEST_PREFERENCES_DEFAULTS;
    const parsed = JSON.parse(raw);
    return { ...GUEST_PREFERENCES_DEFAULTS, ...parsed };
  } catch {
    // Private browsing, storage disabled, or corrupt JSON -- fall back to
    // defaults rather than breaking the page over a guest convenience.
    return GUEST_PREFERENCES_DEFAULTS;
  }
}

export function setGuestPreferences(preferences: GuestPreferences): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Ignore -- worst case the guest re-enters their preferences later.
  }
}

export function hasStoredGuestPreferences(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/** Query params matching get_current_user_or_guest_preference()'s expected
 * shape on the backend, for calling /meals/recommended as a guest. */
export function guestPreferencesToSearchParams(preferences: GuestPreferences): URLSearchParams {
  const params = new URLSearchParams();
  params.set("dietary_type", preferences.dietary_type);
  params.set("calorie_goal", String(preferences.calorie_goal));
  for (const allergy of preferences.allergies) params.append("allergies", allergy);
  for (const dislike of preferences.disliked_foods) params.append("disliked_foods", dislike);
  return params;
}

export function clearGuestPreferences(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
