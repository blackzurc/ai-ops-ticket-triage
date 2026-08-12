import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="border-b border-gray-200 p-6">
        <h1 className="text-lg font-bold text-gray-900">
          AI Ops
        </h1>

        <p className="text-sm text-gray-500">
          Ticket Triage
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Menu
        </p>

        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Dashboard
          </Link>

          <Link
            href="/tickets"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Tickets
          </Link>

          <Link
            href="/tickets/new"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Create Ticket
          </Link>
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-900">
          IT Support Agent
        </p>

        <p className="text-xs text-gray-500">
          Operations Team
        </p>
      </div>
    </aside>
  );
}