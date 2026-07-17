import Link from "next/link";
import { AdminSetupNotice } from "@/components/admin/AdminSetupNotice";
import { getAdminUsers } from "@/lib/admin-data";
import { formatDate, formatDateTime, formatNumber } from "@/lib/format";
import { getSupabaseAdminConfigStatus } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const setup = getSupabaseAdminConfigStatus();
  if (!setup.ok) {
    return <AdminSetupNotice missing={setup.missing} />;
  }

  const users = await getAdminUsers();

  return (
    <main className="admin-main">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Users</h1>
            <p className="admin-subtitle">
              Supabase auth users joined with profiles, plans, and workout progress.
            </p>
          </div>
        </div>

        <section className="panel">
          <div className="panel-header">
            <h2 className="panel-title">All users ({formatNumber(users.length)})</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Plan</th>
                  <th>Race</th>
                  <th>Completed</th>
                  <th>Completion</th>
                  <th>Last seen</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <Link href={`/admin/users/${user.id}`}>{user.email}</Link>
                    </td>
                    <td>{user.role}</td>
                    <td>{user.activePlanName ?? "No plan"}</td>
                    <td>{formatDate(user.raceDate)}</td>
                    <td>
                      {formatNumber(user.completedWorkouts)} / {formatNumber(user.totalWorkouts)}
                    </td>
                    <td>{user.completionRate}%</td>
                    <td>{formatDateTime(user.lastSeenAt)}</td>
                    <td>{formatDate(user.joinedAt)}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={8} className="muted">
                      No users found.
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
