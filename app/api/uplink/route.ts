import { NextResponse, type NextRequest } from "next/server";
import { randHex } from "@/lib/format";
import {
  validateUplinkFields,
  uplinkFieldErrorMessage,
  type UplinkPayload,
} from "@/lib/uplink-validation";
import { clientIpFromHeaders, verifyTurnstileToken } from "@/lib/turnstile";
import { sendUplinkMail } from "@/lib/uplink-mail";

function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  let body: Partial<UplinkPayload>;
  try {
    body = (await req.json()) as Partial<UplinkPayload>;
  } catch {
    return jsonError(400, "ERROR :: PAYLOAD UNREADABLE");
  }

  const checksum = String(body._checksum ?? "");
  if (checksum.length > 0) {
    return jsonError(400, "ERROR :: TRANSMISSION REJECTED");
  }

  const fieldError = validateUplinkFields(body);
  if (fieldError) {
    return jsonError(400, uplinkFieldErrorMessage(fieldError));
  }

  const callsign = String(body.callsign).trim();
  const freq = String(body.freq).trim();
  const msg = String(body.msg).trim();
  const turnstileToken = String(body.turnstileToken).trim();

  const verify = await verifyTurnstileToken(
    turnstileToken,
    clientIpFromHeaders(req.headers),
  );
  if (!verify.ok) {
    return jsonError(403, "ERROR :: BOT CHECK FAILED — RETRY CHALLENGE");
  }

  try {
    await sendUplinkMail({
      callsign,
      replyTo: freq,
      message: msg,
    });
  } catch {
    return jsonError(502, "ERROR :: RELAY FAILURE — CHANNEL BUSY");
  }

  const ack = randHex(4);
  return NextResponse.json({ ack });
}
