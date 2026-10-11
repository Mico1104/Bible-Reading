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
      "Your daily reading starts here. Let's take a quick look around before you begin.",
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
    id: "mark-as-read",
    title: "Mark as read",
    description:
      "When you've finished today's reading, mark it complete to record your progress.",
    target: "mark-as-read",
  },
  {
    id: "progress",
    title: "Your progress",
    description:
      "See how far you've read through your current Bible-reading pass.",
    target: "progress",
  },
  {
    id: "quick-actions",
    title: "Bookmarks and notes",
    description:
      "Open your saved bookmarks and notes to revisit what stood out to you.",
    target: "quick-actions",
  },
  {
    id: "ask-about-passage",
    title: "Ask about today's passage",
    description:
      "Open a conversation to ask questions about today's Bible reading.",
    target: "ask-about-passage",
  },
  {
    id: "reflection",
    title: "Reflection",
    description:
      "Use today's prompt to think about how the passage connects with your day.",
    target: "reflection",
  },
];