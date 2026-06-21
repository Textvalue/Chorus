"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, type Transition } from "motion/react";
import { Icon, type IconName, Avatar, Brandmark, brandInitials } from "./ds";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/create", label: "Create", icon: "create" },
  { href: "/ideas", label: "Ideas", icon: "ideas" },
  { href: "/queue", label: "Queue", icon: "queue" },
  { href: "/engage", label: "Engage", icon: "engage" },
  { href: "/analytics", label: "Analytics", icon: "analytics" },
  { href: "/voice", label: "Voice", icon: "voice" },
];

const PILL: Transition = { type: "spring", stiffness: 520, damping: 36 };

export function Sidebar({
  user,
  org,
}: {
  user: { name: string; role: string };
  org: { name: string; memberCount: number };
}) {
  const path = usePathname();
  const router = useRouter();
  const reduced = usePrefersReducedMotion();
  const isOn = (href: string) => path === href || path.startsWith(href + "/");
  const pillT = reduced ? { duration: 0 } : PILL;

  async function replayFirstRun() {
    if (!window.confirm("Replay first-run? This clears your workspace and starts onboarding from scratch.")) return;
    await fetch("/api/onboarding/reset", { method: "POST" });
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <>
      {/* Desktop icon rail */}
      <aside className="rail">
        <Link href="/create" className="bmk-link" aria-label="Home">
          <Brandmark size="md" />
        </Link>
        <nav className="rnav">
          {NAV.map((it) => {
            const Ico = Icon[it.icon];
            const active = isOn(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                data-active={active}
                aria-current={active ? "page" : undefined}
                className="group relative flex w-16 flex-col items-center gap-1.5 rounded-xl py-2 text-[var(--text-muted)] transition-colors hover:text-[var(--text-strong)] data-[active=true]:text-[var(--accent-ink)] data-[active=true]:font-semibold"
              >
                {active && (
                  <motion.span
                    layoutId="rail-pill"
                    transition={pillT}
                    className="absolute inset-0 rounded-xl bg-[var(--accent-soft)]"
                  >
                    <span className="absolute top-1/2 left-0 h-6 w-[3px] -translate-y-1/2 rounded-r bg-[var(--accent)]" />
                  </motion.span>
                )}
                <span className="relative z-[1] flex flex-col items-center gap-1.5">
                  <Ico size={21} />
                  <span className="text-[10.5px] font-semibold tracking-[0.01em]">{it.label}</span>
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="rspacer" />

        {/* Workspace / account menu — base-ui DropdownMenu (focus-trap + ESC free). */}
        <DropdownMenu>
          <DropdownMenuTrigger className="ravatar" aria-label="Workspace and account">
            <Avatar name={user.name} size={36} />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" sideOffset={10} className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2.5 py-2">
                <span className="grid size-8 place-items-center rounded-md bg-[var(--ink-surface)] font-serif text-[15px] text-[var(--paper)]">
                  {brandInitials(org.name)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[var(--text-strong)]">{org.name}</span>
                  <span className="block text-[11.5px] font-normal text-[var(--text-muted)]">
                    {org.memberCount} {org.memberCount === 1 ? "member" : "members"} · {user.role}
                  </span>
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/ensemble")}>
              <Icon.ensemble size={16} /> Team
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/optimize")}>
              <Icon.target size={16} /> Profile optimizer
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="justify-between" title="Unlocks when a teammate joins">
              <span className="flex items-center gap-2">
                <Icon.lock size={16} /> Roles &amp; permissions
              </span>
              <Badge variant="secondary">team</Badge>
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="justify-between" title="Unlocks when a teammate joins">
              <span className="flex items-center gap-2">
                <Icon.gear size={16} /> Workspace settings
              </span>
              <Badge variant="secondary">admin</Badge>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={replayFirstRun}>
              <Icon.refresh size={16} /> Replay first-run
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut({ redirectTo: "/login" })}>
              <Icon.logout size={16} /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="tabbar">
        {NAV.map((it) => {
          const Ico = Icon[it.icon];
          const active = isOn(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              data-active={active}
              aria-current={active ? "page" : undefined}
              className="group relative flex flex-1 flex-col items-center gap-1 py-1.5 text-[var(--text-muted)] data-[active=true]:text-[var(--accent-ink)]"
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  transition={pillT}
                  className="absolute top-0 left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-b bg-[var(--accent)]"
                />
              )}
              <Ico size={21} />
              <span className="text-[9.5px] font-semibold">{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
