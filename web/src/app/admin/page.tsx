import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdminSetupNotice } from "@/components/admin/AdminSetupNotice";
import { MetricCard } from "@/components/admin/MetricCard";
import { getAdminOverview } from "@/lib/admin-data";
import { formatDateTime, formatNumber } from "@/lib/format";
import { getSupabaseAdminConfigStatus } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const setup = getSupabaseAdminConfigStatus();
  if (!setup.ok) {
    return <AdminSetupNotice missing={setup.missing} />;
  }

  const overview = await getAdminOverview();

  const metrics = [
    { label: "Total users", value: overview.stats.totalUsers },
    { label: "New users 7d", value: overview.stats.newUsers7d, tone: "good" as const },
    { label: "Active plans", value: overview.stats.activePlans },
    { label: "Completed workouts", value: overview.stats.completedWorkouts },
    { label: "Workouts 7d", value: overview.stats.workouts7d, tone: "good" as const },
    { label: "Plans generated 7d", value: overview.stats.planGenerations7d },
    { label: "Sync failures 7d", value: overview.stats.syncFailures7d, tone: "warn" as const },
    { label: "Total plans", value: overview.stats.totalPlans },
  ];

  return (
    <main className="admin-main">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Overview</h1>
            <p className="admin-subtitle">
              Phase 0 visibility: users, plans, completions, and app events.
            </p>
          </div>
          <Link className="button secondary" href="/admin/users">
            View users
            <ArrowRight size={16} />
          </Link>
        </div>

        <section className="metrics-grid" aria-label="Core metrics">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              tone={metric.tone}
            />
          ))}
        </section>

        <div className="split">
          <section className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Recent users</h2>
              <Link href="/admin/users" className="nav-link">
                All users
              </Link>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>Progress</th>
                    <th>Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.users.slice(0, 8).map((user) => (
                    <tr key={user.id}>
                      <td>
                        <Link href={`/admin/users/${user.id}`}>{user.email}</Link>
                      </td>
                      <td>{user.activePlanName ?? "No plan"}</td>
                      <td>
                        {formatNumber(user.completedWorkouts)} / {formatNumber(user.totalWorkouts)}
                      </td>
                      <td>{formatDateTime(user.lastSeenAt)}</td>
                    </tr>
                  ))}
                  {overview.users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="muted">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="stack">
            <div className="panel">
              <div className="panel-header">
                <h2 className="panel-title">Events, last 7 days</h2>
              </div>
              <div className="table-wrap">
                <table>
                  <tbody>
                    {overview.eventCounts.slice(0, 8).map((event) => (
                      <tr key={event.eventName}>
                        <td>{event.eventName}</td>
                        <td>{formatNumber(event.count)}</td>
                      </tr>
                    ))}
                    {overview.eventCounts.length === 0 && (
                      <tr>
                        <td className="muted">
                          No events yet. Apply the Phase 0 analytics migration to start collecting them.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h2 className="panel-title">Recent event stream</h2>
              </div>
              <div className="table-wrap">
                <table>
                  <tbody>
                    {overview.recentEvents.slice(0, 8).map((event) => (
                      <tr key={event.id}>
                        <td>{event.event_name}</td>
                        <td>{event.platform ?? "unknown"}</td>
                        <td>{formatDateTime(event.created_at)}</td>
                      </tr>
                    ))}
                    {overview.recentEvents.length === 0 && (
                      <tr>
                        <td className="muted">No event rows found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
