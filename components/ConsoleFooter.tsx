import { PROFILE } from "@/content/profile";
export function ConsoleFooter() {
  return (
    <footer className="console-footer">
      <span>
        © 2026 {PROFILE.name} <span className="accent">{"//"}</span> Viral Architect
      </span>
      <a href="#initialize">Back to top ↑</a>
    </footer>
  );
}
