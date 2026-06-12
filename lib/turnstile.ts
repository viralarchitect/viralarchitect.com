/** Server-side Cloudflare Turnstile siteverify. */

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const SITEVERIFY_TIMEOUT_MS = 3000;

export type TurnstileVerifyResult =
  | { ok: true }
  | { ok: false; errorCodes: string[] };

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string | null,
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { ok: false, errorCodes: ["missing-secret"] };
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });
  if (remoteIp) body.set("remoteip", remoteIp);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SITEVERIFY_TIMEOUT_MS);

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: controller.signal,
    });

    if (!res.ok) {
      return { ok: false, errorCodes: [`http-${res.status}`] };
    }

    const data = (await res.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };

    if (data.success) return { ok: true };
    return { ok: false, errorCodes: data["error-codes"] ?? ["unknown"] };
  } catch {
    return { ok: false, errorCodes: ["network-error"] };
  } finally {
    clearTimeout(timeout);
  }
}

export function clientIpFromHeaders(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return headers.get("x-real-ip");
}
