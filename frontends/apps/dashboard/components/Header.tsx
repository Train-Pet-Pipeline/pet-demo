import { PrivacyBadge } from "./PrivacyBadge";

export function Header() {
  return (
    <header className="border-b border-b-mute-soft">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="font-serif text-h2 text-ink">Purr·AI</div>
        <PrivacyBadge />
      </div>
    </header>
  );
}
