import Link from "next/link";

export default function EmployeeSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-6">
        <h1 className="text-lg font-bold text-gray-900">
          AI Ops
        </h1>

        <p className="text-sm text-gray-500">
          Employee Portal
        </p>
      </div>

      <nav className="flex-1 p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Menu
        </p>

        <div className="space-y-1">
          <Link
            href="/my-tickets"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            My Tickets
          </Link>

          <Link
            href="/my-tickets/new"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Create Ticket
          </Link>
        </div>
      </nav>

      <div className="border-t border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-900">
          Employee
        </p>

        <p className="text-xs text-gray-500">
          Staff Member
        </p>
      </div>
    </aside>
  );
}