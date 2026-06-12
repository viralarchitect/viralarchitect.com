"use client";

import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    uplinkTurnstileSuccess?: (token: string) => void;
    uplinkTurnstileError?: () => void;
    uplinkTurnstileExpired?: () => void;
    turnstile?: {
      reset: (widgetId?: string) => void;
    };
  }
}

type TurnstileWidgetProps = {
  onToken: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
};

export function TurnstileWidget({
  onToken,
  onError,
  onExpire,
}: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey) return;

    window.uplinkTurnstileSuccess = onToken;
    window.uplinkTurnstileError = () => onError?.();
    window.uplinkTurnstileExpired = () => onExpire?.();

    return () => {
      delete window.uplinkTurnstileSuccess;
      delete window.uplinkTurnstileError;
      delete window.uplinkTurnstileExpired;
    };
  }, [siteKey, onToken, onError, onExpire]);

  if (!siteKey) {
    return (
      <p className="hexline err uplink-turnstile-warn">
        WARN :: TURNSTILE SITE KEY UNCONFIGURED
      </p>
    );
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <div className="uplink-turnstile">
        <div
          className="cf-turnstile"
          data-sitekey={siteKey}
          data-theme="dark"
          data-action="uplink-submit"
          data-callback="uplinkTurnstileSuccess"
          data-error-callback="uplinkTurnstileError"
          data-expired-callback="uplinkTurnstileExpired"
        />
      </div>
    </>
  );
}

export function resetTurnstileWidget(): void {
  window.turnstile?.reset();
}
