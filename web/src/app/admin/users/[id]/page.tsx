import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminSetupNotice } from "@/components/admin/AdminSetupNotice";
import { getAdminUserDetail } from "@/lib/admin-data";
import { formatDate, formatDateTime, formatNumber } from "@/lib/format";
import { getSupabaseAdminConfigStatus } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const setup = getSupabaseAdminConfigStatus();
  if (!setup.ok) {
    return <AdminSetupNotice missing={setup.missing} />;
  }

  const detail = await getAdminUserDetail(id);

  if (!detail) {
    notFound();
  }

  const completed = detail.workouts.filter((workout) => workout.is_completed);
  const skipped = detail.workouts.filter((workout) => workout.is_skipped);
  const distance = completed.reduce(
    (sum, workout) => sum + (workout.actual_distance ?? workout.planned_distance ?? 0),
    0,
  );

  return (
    <main className="admin-main">
      <div className="container">
        <div className="admin-header">
          <div>
            <Link className="nav-link" href="/admin/users">
              <ArrowLeft size={16} />
              Back to users
            </Link>
            <h1>{detail.user.email}</h1>
            <p className="admin-subtitle">
              Joined {formatDate(detail.user.joinedAt)}. Last seen{" "}
              {formatDateTime(detail.user.lastSeenAt)}.
            </p>
          </div>
        </div>

        <section className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{formatNumber(detail.plans.length)}</div>
            <div className="metric-label">Plans</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{formatNumber(completed.length)}</div>
            <div className="metric-label">Completed</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{formatNumber(skipped.length)}</div>
            <div className="metric-label">Skipped</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{distance.toFixed(1)}</div>
            <div className="metric-label">Miles logged</div>
          </div>
        </section>

        <div className="split">
          <section className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Training plans</h2>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Race date</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.plans.map((plan) => (
                    <tr key={plan.id}>
                      <td>{plan.plan_name ?? plan.plan_id ?? "Untitled plan"}</td>
                      <td>{plan.status ?? "unknown"}</td>
                      <td>{formatDate(plan.race_date)}</td>
                      <td>{formatDate(plan.created_at)}</td>
                    </tr>
                  ))}
                  {detail.plans.length === 0 && (
                    <tr>
                      <td colSpan={4} className="muted">
                        No plans found.
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
                <h2 className="panel-title">Profile</h2>
              </div>
              <table>
                <tbody>
                  <tr>
                    <td>Role</td>
                    <td>{detail.profile?.role ?? "user"}</td>
                  </tr>
                  <tr>
                    <td>Units</td>
                    <td>{detail.profile?.units ?? "unknown"}</td>
                  </tr>
                  <tr>
                    <td>Onboarded</td>
                    <td>{detail.profile?.is_onboarded ? "Yes" : "No"}</td>
                  </tr>
                  <tr>
                    <td>Last sign in</td>
                    <td>{formatDateTime(detail.authUser?.last_sign_in_at)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h2 className="panel-title">Recent events</h2>
              </div>
              <div className="table-wrap">
                <table>
                  <tbody>
                    {detail.events.slice(0, 10).map((event) => (
                      <tr key={event.id}>
                        <td>{event.event_name}</td>
                        <td>{formatDateTime(event.created_at)}</td>
                      </tr>
                    ))}
                    {detail.events.length === 0 && (
                      <tr>
                        <td className="muted">No events recorded for this user.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        <section className="panel" style={{ marginTop: 18 }}>
          <div className="panel-header">
            <h2 className="panel-title">Recent workouts</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Workout</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Distance</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {detail.workouts
                  .slice()
                  .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
                  .slice(0, 30)
                  .map((workout) => (
                    <tr key={workout.id}>
                      <td>{formatDate(workout.date)}</td>
                      <td>{workout.title ?? "Workout"}</td>
                      <td>{workout.type ?? "unknown"}</td>
                      <td>
                        {workout.is_completed
                          ? "Completed"
                          : workout.is_skipped
                            ? "Skipped"
                            : "Open"}
                      </td>
                      <td>{workout.actual_distance ?? workout.planned_distance ?? "-"}</td>
                      <td>{formatDateTime(workout.updated_at)}</td>
                    </tr>
                  ))}
                {detail.workouts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="muted">
                      No workouts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
