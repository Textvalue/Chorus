// Tutti app — left sidebar (navigation rail + workspace footer).
const { Avatar, Badge } = window.DesignSystem_42715e;

function NavItem({ icon, label, active, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
        padding: '10px 12px', border: 'none', borderRadius: 'var(--radius-md)',
        background: active ? 'var(--blue-50)' : hover ? 'var(--gray-100)' : 'transparent',
        color: active ? 'var(--blue-700)' : 'var(--text-body)',
        fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: active ? 600 : 500,
        cursor: 'pointer', textAlign: 'left', transition: 'background var(--dur-fast)',
      }}
    >
      <span style={{ color: active ? 'var(--blue-600)' : 'var(--slate-500)', display: 'inline-flex' }}>{icon({ size: 19 })}</span>
      {label}
    </button>
  );
}

function Sidebar({ route, setRoute }) {
  const I = window.TuttiIcons;
  const nav = [
    ['studio', 'Studio', I.studio],
    ['create', 'Create', I.create],
    ['rehearsal', 'Rehearsal', I.rehearsal],
    ['ensemble', 'Ensemble', I.ensemble],
    ['tuning', 'Tuning', I.tune],
  ];
  return (
    <aside style={{
      width: 248, flex: 'none', height: '100%', boxSizing: 'border-box',
      background: 'var(--surface-card)', borderRight: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column', padding: '20px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 8px 18px' }}>
        <img src="../../assets/spark.png" alt="" style={{ height: 26, mixBlendMode: 'multiply' }} />
        <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--navy)' }}>tutti</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '8px 12px 4px' }}>Workspace</div>
        {nav.map(([id, label, icon]) => (
          <NavItem key={id} icon={icon} label={label} active={route === id} onClick={() => setRoute(id)} />
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 6px' }}>
          <span style={{ fontSize: 18 }}>🔥</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-strong)' }}>12-day streak</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Level 12 · 2,350 XP</div>
          </div>
          <Badge tone="amber">L12</Badge>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderRadius: 'var(--radius-md)', background: 'var(--gray-50)' }}>
          <Avatar name="Alex Johnson" instrument="Conductor" size={34} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-strong)' }}>Alex Johnson</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Bandleader · Acme</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
window.TuttiSidebar = Sidebar;
