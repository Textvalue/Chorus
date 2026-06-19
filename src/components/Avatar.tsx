import { avatarColor, initials } from "@/lib/avatar";

export function Avatar({ name, lg }: { name: string; lg?: boolean }) {
  return (
    <div className={`ava${lg ? " lg" : ""}`} style={{ background: avatarColor(name) }}>
      {initials(name)}
    </div>
  );
}
