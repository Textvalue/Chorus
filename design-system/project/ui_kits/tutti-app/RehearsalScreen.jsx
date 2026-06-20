// Tutti app — Rehearsal: drafts & approval queue.
const { Card, Button, Badge, Avatar, Tabs } = window.DesignSystem_42715e;

function QueueRow({ name, instrument, status, text, score }) {
  const tone = { Draft: 'neutral', Pending: 'blue', Approved: 'green', Scheduled: 'teal' }[status];
  return (
    <div style={{ display: 'flex', gap: 14, padding: '16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <Avatar name={name} instrument={instrument} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-strong)' }}>{name}</span>
          <Badge tone={tone}>{status}</Badge>
          {score && <Badge tone="green">{score}% in tune</Badge>}
        </div>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</p>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {status === 'Pending'
          ? <><Button variant="success" size="sm">Approve</Button><Button variant="ghost" size="sm">Edit</Button></>
          : <Button variant="secondary" size="sm">Open</Button>}
      </div>
    </div>
  );
}

function RehearsalScreen() {
  const TopBar = window.TuttiTopBar;
  const [tab, setTab] = React.useState('pending');
  const rows = {
    pending: [
      ['Maya Patel', 'Violin', 'Pending', 'Your employee advocacy program is making everyone sound the same…', 96],
      ['Jordan Lee', 'Cello', 'Pending', 'Most advocacy tools optimize for the wrong thing: volume…', 94],
    ],
    drafts: [
      ['Taylor Kim', 'Flute', 'Draft', 'Three things I changed about how our team shows up on LinkedIn…', 88],
      ['Casey Brown', 'Timpani', 'Draft', 'A quick story about the first time a post actually landed…', 71],
    ],
    approved: [
      ['Maya Patel', 'Violin', 'Approved', 'The blank page is not a talent problem. It is a tuning problem…', 97],
      ['Alex Johnson', 'Conductor', 'Scheduled', 'We stopped measuring posts by volume. Here is what happened…', 95],
    ],
  };
  const list = rows[tab] || [];
  return (
    <div>
      <TopBar
        title="Rehearsal"
        subtitle="Drafts, feedback, approvals. Every edit teaches the model."
        action={<Button variant="accent">Start a Tutti campaign</Button>}
      />
      <Card>
        <Tabs value={tab} onChange={setTab} tabs={[
          { id: 'pending', label: 'Pending', count: 2 },
          { id: 'drafts', label: 'Drafts', count: 2 },
          { id: 'approved', label: 'Approved & Live' },
        ]} style={{ marginBottom: 6 }} />
        {list.map((r, i) => <QueueRow key={i} name={r[0]} instrument={r[1]} status={r[2]} text={r[3]} score={r[4]} />)}
        <div style={{ paddingTop: 14, fontSize: 13, color: 'var(--text-muted)' }}>
          Reject is a correction, not a failure — it just helps the next draft land closer.
        </div>
      </Card>
    </div>
  );
}
window.TuttiRehearsalScreen = RehearsalScreen;
