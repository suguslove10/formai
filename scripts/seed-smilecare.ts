import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Ensure a default user exists for the chatbot
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
        "General Checkup & Teeth Cleaning",
        "Root Canal Treatment",
        "Braces & Orthodontics",
        "Emergency Dental Care",
        "Teeth Whitening & Cosmetic Dentistry",
        "Insurance Verification & Consultation",
      ],
    },
    {
      id: "dental_notes",
      type: "textarea",
      label: "Any specific dental concerns, pain, or insurance provider details?",
      required: false,
      placeholder: "Share any symptoms, preferred dates, or insurance provider name...",
    },
  ];

  const knowledgeBase = `### SmileCare Dental Clinic Services & Policies:
1. **Services Provided**:
   - General Dental Checkups & Deep Teeth Cleaning
   - Root Canal Treatments & Crown Restorations
   - Braces & Orthodontic Aligners (Invisalign)
   - Emergency Dental Care (same-day urgent pain relief)
   - Cosmetic Dentistry & Teeth Whitening
2. **Insurance & Payment Verification**:
   - SmileCare Dental accepts most major insurance providers (Delta Dental, Cigna, MetLife, Aetna, BlueCross BlueShield, Guardian, UnitedHealthcare).
   - Our front-desk team helps verify insurance coverage prior to your appointment.
   - Flexible zero-interest monthly payment plans available for major dental procedures.
3. **Appointment Hours**:
   - Clinic hours: Monday – Saturday (8:00 AM – 7:00 PM).
   - Appointments available in Morning, Afternoon, or Evening slots.
   - Urgent dental pain & emergency cases prioritized same-day.
4. **Follow-up Protocol**:
   - After capturing patient details, our patient care coordinator will call back within 24 hours to confirm the exact appointment time.`;

  const bot = await prisma.form.create({
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
      themeColor: "#0284c7 font-semibold",
    },
  });

  console.log("SUCCESS: SmileCare Dental Chatbot created!");
  console.log("Chatbot ID:", bot.id);
  console.log("Standalone URL: http://localhost:3000/c/" + bot.id);
  console.log("Embed Script Tag:\n<script src=\"http://localhost:3000/embed/formai.js\" data-form-id=\"" + bot.id + "\"></script>");
}

main()
  .catch((e) => {
    console.error("Error seeding SmileCare chatbot:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
