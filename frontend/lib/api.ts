const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Thrown when the API server can't be reached at all (backend not running,
 *  DNS/connection failure, request blocked). It's an ApiError with status 0
 *  so every caller's existing `err instanceof ApiError` handling covers it
 *  and a bare `TypeError: Failed to fetch` never escapes to the console. */
export class ApiUnreachableError extends ApiError {
  constructor(url: string) {
    super(0, `Can't reach the API at ${url}. Is the backend running?`);
    this.name = "ApiUnreachableError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    // fetch() rejects (with a TypeError) only on a network-level failure --
    // the server is down/unreachable, not an HTTP error status. Normalise
    // it so it's handled like any other API failure.
    throw new ApiUnreachableError(API_URL);
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.detail ?? message;
    } catch {
      // response had no JSON body
    }

    // A 401 on a protected endpoint means the session cookie is missing,
    // expired, or points at a user that no longer exists (e.g. a stale
    // cookie from before a database reset). /auth/* is excluded because a
    // 401 there is either the expected "not logged in yet" check on mount
    // or a bad-credentials response that the login/register forms already
    // display inline -- redirecting on those would be wrong.
    if (res.status === 401 && !path.startsWith("/auth/") && typeof window !== "undefined") {
      // This is a plain module, not a component, so useRouter() isn't
      // available -- and a full navigation is actually wanted here, to
      // discard any stale in-memory state left over from the dead session.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/login";
    }

    throw new ApiError(res.status, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
