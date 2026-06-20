Form controls for Tutti — inputs, text areas, toggles, checkboxes. Use anywhere the user enters or toggles data (tuning, create, settings).

```jsx
<Input label="Company URL" prefix="🔗" placeholder="trytutti.com" />
<Textarea label="Riff" rows={4} placeholder="Brain-dump a messy idea…" />
<Switch label="Serious-buyer mode" checked onChange={v => {}} />
<Checkbox label="Use my real posts as samples" checked />
```

Focus ring is blue; Switch "on" is teal; Checkbox "on" is green. All accept `disabled`. `Input` supports `error` (rendered in green-tinted text, the brand's success-leaning palette).
