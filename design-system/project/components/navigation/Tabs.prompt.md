Navigation — tab bars and the onboarding step list.

```jsx
<Tabs tabs={[
  { id: 'drafts', label: 'Drafts', count: 3 },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
]} value="drafts" onChange={id => {}} />

<StepNav current={1} steps={[
  'About your company', 'Brand DNA', 'Audience', 'Team', 'Voice & tone',
]} />
```

`Tabs` active indicator is teal; optional `count` pills. `StepNav` marks done steps green (check) and the current step blue.
