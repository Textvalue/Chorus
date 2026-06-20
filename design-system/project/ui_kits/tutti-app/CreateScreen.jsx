// Tutti app — Create: topic → two members' drafts, Sounds Flat gate, "why this sounds like you".
const { Card, Button, Textarea, Badge, Avatar, TuneScore } = window.DesignSystem_42715e;

function WhyRow({ k, v }) {
  return (
    <div style={{ display: 'flex', gap: 10, fontSize: 13, padding: '4px 0' }}>
      <span style={{ width: 84, flex: 'none', color: 'var(--text-muted)' }}>{k}</span>
      <span style={{ color: 'var(--text-body)', fontWeight: 500 }}>{v}</span>
    </div>
  );
}

function DraftCard({ name, instrument, score, body, why }) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar name={name} instrument={instrument} size={40} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)' }}>{name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{instrument} · their part</div>
        </div>
        <Badge tone="green">In tune · {score}%</Badge>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-body)', whiteSpace: 'pre-line', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>{body}</div>
      <div style={{ borderTop: '1px dashed var(--border-strong)', paddingTop: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-accent)', marginBottom: 4 }}>Why this sounds like you</div>
        {why.map((w) => <WhyRow key={w[0]} k={w[0]} v={w[1]} />)}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="success" size="sm">Approve</Button>
        <Button variant="ghost" size="sm">Tweak</Button>
      </div>
    </Card>
  );
}

function CreateScreen() {
  const TopBar = window.TuttiTopBar;
  const I = window.TuttiIcons;
  const [generated, setGenerated] = React.useState(true);
  return (
    <div>
      <TopBar title="Create" subtitle="One topic. Each member in their own voice." />

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <Badge tone="teal">Belief used</Badge>
          <span style={{ fontSize: 14, color: 'var(--text-body)' }}>"Employee advocacy is unison — lifeless noise."</span>
        </div>
        <Textarea rows={2} defaultValue="Why pushing the same post to every employee kills your brand." />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {I.sparkles({ size: 15, color: 'var(--teal-500)' })} Anchored to real samples + the Score · context loaded
          </span>
          <Button variant="primary" iconLeft={I.sparkles({ size: 16, color: '#fff' })} onClick={() => setGenerated(true)}>Generate for the team</Button>
        </div>
      </Card>

      {/* Sounds Flat gate demonstration */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--green-50)', border: '1px solid var(--green-100)', marginBottom: 20 }}>
        {I.check({ size: 18, color: 'var(--green-600)' })}
        <span style={{ fontSize: 14, color: 'var(--green-700)', fontWeight: 600 }}>Sounds Flat passed.</span>
        <span style={{ fontSize: 14, color: 'var(--text-body)' }}>One generic draft was caught and quietly regenerated — you only see the in-tune ones.</span>
      </div>

      {generated && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <DraftCard
            name="Maya Patel" instrument="Violin" score={96}
            body={"Your employee advocacy program is making everyone sound the same.\n\nI watched a 40-person team post the identical paragraph last week. Forty cellos, one note. That's not reach — it's an echo.\n\nGive people the score, not the script."}
            why={[['Belief', 'unison vs harmony'], ['Hook', 'pattern interrupt'], ['Your words', '"echo", "the score"'], ['Rhythm', 'short, punchy lines']]}
          />
          <DraftCard
            name="Jordan Lee" instrument="Cello" score={94}
            body={"Most advocacy tools optimize for the wrong thing: volume.\n\nWe ran the math on a client's team. Same post, 30 shares, near-zero replies. The algorithm reads sameness as spam.\n\nDistinct voices on one strategy beat identical voices every time."}
            why={[['Belief', 'reward value not volume'], ['Hook', 'data-led'], ['Your words', '"ran the math"'], ['Rhythm', 'measured, analytical']]}
          />
        </div>
      )}
    </div>
  );
}
window.TuttiCreateScreen = CreateScreen;
