"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EmployeeSidebar from "../components/EmployeeSidebar";
import { supabase } from "../lib/supabase";
import AuthGuard from "../components/AuthGuard";

export default function MyTicketsPage() {
    const [ticketList, setTicketList] = useState<any[]>([]);

    useEffect(() => {
        let channel: ReturnType<typeof supabase.channel> | null = null;
        let cancelled = false;

        const setup = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user || cancelled) {
                return;
            }

            // Create realtime channel FIRST
            channel = supabase
                .channel(`my-tickets-${user.id}`)
                .on(
                    "postgres_changes",
                    {
                        event: "UPDATE",
                        schema: "public",
                        table: "tickets",
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        console.log("My Tickets UPDATE:", payload);
                        console.log("NEW TICKET DATA:", payload.new);

                        setTicketList((currentTickets) =>
                            currentTickets.map((ticket) =>
                                ticket.id === payload.new.id
                                    ? payload.new
                                    : ticket
                            )
                        );
                    }
                )
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "tickets",
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        console.log("My Tickets INSERT:", payload);

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
                                payload.new,
                                ...currentTickets,
                            ];
                        });
                    }
                )
                .on(
                    "postgres_changes",
                    {
                        event: "DELETE",
                        schema: "public",
                        table: "tickets",
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        console.log("My Tickets DELETE:", payload);

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
                        "My Tickets realtime status:",
                        status
                    );
                });

            // Load existing tickets AFTER setting up realtime
            const { data, error } = await supabase
                .from("tickets")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error loading tickets:", error);
                return;
            }

            if (!cancelled) {
                setTicketList(data || []);
            }
        };

        setup();

        return () => {
            cancelled = true;

            if (channel) {
                supabase.removeChannel(channel);
                channel = null;
            }
        };
    }, []);

    return (
        <AuthGuard requiredRole="employee">
            <>
                <EmployeeSidebar />

                <main className="min-h-screen bg-gray-100 p-8 pl-72">
                    <div className="mx-auto max-w-5xl">

                        {/* Header */}
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    My Tickets
                                </h1>

                                <p className="mt-2 text-gray-600">
                                    View and track your IT support requests
                                </p>
                            </div>

                            <Link
                                href="/my-tickets/new"
                                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                            >
                                + Create Ticket
                            </Link>
                        </div>

                        {/* Tickets */}
                        <div className="space-y-4">
                            {ticketList.length === 0 ? (
                                <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                                    <p className="text-gray-500">
                                        You don't have any tickets yet.
                                    </p>
                                </div>
                            ) : (
                                ticketList.map((ticket) => (
                                    <Link
                                        key={ticket.id}
                                        href={`/my-tickets/${ticket.id}`}
                                        className="block rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500">
                                                    Ticket #{ticket.id}
                                                </p>

                                                <h2 className="mt-1 text-lg font-semibold text-gray-900">
                                                    {ticket.title}
                                                </h2>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    {ticket.category}
                                                </p>
                                            </div>

                                            <span
                                                className={`rounded-full px-3 py-1 text-sm font-medium ${ticket.status === "Open"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : ticket.status ===
                                                        "In Progress"
                                                        ? "bg-orange-100 text-orange-700"
                                                        : "bg-green-100 text-green-700"
                                                    }`}
                                            >
                                                {ticket.status}
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </main>
            </>
        </AuthGuard>
    );
}