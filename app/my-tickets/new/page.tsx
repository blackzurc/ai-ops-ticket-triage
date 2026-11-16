"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import { supabase } from "../../lib/supabase";

export default function EmployeeNewTicketPage() {
    const router = useRouter();

    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);


const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!subject.trim() || !description.trim()) {
        alert("Please fill in the subject and description.");
        return;
    }

    setLoading(true);

    try {
        // Get the current login session
        const {
            data: { session },
            error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
            alert("Your session has expired. Please log in again.");
            return;
        }

        // Send ticket to the secure backend
        const response = await fetch("/api/tickets", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
                title: subject.trim(),
                description: description.trim(),
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Ticket creation failed:", result);
            alert(result.error || "Failed to create ticket.");
            return;
        }

        console.log("Ticket created:", result.ticket);

        alert(
            `Ticket created successfully!\n` +
            `Ticket ID: ${result.ticket.id}\n` +
            `Category: ${result.ticket.category}\n` +
            `Assigned to: ${result.ticket.assigned_to}`
        );

        router.push("/my-tickets");

    } catch (error) {
        console.error("Unexpected error:", error);
        alert("Something went wrong while creating the ticket.");
    } finally {
        setLoading(false);
    }
};


    return (
        <div className="flex min-h-screen bg-gray-100">
            <EmployeeSidebar />

            <main className="ml-64 min-h-screen flex-1 p-8">

                {/* Header */}
                <div className="mb-8">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={loading}
                        className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                        ← Back to My Tickets
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900">
                        Create New Ticket
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Submit a new support ticket to the IT Operations team.
                    </p>
                </div>

                {/* Form */}
                <div className="max-w-3xl rounded-xl bg-white p-6 shadow-sm">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >

                        {/* Subject */}
                        <div>
                            <label
                                htmlFor="subject"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Subject
                            </label>

                            <input
                                id="subject"
                                type="text"
                                value={subject}
                                onChange={(e) =>
                                    setSubject(e.target.value)
                                }
                                placeholder="Enter ticket subject"
                                disabled={loading}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label
                                htmlFor="description"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Description
                            </label>

                            <textarea
                                id="description"
                                rows={6}
                                value={description}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                                placeholder="Describe your issue..."
                                disabled={loading}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                        </div>

                        {/* AI Triage Information */}
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <div className="flex items-start gap-3">

                                <div className="text-lg">
                                    🤖
                                </div>

                                <div>
                                    <p className="font-semibold text-blue-900">
                                        AI-Powered Ticket Triage
                                    </p>

                                    <p className="mt-1 text-sm text-blue-700">
                                        Gemini AI will automatically analyze
                                        your ticket description and determine
                                        the category, priority, confidence,
                                        and reasoning.
                                    </p>
                                </div>

                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 border-t pt-6">

                            <button
                                type="button"
                                onClick={() => router.back()}
                                disabled={loading}
                                className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                            >
                                {loading
                                    ? "AI Analyzing..."
                                    : "Create Ticket"}
                            </button>

                        </div>

                    </form>
                </div>
            </main>
        </div>
    );
}