// Tutti app — Ensemble: team roster, instruments, unison alarm.
const { Card, Button, Badge, Avatar, ProgressBar } = window.DesignSystem_42715e;

function EnsembleScreen() {
  const TopBar = window.TuttiTopBar;
  const I = window.TuttiIcons;
  const team = [
    ['Alex Johnson', 'Content Lead', 'Conductor', 100],
    ['Maya Patel', 'Copywriter', 'Violin', 96],
    ['Jordan Lee', 'Designer', 'Cello', 92],
    ['Taylor Kim', 'Social Manager', 'Flute', 88],
    ['Casey Brown', 'Analyst', 'Timpani', 71],
  ];
  return (
    <div>
      <TopBar
        title="Your ensemble"
        subtitle="One brand DNA, many distinct voices, one workspace."
        action={<Button variant="primary" iconLeft={I.plus({ size: 16, color: '#fff' })}>Invite member</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
        <Card padding="var(--space-4)">
          {team.map(([n, role, inst, score], i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 8px', borderBottom: i < team.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <Avatar name={n} instrument={inst} size={42} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-strong)' }}>{n}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{role}</div>
              </div>
              <Badge tone="teal">{inst}</Badge>
              <div style={{ width: 120 }}>
                <ProgressBar value={score} tone={score >= 90 ? 'green' : 'teal'} showLabel />
              </div>
            </div>
          ))}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card style={{ textAlign: 'center', background: 'var(--gray-50)' }}>
            <img src="../../assets/ensemble.png" alt="" style={{ height: 150, mixBlendMode: 'multiply' }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', marginTop: 6 }}>5 players · 1 score</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>70% of invites have completed Tuning</div>
          </Card>

          <Card style={{ display: 'flex', gap: 12, alignItems: 'flex-start', borderColor: 'var(--teal-100)', background: 'var(--teal-50)' }}>
            <span style={{ color: 'var(--teal-600)', marginTop: 2 }}>{I.waveform({ size: 22 })}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal-700)', marginBottom: 4 }}>Unison alarm</div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-body)', lineHeight: 1.5 }}>
                Your string section is playing in unison this week — three drafts share the same hook. Spread out.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
window.TuttiEnsembleScreen = EnsembleScreen;
