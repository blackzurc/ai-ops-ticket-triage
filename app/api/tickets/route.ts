
import { supabaseAdmin } from "../../lib/supabaseAdmin";

const CATEGORY_TO_SKILL: Record<string, string | null> = {
    Email: "Email & Collaboration",
    Network: "Network",
    Software: "Software",
    Hardware: "Hardware",
    Other: null,
};

const SLA_MINUTES: Record<string, number> = {
    High: 5,
    Medium: 10,
    Low: 15,
};

export async function POST(request: Request) {
    try {
        // 1. Verify the employee's access token
        const authorization = request.headers.get("authorization");

        if (!authorization?.startsWith("Bearer ")) {
            return Response.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const accessToken = authorization.substring(7);

        const {
            data: { user },
            error: authError,
        } = await supabaseAdmin.auth.getUser(accessToken);

        if (authError || !user) {
            return Response.json(
                { error: "Invalid or expired session" },
                { status: 401 }
            );
        }

        // 2. Verify the user's profile
        const { data: profile, error: profileError } =
            await supabaseAdmin
                .from("profiles")
                .select("id, full_name, email, role")
                .eq("id", user.id)
                .single();

        if (profileError || !profile) {
            console.error("PROFILE LOOKUP FAILED");
            console.error("Authenticated user ID:", user.id);
            console.error("Profile data:", profile);
            console.error("Profile error:", profileError);

            return Response.json(
                { error: "User profile not found" },
                { status: 403 }
            );
        }

        if (profile.role !== "employee") {
            return Response.json(
                { error: "Only employees can create tickets" },
                { status: 403 }
            );
        }

        // 3. Validate ticket input
        const { title, description } = await request.json();

        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof description !== "string" ||
            !description.trim()
        ) {
            return Response.json(
                { error: "Title and description are required" },
                { status: 400 }
            );
        }

        // 4. Reuse the existing Gemini AI triage API
        const aiResponse = await fetch(
            new URL("/api/ai-triage", request.url),
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                }),
                cache: "no-store",
            }
        );

        const aiResult = await aiResponse.json();

        if (!aiResponse.ok) {
            return Response.json(
                {
                    error: aiResult.error || "AI triage failed",
                },
                { status: aiResponse.status }
            );
        }

        // 5. Find staff with the matching specialisation
        const requiredSkill =
            CATEGORY_TO_SKILL[aiResult.category];

        let assignedStaff: {
            id: string;
            full_name: string | null;
            email: string;
            workload: number;
        } | null = null;

        if (requiredSkill) {
            const { data: skillRecords, error: skillError } =
                await supabaseAdmin
                    .from("it_staff_skills")
                    .select("staff_id")
                    .eq("skill", requiredSkill);

            if (skillError) {
                console.error("Skill lookup error:", skillError);

                return Response.json(
                    { error: "Failed to find matching IT staff" },
                    { status: 500 }
                );
            }

            const staffIds = [
                ...new Set(
                    (skillRecords || []).map((record) => record.staff_id)
                ),
            ];

            if (staffIds.length > 0) {
                const { data: staffProfiles, error: staffError } =
                    await supabaseAdmin
                        .from("profiles")
                        .select("id, full_name, email")
                        .eq("role", "it_support")
                        .in("id", staffIds);

                if (staffError) {
                    console.error("Staff lookup error:", staffError);

                    return Response.json(
                        { error: "Failed to load IT staff" },
                        { status: 500 }
                    );
                }

                // 6. Count active tickets for each matching staff member
                const staffWorkloads = await Promise.all(
                    (staffProfiles || []).map(async (staff) => {
                        const { count, error: workloadError } =
                            await supabaseAdmin
                                .from("tickets")
                                .select("id", {
                                    count: "exact",
                                    head: true,
                                })
                                .eq("assigned_user_id", staff.id)
                                .in("status", ["Open", "In Progress"]);

                        if (workloadError) {
                            throw workloadError;
                        }

                        return {
                            ...staff,
                            workload: count ?? 0,
                        };
                    })
                );

                // 7. Select the matching staff member with the lowest workload
                staffWorkloads.sort(
                    (a, b) =>
                        a.workload - b.workload ||
                        a.id.localeCompare(b.id)
                );

                assignedStaff = staffWorkloads[0] || null;
            }
        }

        // 8. Set assignment and SLA information
        const assignedUserId = assignedStaff?.id || null;

        const assignedTo = assignedStaff
            ? assignedStaff.full_name || assignedStaff.email
            : "Unassigned - Manual Review";

        const slaMinutes =
            SLA_MINUTES[aiResult.priority] ?? 15;

        const now = new Date();

        const slaDeadline = new Date(
            now.getTime() + slaMinutes * 60 * 1000
        );

        // Timestamp-based ID to reduce collisions from random 4-digit IDs
        const ticketId = `TK-${Date.now()}`;

        // 9. Save the ticket
        const newTicket = {
            id: ticketId,
            title: title.trim(),
            description: description.trim(),
            category: aiResult.category,
            priority: aiResult.priority,
            status: "Open",
            assigned_to: assignedTo,
            assigned_user_id: assignedUserId,
            employee: profile.full_name || profile.email,
            created_at: now.toISOString(),
            user_id: user.id,
            conversation: [
                {
                    sender: profile.full_name || profile.email,
                    role: "employee",
                    message: description.trim(),
                },
            ],
            ai_category: aiResult.category,
            ai_priority: aiResult.priority,
            ai_confidence: aiResult.confidence,
            ai_reasoning: aiResult.reasoning,
            sla_deadline: slaDeadline.toISOString(),
        };

        const { error: insertError } = await supabaseAdmin
            .from("tickets")
            .insert(newTicket);

        if (insertError) {
            console.error("Ticket insert error:", insertError);

            return Response.json(
                { error: "Failed to save ticket" },
                { status: 500 }
            );
        }

        return Response.json(
            {
                message: "Ticket created successfully",
                ticket: {
                    id: ticketId,
                    category: aiResult.category,
                    priority: aiResult.priority,
                    assigned_to: assignedTo,
                    assigned_user_id: assignedUserId,
                    workload_before_assignment:
                        assignedStaff?.workload ?? null,
                    sla_deadline: slaDeadline.toISOString(),
                    ai_confidence: aiResult.confidence,
                    ai_reasoning: aiResult.reasoning,
                },
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Ticket creation error:", error);

        return Response.json(
            { error: "Unexpected error while creating ticket" },
            { status: 500 }
        );
    }
}
