export interface Email {
  id: string;
  sender: string;
  avatar: string;
  avatarColor: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
}

// Seed data pools
const SENDERS = [
  { name: "Sarah Johnson", initials: "SJ", color: "#EF4444" },
  { name: "Marcus Chen", initials: "MC", color: "#0EA5E9" },
  { name: "Priya Nair", initials: "PN", color: "#F59E0B" },
  { name: "Lena Müller", initials: "LM", color: "#8B5CF6" },
  { name: "James Okafor", initials: "JO", color: "#10B981" },
  { name: "Aya Tanaka", initials: "AT", color: "#EC4899" },
  { name: "Carlos Rivera", initials: "CR", color: "#F97316" },
  { name: "Nina Patel", initials: "NP", color: "#06B6D4" },
  { name: "Tom Bradley", initials: "TB", color: "#84CC16" },
  { name: "Elena Vasquez", initials: "EV", color: "#A855F7" },
  { name: "GitHub", initials: "GH", color: "#24292E" },
  { name: "Vercel", initials: "V", color: "#000000" },
  { name: "Stripe", initials: "S", color: "#635BFF" },
  { name: "Linear", initials: "L", color: "#5E6AD2" },
  { name: "Notion", initials: "N", color: "#191919" },
  { name: "Figma", initials: "F", color: "#F24E1E" },
  { name: "Apple", initials: "A", color: "#6B7280" },
  { name: "Google", initials: "G", color: "#4285F4" },
  { name: "Slack", initials: "SL", color: "#4A154B" },
  { name: "Jira", initials: "J", color: "#0052CC" },
  { name: "David Kim", initials: "DK", color: "#F43F5E" },
  { name: "Amara Diallo", initials: "AD", color: "#14B8A6" },
  { name: "Finn Larsson", initials: "FL", color: "#FB923C" },
  { name: "Mia Hoffman", initials: "MH", color: "#818CF8" },
  { name: "Raj Sharma", initials: "RS", color: "#34D399" },
];

const SUBJECTS = [
  "Q4 Design Review — Final Feedback",
  "Re: Sprint Planning Tomorrow",
  "Deployment Successful — Production",
  "Your Figma file is ready",
  "[swipe-to-archive] PR #47 merged",
  "Your receipt from the App Store",
  "Catch-up this week?",
  "New comment on your pull request",
  "Action required: Update billing info",
  "Weekly digest — top posts for you",
  "Meeting notes from today's standup",
  "Your subscription renews in 3 days",
  "🎉 You've been invited to the workspace",
  "Re: Onboarding flow redesign",
  "Security alert: New sign-in detected",
  "Feedback on the new landing page",
  "Invoice #2048 has been paid",
  "Your build failed — check the logs",
  "Reminder: Performance review deadline",
  "New issue assigned to you",
  "Re: API rate-limit discussion",
  "Team lunch on Friday?",
  "You have 3 pending code reviews",
  "Monthly analytics report",
  "Re: Typography tokens cleanup",
  "Your trial ends tomorrow",
  "Approved: PTO request for July 20–24",
  "New release: v2.4.1 is live",
  "Candidate for the Senior iOS role",
  "Re: Dark mode accessibility pass",
  "Heads up — server maintenance tonight",
  "Contract renewal — action needed",
  "Re: Scroll performance deep-dive",
  "Your password was changed",
  "We noticed unusual activity on your account",
  "Re: Component library migration",
  "You're almost at your storage limit",
  "New PR ready for review",
  "Design handoff ready in Figma",
  "Re: Cross-platform font rendering",
];

