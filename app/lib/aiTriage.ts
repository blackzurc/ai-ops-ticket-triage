export function aiTriage(description: string) {
  const text = description.toLowerCase();

  // Network
  if (
    text.includes("wifi") ||
    text.includes("internet") ||
    text.includes("network") ||
    text.includes("connection")
  ) {
    return {
      category: "Network",
      priority: "High",
      confidence: 94,
      reasoning:
        "The ticket describes a problem connecting to the company network.",
    };
  }

  // Email
  if (
    text.includes("email") ||
    text.includes("outlook") ||
    text.includes("mail")
  ) {
    return {
      category: "Email",
      priority: "High",
      confidence: 94,
      reasoning:
        "The ticket describes an issue accessing the company email service.",
    };
  }

  // Software
  // Put this BEFORE Hardware because software requests
  // may also mention a laptop or computer.
  if (
    text.includes("software") ||
    text.includes("install") ||
    text.includes("application") ||
    text.includes("program")
  ) {
    return {
      category: "Software",
      priority: "Medium",
      confidence: 91,
      reasoning:
        "The ticket describes a software installation or application-related request.",
    };
  }

  // Hardware
  if (
    text.includes("printer") ||
    text.includes("keyboard") ||
    text.includes("mouse") ||
    text.includes("laptop") ||
    text.includes("computer")
  ) {
    return {
      category: "Hardware",
      priority: "Medium",
      confidence: 88,
      reasoning:
        "The ticket describes an issue involving company hardware.",
    };
  }

  // Other
  return {
    category: "Other",
    priority: "Medium",
    confidence: 60,
    reasoning:
      "The ticket could not be confidently classified into a specific support category.",
  };
}