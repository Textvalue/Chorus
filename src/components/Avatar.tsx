import { avatarColor, initials } from "@/lib/avatar";

export function Avatar({ name, lg, src }: { name: string; lg?: boolean; src?: string | null }) {
  if (src) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img className={`ava${lg ? " lg" : ""}`} src={src} alt={name} style={{ objectFit: "cover" }} />
    );
  }
  return (
    <div className={`ava${lg ? " lg" : ""}`} style={{ background: avatarColor(name) }}>
      {initials(name)}
    </div>
  );
}