const PREVIEWS = [
  "Hey! I've gone through the prototype you shared yesterday. The new layout is great — love the micro-interactions.",
  "Can we push the standup to 10 AM? I have a conflicting call with the EU team at 9.",
  "Your latest push to main has been deployed. Build time: 43 s. 0 errors, 2 warnings.",
  "Finished cleaning up the component library. Everything is auto-layouted and uses the new variable tokens.",
  "SwipeCard: Add haptic feedback and blur intensity interpolation. Merged by @kelvin into main. +142 −38.",
  "Amount billed: $0.00. App: Expo Go. Thank you for using TestFlight.",
  "It's been a while. Are you free for a quick coffee catch-up? I'm around Wednesday afternoon.",
  "Someone left a comment on PR #51: 'Looks great overall, just one nit about the transition timing.'",
  "We couldn't charge your card ending in 4242. Please update your payment method by Friday to avoid interruption.",
  "Top threads this week: Scroll-driven animations, View Transitions API, and the new CSS anchor positioning spec.",
  "✅ Reviewed auth flow · 🔄 In progress: animation tokens · ⏳ Blocked: design sign-off on modal sheet.",
  "Your Pro plan subscription renews on July 19 for $12/month. No action needed.",
  "Kelvin has added you to the swipe-to-archive workspace. Click to accept.",
  "Thanks for sharing the updated screens. The exit animation on the sheet feels much smoother now.",
  "We detected a new sign-in from Safari on macOS Sequoia. If this wasn't you, secure your account now.",
  "Overall really solid. One thing — the CTA button might need more contrast for accessibility.",
  "Invoice #2048 for $840.00 has been marked as paid. Thank you for your business.",
  "The production build failed at step 3. Check the logs at vercel.com/dashboard for details.",
  "Just a reminder that self-reviews are due by EOD Friday. Complete yours in Lattice.",
  "Issue #312 'Swipe flicker on Android' has been assigned to you by @marcus.",
  "Following up on the thread from last week — I think we should cap at 100 req/min per key.",
  "We're doing lunch at Tartine on Friday at 12:30. Let me know if you're in!",
  "You have 3 open PRs waiting for your review. The oldest is 2 days old.",
  "June analytics: 12 k MAU (+8%), 4.2 min avg session, 23% D7 retention. Full report attached.",
  "I cleaned up the spacing tokens. The rem vs px inconsistency is gone. Lmk what you think.",
  "Your 14-day trial expires tomorrow. Upgrade to keep access to all Pro features.",
  "Your PTO request for July 20–24 has been approved by your manager.",
  "We just shipped v2.4.1 with fixes for the keyboard avoidance issue and the dark mode flicker.",
  "Attached is the résumé for the Senior iOS candidate we discussed. She's available for interviews next week.",
  "Went through the dark mode pass — a few foreground colours don't hit 4.5:1 against the new backgrounds.",
  "Scheduled maintenance will take place tonight from 02:00–04:00 UTC. Expect brief downtime.",
  "Your annual contract is up for renewal on August 1. Please review and sign the updated terms.",
  "I profiled the scroll on a Pixel 7. The main culprit is the shadow calculation inside the row render.",
  "For security reasons, your password was changed on July 15 at 11:42 AM. Contact support if you didn't do this.",
  "There were 5 failed login attempts on your account. We've temporarily locked it. Tap to verify your identity.",
  "The migration from v2 to v3 is ~60% done. I'll have a branch ready for review by Thursday.",
  "You've used 9.2 GB of your 10 GB storage. Consider upgrading or archiving old files.",
  "PR #58 'feat: flash-list integration' is ready for review. All checks passed.",
  "The Figma file has been updated with final spacing and colour specs. Ready for dev handoff.",
  "Tested on Android 14 and iOS 18 — fonts render consistently now. The fix was adding `includeFontPadding: false`.",
];

const TIMES = [
  "9:41 AM",
  "8:15 AM",
  "7:02 AM",
  "6:30 AM",
  "11:58 PM",
  "Yesterday",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Jul 10",
  "Jul 8",
  "Jul 5",
  "Jun 30",
  "Jun 28",
  "2 min ago",
  "5 min ago",
  "12 min ago",
  "1 hr ago",
];

// Generator
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function generateEmails(count = 2500): Email[] {
  const rand = seededRandom(42); // deterministic — same list every render
  const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

  return Array.from({ length: count }, (_, i) => {
    const sender = pick(SENDERS);
    return {
      id: String(i + 1),
      sender: sender.name,
      avatar: sender.initials,
      avatarColor: sender.color,
      subject: pick(SUBJECTS),
      preview: pick(PREVIEWS),
      time: pick(TIMES),
      unread: rand() < 0.3,
    };
  });
}
