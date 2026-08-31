"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "../components/sidebar";
import { supabase } from "../lib/supabase";
import AuthGuard from "../components/AuthGuard";

interface Ticket {
    id: string;
    title: string;
    category: string;
    status: string;
    priority: string;
    created_at?: string;
}

export default function Dashboard() {
    const [ticketList, setTicketList] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTickets = async () => {
            const { data, error } = await supabase
                .from("tickets")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error loading tickets:", error);
                setLoading(false);
                return;
            }

            setTicketList(data ?? []);
            setLoading(false);
        };

        loadTickets();

        // Listen for ticket changes
        const channel = supabase
            .channel("dashboard-tickets")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "tickets",
                },
                () => {
                    loadTickets();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const totalTickets = ticketList.length;

    const openTickets = ticketList.filter(
        (ticket) => ticket.status === "Open"
    ).length;

    const inProgressTickets = ticketList.filter(
        (ticket) => ticket.status === "In Progress"
    ).length;

    const resolvedTickets = ticketList.filter(
        (ticket) => ticket.status === "Resolved"
    ).length;

    const recentTickets = ticketList.slice(0, 5);

    return (
        <AuthGuard requiredRole="it_support">
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />

                <main className="ml-64 min-h-screen flex-1 p-8">
                    <div className="mx-auto max-w-7xl">

                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">
                                AI Ops Ticket Triage
                            </h1>

                            <p className="mt-2 text-gray-600">
                                IT Operations Dashboard
                            </p>
                        </div>

                        {/* Loading */}
                        {loading ? (
                            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                                <p className="text-sm text-gray-500">
                                    Loading dashboard...
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Statistics */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">

                                    {/* Total Tickets */}
                                    <div className="rounded-xl bg-white p-6 shadow-sm">
                                        <p className="text-sm font-medium text-gray-500">
                                            Total Tickets
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-gray-900">
                                            {totalTickets}
                                        </p>
                                    </div>

                                    {/* Open Tickets */}
                                    <div className="rounded-xl bg-white p-6 shadow-sm">
                                        <p className="text-sm font-medium text-gray-500">
                                            Open Tickets
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-blue-600">
                                            {openTickets}
                                        </p>
                                    </div>

                                    {/* In Progress */}
                                    <div className="rounded-xl bg-white p-6 shadow-sm">
                                        <p className="text-sm font-medium text-gray-500">
                                            In Progress
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-orange-500">
                                            {inProgressTickets}
                                        </p>
                                    </div>

                                    {/* Resolved */}
                                    <div className="rounded-xl bg-white p-6 shadow-sm">
                                        <p className="text-sm font-medium text-gray-500">
                                            Resolved
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-green-600">
                                            {resolvedTickets}
                                        </p>
                                    </div>

                                </div>

                                {/* Recent Tickets */}
                                <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">

                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            Recent Tickets
                                        </h2>

                                        <Link
                                            href="/tickets"
                                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                        >
                                            View All
                                        </Link>
                                    </div>

                                    <div className="mt-4 divide-y">
                                        {recentTickets.length === 0 ? (
                                            <p className="py-6 text-center text-sm text-gray-500">
                                                No tickets available.
                                            </p>
                                        ) : (
                                            recentTickets.map((ticket) => (
                                                <Link
                                                    key={ticket.id}
                                                    href={`/tickets/${ticket.id}`}
                                                    className="flex items-center justify-between py-4 hover:bg-gray-50"
                                                >
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {ticket.id} — {ticket.title}
                                                        </p>

                                                        <p className="mt-1 text-sm text-gray-500">
                                                            {ticket.category} · {ticket.status}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-sm font-medium ${ticket.priority === "High"
                                                                ? "bg-red-100 text-red-700"
                                                                : ticket.priority === "Medium"
                                                                    ? "bg-yellow-100 text-yellow-700"
                                                                    : "bg-green-100 text-green-700"
                                                            }`}
                                                    >
                                                        {ticket.priority}
                                                    </span>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}