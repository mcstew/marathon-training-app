import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminUser("/admin");

  return (
    <div className="admin-page">
      <AdminNav email={user.email} />
      {children}
    </div>
  );
}
