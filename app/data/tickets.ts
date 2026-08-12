export const tickets = [
  {
    id: "TK-1001",
    title: "Unable to access company email",
    description:
      "I cannot access my company email since this morning. Outlook keeps showing an error when I try to sign in.",
    category: "Email",
    priority: "High",
    status: "Open",
    assignedTo: "IT Support",
    createdAt: "12 Aug 2026",
    employee: "Employee",

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
    assignedTo: "IT Support",
    createdAt: "11 Aug 2026",
    employee: "Employee",

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
    assignedTo: "IT Support",
    createdAt: "10 Aug 2026",
    employee: "Employee",

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
    assignedTo: "IT Support",
    createdAt: "9 Aug 2026",
    employee: "Employee",

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