import type { AppState, Area } from "./types"


export const areaMeta: Record<Area, {
  label: string
  short: string
  description: string
}> = {
  reflect: {
    label: "Reflect",
    short: "A quiet note",
    description: "Journal, notice, and make sense of things.",
  },
  create: {
    label: "Create",
    short: "Make something",
    description: "LEGO builds, reading, gaming, and ideas for a solo trip to Asia.",
  },
  connect: {
    label: "Connect",
    short: "Reach out",
    description: "Friends, plans, and the people you want nearby.",
  },
  move: {
    label: "Move",
    short: "Move your way",
    description: "Walks with Seb, time outdoors, strength, mobility, or rest.",
  },
  money: {
    label: "Money",
    short: "Feel informed",
    description: "Spending, commitments, and room for what matters.",
  },
  home: {
    label: "Home",
    short: "Tend to life",
    description: "Routines, errands, admin, and genuine rest.",
  },
}

export const emptyState: AppState = {
  version: 1,
  onboarded: false,
  name: "",
  priorities: [],
  density: "few",
  checkIn: "steady",
  plan: [],
  journal: [],
  projects: [],
  people: [],
  transactions: [],
  routines: [],
  goals: [],
  workout: { active: false, current: 0, sets: [] },
  voiceNotes: [],
  moneyLessonsCompleted: [],
  movementNotes: [],
  gymSessionPlans: [],
  breatheSessions: [],
  workoutHistory: [],
  weeklyReviews: [],
}

// No example content: this studio starts empty and is filled in through setup.
export const demoState: AppState = { ...emptyState }
