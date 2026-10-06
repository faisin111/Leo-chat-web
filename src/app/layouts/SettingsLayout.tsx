import { Outlet, Link } from 'react-router-dom';

export default function SettingsLayout() {
  return (
    <div className="flex h-full w-full">
      <div className="w-48 border-r border-border p-4">
        <h3 className="font-semibold mb-4">Settings</h3>
        <nav className="flex flex-col space-y-2 text-sm">
          <Link to="/app/settings/profile">Profile</Link>
          <Link to="/app/settings/security">Security</Link>
          <Link to="/app/settings/sessions">Sessions</Link>
          <Link to="/app/settings/blocked">Blocked Users</Link>
          <Link to="/app/settings/appearance">Appearance</Link>
        </nav>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
