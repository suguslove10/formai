import { prisma } from "@/lib/prisma";

export async function getOrCreateDemoBotId(): Promise<string | null> {
  if (!process.env.DATABASE_URL) return null;

  try {
    // 1. Look for official demo bot created for demo_user
    let bot = await prisma.form.findFirst({
      where: {
        userId: "demo_user",
        type: "chatbot",
        status: "published",
      },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    });

    if (bot) return bot.id;

    // 2. Look for any bot with SmileCare in title
    bot = await prisma.form.findFirst({
      where: {
        title: { contains: "SmileCare", mode: "insensitive" },
        type: "chatbot",
        status: "published",
      },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    });

    if (bot) return bot.id;

    // 3. Auto-seed official SmileCare demo chatbot if not exists
    const user = await prisma.user.upsert({
      where: { clerkId: "demo_user" },
      update: {},
      create: {
        clerkId: "demo_user",
        email: "demo@smilecaredental.com",
        plan: "PRO",
      },
    });

    const fields = [
      {
        id: "patient_name",
        type: "text",
        label: "Full Name",
        required: true,
        placeholder: "e.g. Sarah Miller",
      },
      {
        id: "contact_phone",
        type: "text",
        label: "Phone Number",
        required: true,
        placeholder: "e.g. (555) 234-5678",
      },
      {
        id: "contact_email",
        type: "email",
        label: "Email Address",
        required: true,
        placeholder: "e.g. sarah@example.com",
      },
      {
        id: "patient_type",
        type: "radio",
        label: "Is this your first visit or are you a returning patient?",
        required: true,
        options: ["First-Time Patient", "Returning Patient"],
      },
      {
        id: "preferred_time",
        type: "select",
        label: "Preferred Appointment Time Window",
        required: true,
        options: [
          "Morning (8 AM - 12 PM)",
          "Afternoon (12 PM - 4 PM)",
          "Evening (4 PM - 7 PM)",
          "Urgent Emergency (Same Day)",
        ],
      },
      {
        id: "service_interest",
        type: "select",
        label: "Service you are looking for",
        required: false,
        options: [
          "General Checkup & Teeth Cleaning ($99 New Patient Special)",
          "Root Canal Treatment",
          "Braces & Orthodontic Aligners (Invisalign)",
          "Emergency Dental Care (Same-Day Relief)",
          "Cosmetic Dentistry & Teeth Whitening",
          "Insurance Verification & Consultation",
        ],
      },
      {
        id: "dental_notes",
        type: "textarea",
        label: "Any specific dental concerns, pain, or insurance details?",
        required: false,
        placeholder: "Share symptoms, preferred dates, or your insurance provider...",
      },
    ];

    const knowledgeBase = `### SmileCare Dental Clinic Services & Policies:
1. **Services & Pricing**:
   - General Dental Checkups & Deep Teeth Cleaning ($99 Special for new patients)
   - Root Canal Treatments & Crown Restorations
   - Braces & Orthodontic Aligners (Invisalign certified)
   - Emergency Dental Care (same-day urgent pain relief)
   - Cosmetic Dentistry & In-Office Teeth Whitening ($299)
2. **Insurance & Payment Verification**:
   - SmileCare Dental accepts most major insurance providers (Delta Dental, Cigna, MetLife, Aetna, BlueCross BlueShield, Guardian, UnitedHealthcare).
   - Our front-desk team helps verify insurance coverage prior to your appointment.
   - Flexible zero-interest monthly payment plans available for major dental procedures.
3. **Appointment Hours & Location**:
   - Clinic hours: Monday – Saturday (8:00 AM – 7:00 PM).
   - Location: 1204 Dental Plaza, Suite 300, Austin, TX.
   - Urgent dental pain & emergency cases prioritized same-day.
4. **Follow-up Protocol**:
   - After capturing patient details, our patient care coordinator will call back within 15 minutes to confirm the exact appointment time.`;

    const newBot = await prisma.form.create({
      data: {
        userId: user.clerkId,
        title: "SmileCare Dental Clinic — AI Receptionist",
        description:
          "Warm and professional AI receptionist assisting patients with appointment scheduling, dental service inquiries, and insurance verification.",
        fieldsJson: fields as any,
        status: "published",
        type: "chatbot",
        botName: "SmileCare Receptionist",
        botGreeting:
          "Hello! Welcome to SmileCare Dental Clinic. 🦷 How can I assist you today? Whether you'd like to book a checkup, ask about our dental services, or verify your insurance coverage, I'm here to help!",
        botPersona:
          "warm, reassuring, empathetic, highly professional healthcare receptionist",
        botAvatar: "🦷",
        knowledgeBase,
        themeColor: "#4f46e5",
      },
    });

    return newBot.id;
  } catch (e) {
    console.error("Error in getOrCreateDemoBotId:", e);
    return null;
  }
}
