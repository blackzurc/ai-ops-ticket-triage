"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EmployeeSidebar from "../components/EmployeeSidebar";
import { tickets as mockTickets } from "../data/tickets";

export default function MyTicketsPage() {
    const [ticketList, setTicketList] = useState(mockTickets);

    useEffect(() => {
        const loadTickets = () => {
            const storedTickets = localStorage.getItem("tickets");

            if (storedTickets) {
                setTicketList(JSON.parse(storedTickets));
            } else {
                localStorage.setItem(
                    "tickets",
                    JSON.stringify(mockTickets)
                );

                setTicketList(mockTickets);
            }
        };

        // Load tickets when page opens
        loadTickets();

        // Listen for changes from another tab/window
        const handleStorageChange = () => {
            loadTickets();
        };

        window.addEventListener(
            "storage",
            handleStorageChange
        );

        return () => {
            window.removeEventListener(
                "storage",
                handleStorageChange
            );
        };
    }, []);

    return (
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
                        {ticketList
                            .filter((ticket) => ticket.employee === "Employee")
                            .map((ticket) => (
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
                                                    : ticket.status === "In Progress"
                                                        ? "bg-orange-100 text-orange-700"
                                                        : "bg-green-100 text-green-700"
                                                }`}
                                        >
                                            {ticket.status}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                    </div>
                </div>
            </main>
        </>
    );
}