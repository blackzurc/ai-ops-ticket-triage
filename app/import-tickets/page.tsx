import { supabase } from "@/app/lib/supabase";

const tickets = [
  {
    id: "TK-1001",
    title: "Unable to access company email",
    description:
      "I cannot access my company email since this morning. Outlook keeps showing an error when I try to sign in.",
    category: "Email",
    priority: "High",
    status: "Open",
    assigned_to: "IT Support",
    employee: "Employee",
    created_at: "2026-08-12T00:00:00",
    conversation: [
      {
        sender: "You",
        message: "I cannot access my company email since this morning.",
      },
      {
        sender: "IT Support",
        message:
          "We are investigating the issue. Please try restarting Outlook while we check your account.",
      },
    ],
  },

  {
    id: "TK-1002",
    title: "Laptop cannot connect to WiFi",
    description:
      "My laptop cannot connect to the company WiFi network.",
    category: "Network",
    priority: "High",
    status: "In Progress",
    assigned_to: "IT Support",
    employee: "Employee",
    created_at: "2026-08-11T00:00:00",
    conversation: [
      {
        sender: "You",
        message: "My laptop cannot connect to the company WiFi network.",
      },
      {
        sender: "IT Support",
        message:
          "We are checking the WiFi connection. Please try disconnecting and reconnecting to the company network.",
      },
    ],
  },

  {
    id: "TK-1003",
    title: "Request for software installation",
    description:
      "I need the required software installed on my company laptop.",
    category: "Software",
    priority: "Medium",
    status: "Open",
    assigned_to: "IT Support",
    employee: "Employee",
    created_at: "2026-08-10T00:00:00",
    conversation: [
      {
        sender: "You",
        message:
          "I need the required software installed on my company laptop.",
      },
      {
        sender: "IT Support",
        message:
          "Please provide the software name and version so we can proceed with the installation.",
      },
    ],
  },

  {
    id: "TK-1004",
    title: "Printer not working",
    description:
      "The office printer is not responding when I try to print.",
    category: "Hardware",
    priority: "Low",
    status: "Resolved",
    assigned_to: "IT Support",
    employee: "Employee",
    created_at: "2026-08-09T00:00:00",
    conversation: [
      {
        sender: "You",
        message:
          "The office printer is not responding when I try to print.",
      },
      {
        sender: "IT Support",
        message:
          "The printer issue has been resolved. Please try printing again.",
      },
    ],
  },
];

export default async function ImportTicketsPage() {
  const { data, error } = await supabase
    .from("tickets")
    .insert(tickets)
    .select();

  return (
    <main className="p-8">
      <h1 className="mb-4 text-2xl font-bold">
        Ticket Import
      </h1>

      {error ? (
        <pre className="text-red-600">
          {JSON.stringify(error, null, 2)}
        </pre>
      ) : (
        <pre>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </main>
  );
}