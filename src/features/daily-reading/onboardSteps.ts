export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  target: string;
};

export const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Daily Word",
    description:
      "This is your daily reading space. Start with the greeting, today's plan, and the reading itself.",
    target: "dashboard-header",
  },
  {
    id: "todays-reading",
    title: "Today's reading",
    description:
      "Here you'll find the chapter or chapters assigned for today and the main context for your reading.",
    target: "todays-reading",
  },
  {
    id: "memory-verse",
    title: "Memory verse",
    description:
      "A verse from today's reading is highlighted here to help you reflect and remember what matters most.",
    target: "memory-verse",
  },
  {
    id: "full-passage",
    title: "Full passage",
    description:
      "Open the full assignment when you want to read more carefully or revisit a passage in context.",
    target: "full-passage",
  },
  {
    id: "mark-as-read",
    title: "Mark as read",
    description:
      "When you finish today's reading, mark it complete to keep your reading streak moving forward.",
    target: "mark-as-read",
  },
  {
    id: "progress",
    title: "Your progress",
    description:
      "This section shows how far you've come through the current reading pass and how consistent you've been.",
    target: "progress",
  },
  {
    id: "quick-actions",
    title: "Quick actions",
    description:
      "Jump to your saved verses or notes whenever you want to revisit what stood out to you.",
    target: "quick-actions",
  },
  {
    id: "ask-about-passage",
    title: "Ask about today's passage",
    description:
      "Have a question about what you just read? Ask the AI for a brief explanation or reflection.",
    target: "ask-about-passage",
  },
  {
    id: "reflection",
    title: "Daily reflection",
    description:
      "Take a moment to reflect on what this passage means for your day and your life.",
    target: "reflection",
  },
];