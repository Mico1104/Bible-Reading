export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  target: string;
};

export const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to your Bible journey",
    description:
      "This is your daily Bible reading space. Let's take a quick look around.",
    target: "dashboard-header",
  },
  {
    id: "todays-reading",
    title: "Today's Reading",
    description:
      "Here you'll find the Bible chapters assigned for you to read today.",
    target: "todays-reading",
  },
  {
    id: "chapter-controls",
    title: "Reading tools",
    description:
      "Use the available reading controls to make your Bible reading easier and more personal.",
    target: "chapter-controls",
  },
  {
    id: "memory-verse",
    title: "Memory Verse",
    description:
      "A verse from today's reading is selected to help you reflect on and remember God's Word.",
    target: "memory-verse",
  },
  {
    id: "mark-as-read",
    title: "Mark as Read",
    description:
      "When you finish today's reading, mark it as read to keep track of your progress.",
    target: "mark-as-read",
  },
  {
    id: "ask-about-passage",
    title: "Ask About Today's Passage",
    description:
      "Have a question about what you just read? Ask the AI about today's passage for a simple explanation.",
    target: "ask-about-passage",
  },
  {
    id: "reflection",
    title: "Daily Reflection",
    description:
      "Take a moment to reflect on what today's reading means to you.",
    target: "reflection",
  },
  {
    id: "progress",
    title: "Your Progress",
    description:
      "Keep an eye on your reading progress and celebrate your consistency.",
    target: "progress",
  },
  {
    id: "finish",
    title: "You're ready to begin",
    description:
      "That's the quick tour. Now let's get into today's reading.",
    target: "todays-reading",
  },
];