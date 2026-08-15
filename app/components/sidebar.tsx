"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      alert("Failed to log out.");
      return;
    }

    router.replace("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
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
        </div>
      </nav>

      {/* User + Logout */}
      <div className="border-t border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-900">
          IT Support Agent
        </p>

        <p className="mb-3 text-xs text-gray-500">
          Operations Team
        </p>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}