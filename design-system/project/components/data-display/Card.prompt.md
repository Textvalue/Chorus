Display primitives — surfaces, pills, avatars, metrics. Compose these into screens.

```jsx
<Card interactive>…</Card>
<Badge tone="green">In tune · 96%</Badge>
<Badge tone="teal">Cello</Badge>
<Avatar name="Maya Patel" instrument="Violin" size={44} />
<Stat value="12.4M" label="Total impressions" delta="↑ 78% vs last 30 days" />
```

`Card` lifts on hover when `interactive`. `Badge` tones: neutral/blue/teal/green/amber/navy (soft by default). `Avatar` auto-tints initials and can show a teal instrument marker. `Stat` delta defaults to green (growth).
