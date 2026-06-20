"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Icon, type IconName, Avatar } from "./ds";
import { RestartOnboarding } from "./RestartOnboarding";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/studio", label: "Studio", icon: "studio" },
  { href: "/create", label: "Create", icon: "create" },
  { href: "/ideas", label: "Ideas", icon: "ideas" },
  { href: "/riff", label: "Riff", icon: "riff" },
  { href: "/rehearsal", label: "Rehearsal", icon: "rehearsal" },
  { href: "/ensemble", label: "Ensemble", icon: "ensemble" },
];

export function Sidebar({ user }: { user: { name: string; role: string; instrument?: string } }) {
  const path = usePathname();
  const isOn = (href: string) => path === href || path.startsWith(href + "/");
  return (
    <aside className="sidebar">
      <Link href="/studio" className="sbrand">
        <Image src="/brand/spark.png" alt="" width={26} height={26} style={{ height: 26, width: "auto", mixBlendMode: "multiply" }} />
        <span className="wm">tutti</span>
      </Link>

      <nav className="snav">
        {NAV.map((it) => {
          const Ico = Icon[it.icon];
          return (
            <Link key={it.href} href={it.href} className={isOn(it.href) ? "on" : ""}>
              <Ico size={19} />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sfoot">
        <div className="suser">
          <Avatar name={user.name} size={34} instrument={user.instrument} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="un">{user.name}</div>
            <div className="ur">{user.role}</div>
          </div>
        </div>
        <RestartOnboarding />
      </div>
    </aside>
  );
}
