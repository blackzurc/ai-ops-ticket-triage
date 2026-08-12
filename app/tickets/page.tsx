"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/sidebar";
import { tickets as mockTickets } from "../data/tickets";

export default function TicketsPage() {
  const router = useRouter();

  const [ticketList, setTicketList] = useState(mockTickets);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");

  const filteredTickets = ticketList.filter((ticket) => {
    const matchesSearch =
      ticket.id.toLowerCase().includes(search.toLowerCase()) ||
      ticket.title.toLowerCase().includes(search.toLowerCase()) ||
      ticket.category.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" ||
      ticket.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All Priorities" ||
      ticket.priority === priorityFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority
    );
  });

  useEffect(() => {
    const storedTickets = localStorage.getItem("tickets");

    if (storedTickets) {
      setTicketList(JSON.parse(storedTickets));
    } else {
      localStorage.setItem(
        "tickets",
        JSON.stringify(mockTickets)
      );
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="ml-64 min-h-screen p-8 flex-1">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tickets
            </h1>

            <p className="mt-1 text-gray-500">
              View and manage all support tickets.
            </p>
          </div>

          <button
            onClick={() => router.push("/tickets/new")}
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            + New Ticket
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2.5"
            >
              <option>All Status</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2.5"
            >
              <option>All Priorities</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>

        {/* Tickets table */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    ID
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Title
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Category
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Priority
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      router.push(`/tickets/${ticket.id}`)
                    }
                  >
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      {ticket.id}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900">
                      {ticket.title}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {ticket.category}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${ticket.priority === "High"
                          ? "bg-red-100 text-red-700"
                          : ticket.priority === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                          }`}
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${ticket.status === "Open"
                          ? "bg-blue-100 text-blue-700"
                          : ticket.status === "In Progress"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700"
                          }`}
                      >
                        {ticket.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {ticket.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}