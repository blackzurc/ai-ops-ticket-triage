"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/sidebar";
import { supabase } from "../lib/supabase";
import AuthGuard from "../components/AuthGuard";

interface Ticket {
  id: string;
  title: string;
  category?: string;
  status: string;
  priority?: string;
  created_at?: string;
  [key: string]: unknown;
}

export default function TicketsPage() {
  const router = useRouter();

  const [ticketList, setTicketList] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");

  const filteredTickets = ticketList.filter((ticket) => {
    const category = ticket.category ?? "";
    const matchesSearch =
      ticket.id.toLowerCase().includes(search.toLowerCase()) ||
      ticket.title.toLowerCase().includes(search.toLowerCase()) ||
      category.toLowerCase().includes(search.toLowerCase());

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
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const loadTickets = async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading tickets:", error);
        return;
      }

      setTicketList(data || []);
    };

    const setup = async () => {
      // Initial load
      await loadTickets();

      // Realtime subscription
      channel = supabase
        .channel(`tickets-page-${Date.now()}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "tickets",
          },
          (payload) => {
            console.log(
              "New ticket:",
              payload.new
            );

            setTicketList((currentTickets) => {
              if (
                currentTickets.some(
                  (ticket) =>
                    ticket.id === payload.new.id
                )
              ) {
                return currentTickets;
              }

              return [
                payload.new as Ticket,
                ...currentTickets,
              ];
            });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "tickets",
          },
          (payload) => {
            console.log(
              "Ticket updated:",
              payload.new
            );

            setTicketList((currentTickets) =>
              currentTickets
                .map((ticket) =>
                  ticket.id === payload.new.id
                    ? (payload.new as Ticket)
                    : ticket
                )
                .sort((a, b) => {
                  const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
                  const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
                  return bTime - aTime;
                })
            );
          }
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "tickets",
          },
          (payload) => {
            console.log(
              "Ticket deleted:",
              payload.old
            );

            setTicketList((currentTickets) =>
              currentTickets.filter(
                (ticket) =>
                  ticket.id !== payload.old.id
              )
            );
          }
        )
        .subscribe((status) => {
          console.log(
            "Tickets page realtime status:",
            status
          );
        });
    };

    setup();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return (
    <AuthGuard requiredRole="it_support">
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />

        <main className="ml-64 min-h-screen p-8 flex-1">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Tickets
            </h1>

            <p className="mt-1 text-gray-500">
              View and manage all support tickets.
            </p>
          </div>


          {/* Filters */}
          <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row">
              <input
                type="text"
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none focus:border-blue-500"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900"
              >
                <option>All Status</option>
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900"
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
                        {ticket.created_at
                          ? new Date(ticket.created_at).toLocaleDateString("en-GB")
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}