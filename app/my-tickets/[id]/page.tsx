"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import { supabase } from "../../lib/supabase";
import AuthGuard from "../../components/AuthGuard";

export default function EmployeeTicketDetailPage() {
    const params = useParams();

    const [ticket, setTicket] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [reply, setReply] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTicket = async () => {
            const { data, error } = await supabase
                .from("tickets")
                .select("*")
                .eq("id", params.id)
                .maybeSingle();

            if (error) {
                console.error("Error loading ticket:", error);
                setLoading(false);
                return;
            }

            if (!data) {
                setLoading(false);
                return;
            }

            setTicket(data);
            setMessages(data.conversation ?? []);
            setLoading(false);
        };

        loadTicket();
    }, [params.id]);

    const handleSendReply = async () => {
        if (!reply.trim() || !ticket) {
            return;
        }

        const newMessage = {
            sender: "You",
            message: reply.trim(),
        };

        const updatedMessages = [
            ...messages,
            newMessage,
        ];

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            alert("You must be logged in.");
            return;
        }

        const { error } = await supabase
            .from("tickets")
            .update({
                conversation: updatedMessages,
            })
            .eq("id", ticket.id)
            .eq("user_id", user.id);

        if (error) {
            console.error(
                "Error sending reply:",
                error
            );

            alert("Failed to send reply.");
            return;
        }

        setMessages(updatedMessages);
        setReply("");
    };

    if (loading) {
        return (
            <AuthGuard requiredRole="employee">
                <div className="flex min-h-screen bg-gray-100">
                    <EmployeeSidebar />

                    <main className="ml-64 flex-1 p-8">
                        <p className="text-gray-600">
                            Loading ticket...
                        </p>
                    </main>
                </div>
            </AuthGuard>
        );
    }

    if (!ticket) {
        return (
            <AuthGuard requiredRole="employee">
                <div className="flex min-h-screen bg-gray-100">
                    <EmployeeSidebar />

                    <main className="ml-64 flex-1 p-8">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Ticket Not Found
                        </h1>

                        <Link
                            href="/my-tickets"
                            className="mt-4 inline-block text-blue-600 hover:text-blue-700"
                        >
                            ← Back to My Tickets
                        </Link>
                    </main>
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard requiredRole="employee">
            <div className="flex min-h-screen bg-gray-100">
                <EmployeeSidebar />

                <main className="ml-64 min-h-screen flex-1 p-8">

                    {/* Back */}
                    <Link
                        href="/my-tickets"
                        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
                    >
                        ← Back to My Tickets
                    </Link>

                    {/* Header */}
                    <div className="mb-6">
                        <p className="text-sm font-medium text-blue-600">
                            {ticket.id}
                        </p>

                        <h1 className="mt-1 text-3xl font-bold text-gray-900">
                            {ticket.title}
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Created on{" "}
                            {new Date(
                                ticket.created_at
                            ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            })}
                        </p>
                    </div>

                    {/* Ticket Information */}
                    <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold text-gray-900">
                            Ticket Information
                        </h2>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">

                            <div>
                                <p className="text-sm text-gray-500">
                                    Status
                                </p>

                                <span
                                    className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${ticket.status === "Open"
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

                            <div>
                                <p className="text-sm text-gray-500">
                                    Priority
                                </p>

                                <span className="mt-1 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                                    {ticket.priority}
                                </span>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Category
                                </p>

                                <p className="mt-1 font-medium text-gray-900">
                                    {ticket.category}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Assigned To
                                </p>

                                <p className="mt-1 font-medium text-gray-900">
                                    {ticket.assigned_to}
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">
                            Description
                        </h2>

                        <p className="leading-7 text-gray-600">
                            {ticket.description}
                        </p>
                    </div>

                    {/* AI Triage */}
                    <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">

                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">
                                AI Triage
                            </h2>

                            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                                AI Generated
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                            <div>
                                <p className="text-sm text-gray-500">
                                    Suggested Category
                                </p>

                                <p className="mt-1 font-medium text-gray-900">
                                    {ticket.ai_category ||
                                        ticket.category}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Suggested Priority
                                </p>

                                <p className="mt-1 font-medium text-gray-900">
                                    {ticket.ai_priority ||
                                        ticket.priority}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Confidence
                                </p>

                                <p className="mt-1 font-medium text-gray-900">
                                    {ticket.ai_confidence ?? "N/A"}%
                                </p>
                            </div>

                        </div>

                        <div className="mt-5 rounded-lg bg-gray-50 p-4">
                            <p className="text-sm font-medium text-gray-700">
                                AI Reasoning
                            </p>

                            <p className="mt-1 text-sm leading-6 text-gray-600">
                                {ticket.ai_reasoning ||
                                    "AI triage information is not available for this ticket."}
                            </p>
                        </div>

                    </div>

                    {/* Conversation */}
                    <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-semibold text-gray-900">
                            Conversation
                        </h2>

                        <div className="space-y-4">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={
                                        message.sender === "You"
                                            ? "rounded-lg bg-gray-50 p-4"
                                            : "rounded-lg bg-blue-50 p-4"
                                    }
                                >
                                    <p className="text-sm font-semibold text-gray-900">
                                        {message.sender}
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-gray-600">
                                        {message.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reply */}
                    <div className="rounded-xl bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">
                            Reply
                        </h2>

                        <textarea
                            rows={5}
                            value={reply}
                            onChange={(e) =>
                                setReply(e.target.value)
                            }
                            placeholder="Write a message..."
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />

                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={handleSendReply}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
                            >
                                Send Reply
                            </button>
                        </div>
                    </div>

                </main>
            </div>
        </AuthGuard>
    );
}