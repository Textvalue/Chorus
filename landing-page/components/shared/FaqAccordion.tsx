/** Native <details> accordion — zero JS, reduced-motion safe by construction. First item open. */
export function FaqAccordion({ items }: { items: { q: string; a: React.ReactNode }[] }) {
  return (
    <div className="border-y border-rule">
      {items.map((it, i) => (
        <details key={i} className="group border-b border-rule last:border-b-0" open={i === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-[1.05rem] font-medium text-ink">
            {it.q}
            <span
              aria-hidden
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-rule text-ink-faint transition-transform duration-300 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="-mt-1 max-w-2xl pb-5 text-body text-ink-soft">{it.a}</div>
        </details>
      ))}
    </div>
  );
}
