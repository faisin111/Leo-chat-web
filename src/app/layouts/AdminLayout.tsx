import { Outlet, Link } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="w-64 border-r border-border bg-muted/50 p-4">
        <h2 className="font-bold mb-4">Admin Console</h2>
        <nav className="flex flex-col space-y-2">
          <Link to="/app/admin" className="hover:underline">
            Dashboard
          </Link>
          <Link to="/app/admin/users" className="hover:underline">
            Users
          </Link>
          <Link to="/app/admin/reports" className="hover:underline">
            Reports
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
