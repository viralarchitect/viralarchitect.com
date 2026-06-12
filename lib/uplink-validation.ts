/** Shared Uplink form validation (client + server). */

export const UPLINK_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const UPLINK_MAX_CALLSIGN = 120;
export const UPLINK_MAX_MESSAGE = 5000;

export type UplinkPayload = {
  callsign: string;
  freq: string;
  msg: string;
  turnstileToken: string;
  _checksum?: string;
};

export type UplinkFieldError =
  | "INCOMPLETE"
  | "FREQ_MALFORMED"
  | "CALLSIGN_INVALID"
  | "CALLSIGN_TOO_LONG"
  | "MESSAGE_TOO_LONG"
  | "BOT_CHECK_MISSING";

const UPLINK_CONTROL_CHAR_RE = /[\u0000-\u001F\u007F]/;

export function validateUplinkFields(
  input: Partial<UplinkPayload>,
): UplinkFieldError | null {
  const callsign = String(input.callsign ?? "").trim();
  const freq = String(input.freq ?? "").trim();
  const msg = String(input.msg ?? "").trim();
  const turnstileToken = String(input.turnstileToken ?? "").trim();

  if (!callsign || !freq || !msg) return "INCOMPLETE";
  if (!UPLINK_EMAIL_RE.test(freq)) return "FREQ_MALFORMED";
  if (UPLINK_CONTROL_CHAR_RE.test(callsign)) return "CALLSIGN_INVALID";
  if (callsign.length > UPLINK_MAX_CALLSIGN) return "CALLSIGN_TOO_LONG";
  if (msg.length > UPLINK_MAX_MESSAGE) return "MESSAGE_TOO_LONG";
  if (!turnstileToken) return "BOT_CHECK_MISSING";
  return null;
}

export function uplinkFieldErrorMessage(code: UplinkFieldError): string {
  switch (code) {
    case "INCOMPLETE":
      return "ERROR :: TRANSMISSION INCOMPLETE — ALL FIELDS REQUIRED";
    case "FREQ_MALFORMED":
      return "ERROR :: RETURN FREQ MALFORMED — EXPECTED OPERATOR@DOMAIN.TLD";
    case "CALLSIGN_INVALID":
      return "ERROR :: CALLSIGN CONTAINS INVALID CHARACTERS";
    case "CALLSIGN_TOO_LONG":
      return "ERROR :: CALLSIGN EXCEEDS MAX LENGTH";
    case "MESSAGE_TOO_LONG":
      return "ERROR :: MESSAGE PAYLOAD EXCEEDS MAX LENGTH";
    case "BOT_CHECK_MISSING":
      return "ERROR :: BOT CHECK INCOMPLETE — RETRY CHALLENGE";
    default: {
      const _exhaustive: never = code;
      return _exhaustive;
    }
  }
}
