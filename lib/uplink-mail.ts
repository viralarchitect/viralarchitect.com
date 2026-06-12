import nodemailer from "nodemailer";
import { UPLINK } from "@/content/profile";

export type UplinkMailInput = {
  callsign: string;
  replyTo: string;
  message: string;
};

function mailTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("GMAIL credentials not configured");
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendUplinkMail(input: UplinkMailInput): Promise<void> {
  const fromUser = process.env.GMAIL_USER;
  if (!fromUser) throw new Error("GMAIL_USER not configured");

  const transport = mailTransport();
  await transport.sendMail({
    from: `"Uplink Terminal" <${fromUser}>`,
    to: UPLINK.deliverTo,
    replyTo: input.replyTo,
    subject: `[UPLINK] Transmission from ${input.callsign}`,
    text: [
      input.message,
      "",
      `// RETURN FREQ: ${input.replyTo}`,
      `// CALLSIGN: ${input.callsign}`,
    ].join("\n"),
  });
}
