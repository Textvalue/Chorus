Feedback & progress — the brand's signature "how in-tune are you" surfaces.

```jsx
<TuneScore value={96} />
<ProgressBar value={60} tone="teal" showLabel />
<ProgressMeter items={[
  { label: 'Brand DNA', value: 100 },
  { label: 'Voice Match', value: 96 },
  { label: 'Audience', value: 80 },
  { label: 'Team', value: 60 },
]} />
```

`TuneScore` is the green confidence ring ("96% sounds like you"). `ProgressMeter` renders maturity rows — 100% flips the row to green with a check. Keep framing warm: progress, never failure.
