// Tutti app — Tuning (onboarding): step nav + company tuning form + musician.
const { Card, Button, Input, StepNav, Badge, ProgressBar } = window.DesignSystem_42715e;

function TuningScreen() {
  const TopBar = window.TuttiTopBar;
  return (
    <div>
      <TopBar title="Let's get your brand in tune" subtitle="Calibrating each voice before you play. About 2 minutes." />

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'start' }}>
        <Card padding="var(--space-4)">
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-accent)', padding: '4px 12px 8px' }}>Onboarding · Tuning</div>
          <StepNav current={1} steps={['About your company', 'Brand DNA', 'Audience', 'Team', 'Voice & tone']} />
          <div style={{ padding: '12px 12px 4px' }}>
            <ProgressBar value={32} tone="teal" showLabel />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Step 2 of 5</div>
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, alignItems: 'start' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: 20 }}>Brand DNA</h3>
              <Badge tone="teal">Auto-researched</Badge>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>
              We pulled this from your public surface. Verify in ~60 seconds — every fact carries a source.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
              <Input label="Positioning" defaultValue="The team content OS — harmony, not unison." />
              <Input label="One-line pitch" defaultValue="A whole team sounds like one brand, every post still human." />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-strong)', marginBottom: 8 }}>Validated pains</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <Badge tone="green">✓ Blank-page freeze · Monday</Badge>
                  <Badge tone="green">✓ Generic AI tells</Badge>
                  <Badge tone="neutral">+ Add a pain</Badge>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <Button variant="primary">Looks right →</Button>
              <Button variant="ghost">Edit details</Button>
            </div>
          </Card>

          <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'var(--gray-50)' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', top: -6, right: -18, background: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)',
                padding: '8px 12px', fontSize: 13, fontWeight: 600, color: 'var(--text-body)',
                boxShadow: 'var(--shadow-sm)', whiteSpace: 'nowrap',
              }}>This might squeak a bit.</div>
              <img src="../../assets/musician-unsure.png" alt="" style={{ height: 220, mixBlendMode: 'multiply' }} />
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4, maxWidth: 240 }}>
              Off-key just means we haven't learned your voice yet. We'll get there.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
window.TuttiTuningScreen = TuningScreen;
