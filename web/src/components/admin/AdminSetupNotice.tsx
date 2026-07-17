type AdminSetupNoticeProps = {
  missing: string[];
};

export function AdminSetupNotice({ missing }: AdminSetupNoticeProps) {
  return (
    <main className="admin-main">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Admin Setup</h1>
            <p className="admin-subtitle">
              The admin shell is deployed. Live metrics need one more Supabase
              wiring step.
            </p>
          </div>
        </div>

        <section className="panel setup-panel">
          <div className="panel-header">
            <h2 className="panel-title">Required before live admin data</h2>
          </div>
          <div className="setup-body">
            {missing.length > 0 && (
              <>
                <p className="muted">Missing environment variables:</p>
                <ul>
                  {missing.map((name) => (
                    <li key={name}>
                      <code>{name}</code>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="muted">
              Also apply <code>supabase/2026-05-30_phase0_analytics.sql</code>{" "}
              so event rows can be collected and displayed.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
