import { fakeAvatar } from "@/lib/avatar";

export function Avatar({ name, lg, src }: { name: string; lg?: boolean; src?: string | null }) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      className={`ava${lg ? " lg" : ""}`}
      src={src || fakeAvatar(name)}
      alt={name}
      style={{ objectFit: "cover", background: "var(--accent-soft)" }}
    />
  );
}
