// Tutti app — Studio (home dashboard): progression, in-tune score, reach, ensemble.
const { Card, Badge, Stat, TuneScore, ProgressMeter, Avatar, Button } = window.DesignSystem_42715e;

function TopBar({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-strong)' }}>{title}</h2>
        {subtitle && <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: 15 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
window.TuttiTopBar = TopBar;

function StudioScreen({ setRoute }) {
  const I = window.TuttiIcons;
  return (
    <div>
      <TopBar
        title="You're getting in tune"
        subtitle="Keep going — beautiful sounds ahead."
        action={<Button variant="primary" iconLeft={I.create({ size: 16, color: '#fff' })} onClick={() => setRoute('create')}>Create a post</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          <TuneScore value={96} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-accent)', marginBottom: 14 }}>Character progression</div>
            <ProgressMeter items={[
              { label: 'Brand DNA', value: 100 },
              { label: 'Voice Match', value: 96 },
              { label: 'Audience', value: 80 },
              { label: 'Team', value: 60 },
              { label: 'Guidelines', value: 40 },
            ]} />
          </div>
        </Card>

        <Card style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <img src="../../assets/badge-on-key.png" alt="" style={{ height: 96 }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-strong)' }}>New badge earned</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>On Key · your drafts pass Sounds Flat first try</div>
          </div>
          <Badge tone="green">+150 XP · Rising Star next</Badge>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Fill the stadium</div>
            <Badge tone="green">↑ 78%</Badge>
          </div>
          <Stat value="12.4M" label="Total impressions · last 30 days" />
          <img src="../../assets/venue-ladder.png" alt="Practice Room → Stadium" style={{ width: '100%', marginTop: 18 }} />
        </Card>

        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>Your ensemble</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[['Maya Patel', 'Violin', 96], ['Jordan Lee', 'Cello', 92], ['Taylor Kim', 'Flute', 88], ['Casey Brown', 'Timpani', 71]].map(([n, inst, score]) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar name={n} instrument={inst} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-strong)' }}>{n}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{inst}</div>
                </div>
                <Badge tone={score >= 90 ? 'green' : 'teal'}>{score}% in tune</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
window.TuttiStudioScreen = StudioScreen;
