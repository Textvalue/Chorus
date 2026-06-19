"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconCreate, IconIdeas, IconQueue, IconBrain } from "./Icons";

const NAV = [
  { href: "/create", label: "Create", Icon: IconCreate },
  { href: "/ideas", label: "Ideas", Icon: IconIdeas },
  { href: "/drafts", label: "Drafts", Icon: IconQueue },
  { href: "/brain-dump", label: "Brain", Icon: IconBrain },
];

export function Rail({ ownerInitials }: { ownerInitials: string }) {
  const path = usePathname();
  return (
    <aside className="rail">
      <div className="rmark">🎙</div>
      <nav className="rnav">
        {NAV.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className={path.startsWith(href) ? "on" : ""}>
            <Icon />
            <span className="rl">{label}</span>
          </Link>
        ))}
      </nav>
      <div className="ruser" title="Owner">
        {ownerInitials}
      </div>
    </aside>
  );
}
