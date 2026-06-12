import nodemailer from "nodemailer";
import { UPLINK } from "@/content/profile";

export type UplinkMailInput = {
  callsign: string;
  replyTo: string;
  message: string;
};

let cachedTransport: nodemailer.Transporter | null = null;

function mailTransport(): nodemailer.Transporter {
  if (cachedTransport) return cachedTransport;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("GMAIL credentials not configured");
  }

  cachedTransport = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return cachedTransport;
}

function safeHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export async function sendUplinkMail(input: UplinkMailInput): Promise<void> {
  const fromUser = process.env.GMAIL_USER;
  if (!fromUser) throw new Error("GMAIL_USER not configured");

  const callsign = safeHeaderValue(input.callsign);
  const replyTo = safeHeaderValue(input.replyTo);
  const transport = mailTransport();
  await transport.sendMail({
    from: `"Uplink Terminal" <${fromUser}>`,
    to: UPLINK.deliverTo,
    replyTo,
    subject: `[UPLINK] Transmission from ${callsign}`,
    text: [
      input.message,
      "",
      `// RETURN FREQ: ${replyTo}`,
      `// CALLSIGN: ${callsign}`,
    ].join("\n"),
  });
}
