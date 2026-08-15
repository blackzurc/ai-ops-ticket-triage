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

        if (!subject || !description) {
            alert("Please fill in the subject and description.");
            return;
        }

        setLoading(true);

        try {
            // Get logged-in user
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                alert("You must be logged in to create a ticket.");
                return;
            }

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", user.id)
                .single();

            console.log("USER:", user);
            console.log("PROFILE:", profile);
            console.log("PROFILE ERROR:", profileError);

            if (profileError) {
                console.error("Error loading profile:", profileError);
            }

            // Run Gemini AI Triage
            const aiResponse = await fetch("/api/ai-triage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: subject,
                    description: description,
                }),
            });

            const aiResult = await aiResponse.json();

            if (!aiResponse.ok) {
                console.error("AI triage failed:", aiResult);
                alert(
                    aiResult.error ||
                    "AI triage failed. Please try again."
                );
                return;
            }

            console.log("AI Result:", aiResult);

            // Generate ticket ID
            const newTicketNumber =
                1001 + Math.floor(Math.random() * 9000);

            const newTicket = {
                id: `TK-${newTicketNumber}`,

                title: subject,

                description: description,

                // Use AI results
                category: aiResult.category,

                priority: aiResult.priority,

                status: "Open",

                assigned_to: "IT Support",

                created_at: new Date().toISOString(),

                employee: "Employee",

                user_id: user.id,

                conversation: [
                    {
                        sender: profile?.full_name || user.email || "Employee",
                        message: description,
                    },
                ],
                // Store AI analysis
                ai_category: aiResult.category,

                ai_priority: aiResult.priority,

                ai_confidence: aiResult.confidence,

                ai_reasoning: aiResult.reasoning,
            };

            console.log("New Ticket:", newTicket);

            // Insert ticket into Supabase
            const { error } = await supabase
                .from("tickets")
                .insert(newTicket);

            if (error) {
                console.error(
                    "Error creating ticket:",
                    error.message
                );

                console.error(
                    "Full error:",
                    JSON.stringify(error, null, 2)
                );

                alert(
                    `Failed to create ticket: ${error.message}`
                );

                return;
            }

            console.log(
                `Ticket ${newTicket.id} created successfully.`
            );

            // Go back to My Tickets
            router.push("/my-tickets");

        } catch (error) {
            console.error(
                "Unexpected error:",
                error
            );

            alert(
                "Something went wrong while creating the ticket."
            );
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
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
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
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
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