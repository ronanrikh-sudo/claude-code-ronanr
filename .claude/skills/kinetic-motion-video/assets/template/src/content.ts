// Everything a viewer reads on screen lives here, so a new project mostly means
// editing this file + script.json. Keep on-screen copy short (<= ~8 words per moment).
// All names below are fictional placeholders.

export const HOOK = {
  counter: { label: "Queue", target: 300, unit: "tickets" },
  // Cards that flood the screen (sender + subject + chip label)
  senders: ["Avery Chen", "Jordan Patel", "Sam Okafor", "Riley Morgan", "Casey Nguyen", "Drew Silva", "Quinn Harper", "Alex Romero"],
  subjects: ["Where is my order?", "How do I reset my password?", "Refund status", "Change delivery address", "Invoice copy please"],
  // Chips that pile up on clause 2. `word` = the VO word the chip lands on.
  chips: [
    { label: "Where is my order?", word: "Most" },
    { label: "Reset password", word: "same" },
    { label: "Refund status", word: "five" },
  ],
};

export const TERMINAL = {
  title: "assistant — ~/support",
  welcome: "Welcome to Assist",
  prompt: [
    { text: "Draft replies for every open ticket in " },
    { text: "Queue: Support", strong: true },
    { text: ". Use the " },
    { text: "/house-tone", accent: true },
    { text: " skill and link the help centre." },
  ],
  calls: [
    { title: "helpdesk · list_tickets", note: "(read-only)", result: "300 open tickets" },
    { title: "Skill(house-tone)", note: "", result: "Drafting replies…" },
  ],
  chips: [
    { label: "Helpdesk connector", sub: "Read-only access", color: "#3B6FD8", glyph: "H" },
    { label: "Shared skill", sub: "house-tone", color: "#D97757", glyph: "S" },
  ],
};

export const CHECKLIST = {
  heading: "Before sending",
  // One item per clause of the ticked segment (script.json "ticks").
  items: ["House tone matched", "Help article linked", "Unusual cases flagged"],
  preview: {
    title: "Re: Where is my order?",
    lines: ["Hi Avery, thanks for reaching out.", "Your parcel left our warehouse today.", "Track it any time here: help/orders"],
  },
};

export const KINETIC = {
  from: ["Hours", "of", "triage"],   // first line (dims once the pivot lands)
  pivot: "become",                   // the arrow draws on this word
  to: ["minutes", "of", "review."],  // accent line
};

export const FINALE = {
  tiles: [
    { color: "#3B6FD8", glyph: "H" },
    { color: "#1F8A5B", glyph: "S" },
    { color: "#2B3A55", glyph: "KB" },
  ],
};
