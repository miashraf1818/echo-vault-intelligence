/**
 * Waitlist signup transport.
 *
 * Posts to a Formspree endpoint configured via `VITE_FORMSPREE_ID`. The id
 * defaults to the project's current form so a fresh checkout works, but
 * teams can override per-environment via env without code changes.
 *
 * Formspree's JSON endpoint expects a JSON body and returns
 * `{ ok: true }` on success, or an `errors[]` array on validation failure.
 * See https://help.formspree.io/hc/en-us/articles/360013470814 for the
 * full shape.
 */

const DEFAULT_FORMSPREE_ID = "xaqkaayp";

export class WaitlistError extends Error {
  constructor(
    public readonly code: "INVALID_EMAIL" | "RATE_LIMITED" | "NETWORK" | "SERVER",
    message: string,
  ) {
    super(message);
    this.name = "WaitlistError";
  }
}

interface FormspreeResponse {
  ok?: boolean;
  next?: string;
  errors?: Array<{ field?: string; code?: string; message: string }>;
}

/** RFC-5322-pragmatic email regex. Good enough for a waitlist signup. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= 254 && EMAIL_RE.test(trimmed);
}

/**
 * Submit *email* (plus optional metadata) to the configured Formspree form.
 *
 * Resolves on success. Rejects with a typed `WaitlistError` so callers can
 * branch on the failure mode and render specific copy.
 */
export async function joinWaitlist(
  email: string,
  metadata: Record<string, string> = {},
): Promise<void> {
  if (!isValidEmail(email)) {
    throw new WaitlistError("INVALID_EMAIL", "Please enter a valid email address.");
  }

  const formId =
    (import.meta.env?.VITE_FORMSPREE_ID as string | undefined)?.trim() ||
    DEFAULT_FORMSPREE_ID;
  const endpoint = `https://formspree.io/f/${formId}`;

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        // Default Formspree metadata fields. Visible in the dashboard
        // notifications so you can see where signups came from.
        _subject: "EchoVault AI — new waitlist signup",
        source: "echo-vault-intelligence /waitlist",
        ...metadata,
      }),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Network request failed";
    throw new WaitlistError("NETWORK", message);
  }

  if (res.status === 429) {
    throw new WaitlistError(
      "RATE_LIMITED",
      "Too many signups from this network. Try again shortly.",
    );
  }

  let body: FormspreeResponse | null = null;
  try {
    body = (await res.json()) as FormspreeResponse;
  } catch {
    // Non-JSON body — fall through to the generic error path.
  }

  if (!res.ok || (body && body.ok === false) || (body?.errors?.length ?? 0) > 0) {
    const firstError = body?.errors?.[0]?.message;
    throw new WaitlistError(
      "SERVER",
      firstError || `Signup failed (HTTP ${res.status})`,
    );
  }
}
