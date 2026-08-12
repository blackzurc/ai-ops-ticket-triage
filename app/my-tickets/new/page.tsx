"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EmployeeSidebar from "../../components/EmployeeSidebar";
import { aiTriage } from "../../lib/aiTriage";

export default function EmployeeNewTicketPage() {
    const router = useRouter();

    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [priority, setPriority] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!subject || !description || !category || !priority) {
            alert("Please fill in all fields.");
            return;
        }

        const aiResult = aiTriage(description);

        const existingTickets = JSON.parse(
            localStorage.getItem("tickets") || "[]"
        );

        const newTicketNumber =
            1001 + existingTickets.length;

        const newTicket = {
            id: `TK-${newTicketNumber}`,
            title: subject,
            description: description,
            category: category,
            priority: priority,
            status: "Open",
            assignedTo: "IT Support",

            aiTriage: aiResult,

            createdAt: new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }),

            employee: "Employee",

            conversation: [
                {
                    sender: "You",
                    message: description,
                },
            ],
        };

        const updatedTickets = [
            ...existingTickets,
            newTicket,
        ];

        localStorage.setItem(
            "tickets",
            JSON.stringify(updatedTickets)
        );

        router.push("/my-tickets");
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <EmployeeSidebar />

            <main className="ml-64 min-h-screen flex-1 p-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-700"
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
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Enter ticket subject"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label
                                htmlFor="category"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Category
                            </label>

                            <select
                                id="category"
                                value={category}
                                onChange={(e) =>
                                    setCategory(e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="" disabled>
                                    Select category
                                </option>

                                <option value="Email">Email</option>
                                <option value="Network">Network</option>
                                <option value="Software">Software</option>
                                <option value="Hardware">Hardware</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div>
                            <label
                                htmlFor="priority"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Priority
                            </label>

                            <select
                                id="priority"
                                value={priority}
                                onChange={(e) =>
                                    setPriority(e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="" disabled>
                                    Select priority
                                </option>

                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 border-t pt-6">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
                            >
                                Create Ticket
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}