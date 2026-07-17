"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Home, LogOut, Users } from "lucide-react";

interface AdminNavProps {
  email?: string | null;
}

const navItems = [
  { href: "/admin", label: "Overview", icon: Activity },
  { href: "/admin/users", label: "Users", icon: Users },
];

export function AdminNav({ email }: AdminNavProps) {
  const currentPath = usePathname();

  return (
    <header className="container">
      <nav className="admin-nav" aria-label="Admin">
        <Link href="/admin" className="brand">
          <span className="brand-mark">M</span>
          <span>Marathon admin</span>
        </Link>
        <div className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? currentPath === item.href
                : currentPath.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link${active ? " active" : ""}`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
          <Link href="/" className="nav-link">
            <Home size={16} />
            Site
          </Link>
          <form action="/api/auth/signout" method="post">
            <button className="nav-link" type="submit" title={email ?? "Sign out"}>
              <LogOut size={16} />
              Sign out
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
