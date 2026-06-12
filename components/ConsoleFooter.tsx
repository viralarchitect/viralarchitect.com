import { HexCode } from "@/components/HexCode";

export function ConsoleFooter() {
  return (
    <footer className="console-footer">
      <span>
        © 2026 <b>NICHOLAS KING</b> {"// VIRAL ARCHITECT"}
      </span>
      <span>
        BUILD <HexCode digits={6} ticking={false} />
      </span>
      <span>
        <span className="dot green" /> ALL SYSTEMS NOMINAL
      </span>
    </footer>
  );
}
