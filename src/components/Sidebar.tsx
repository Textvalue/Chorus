"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Icon, type IconName, Avatar, Brandmark, brandInitials } from "./ds";
import { RestartOnboarding } from "./RestartOnboarding";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/create", label: "Create", icon: "create" },
  { href: "/ideas", label: "Ideas", icon: "ideas" },
  { href: "/queue", label: "Queue", icon: "queue" },
  { href: "/engage", label: "Engage", icon: "engage" },
  { href: "/analytics", label: "Analytics", icon: "analytics" },
  { href: "/voice", label: "Voice", icon: "voice" },
];

export function Sidebar({
  user,
  org,
}: {
  user: { name: string; role: string };
  org: { name: string; memberCount: number };
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const isOn = (href: string) => path === href || path.startsWith(href + "/");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Desktop icon rail */}
      <aside className="rail">
        <Link href="/create" className="bmk-link" aria-label="Tutti home">
          <Brandmark size="md" />
        </Link>
        <nav className="rnav">
          {NAV.map((it) => {
            const Ico = Icon[it.icon];
            return (
              <Link key={it.href} href={it.href} className={`rbtn${isOn(it.href) ? " on" : ""}`}>
                <Ico size={21} />
                <span className="rl">{it.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="rspacer" />
        <button className="ravatar" onClick={() => setOpen((v) => !v)} aria-label="Workspace and account">
          <Avatar name={user.name} size={36} />
        </button>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="tabbar">
        {NAV.map((it) => {
          const Ico = Icon[it.icon];
          return (
            <Link key={it.href} href={it.href} className={`tbtn${isOn(it.href) ? " on" : ""}`}>
              <Ico size={21} />
              <span className="tl">{it.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings popover */}
      {open && <div className="smask on" onClick={() => setOpen(false)} />}
      <div className={`smenu${open ? " on" : ""}`}>
        <div className="sworkspace">
          <span className="swlogo">{brandInitials(org.name)}</span>
          <div style={{ minWidth: 0 }}>
            <div className="swn">{org.name}</div>
            <div className="swm">{org.memberCount} {org.memberCount === 1 ? "member" : "members"} · {user.role}</div>
          </div>
        </div>

        <Link href="/ensemble" className="sitem" onClick={() => setOpen(false)}>
          <Icon.ensemble size={17} /> Team
        </Link>
        <Link href="/optimize" className="sitem" onClick={() => setOpen(false)}>
          <Icon.target size={17} /> Profile optimizer
        </Link>
        <button className="sitem dim" disabled>
          <Icon.lock size={17} /> Roles &amp; permissions <span className="dimtag">soon</span>
        </button>
        <button className="sitem dim" disabled>
          <Icon.gear size={17} /> Workspace settings <span className="dimtag">soon</span>
        </button>

        <div className="sdiv" />

        <RestartOnboarding className="sitem">
          <Icon.refresh size={17} /> Replay first-run
        </RestartOnboarding>
        <button className="sitem" onClick={() => signOut({ redirectTo: "/login" })}>
          <Icon.logout size={17} /> Sign out
        </button>
      </div>
    </>
  );
}
