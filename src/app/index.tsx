import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import SwipeCard from "@/components/SwipeCard";
import ArchivedToast from "@/components/ArchivedToast";

const SAMPLE_EMAILS = [
  {
    id: "1",
    sender: "Sarah Johnson",
    avatar: "SJ",
    avatarColor: "#EF4444",
    subject: "Q4 Design Review - Final Feedback",
    preview:
      "Hey! I've gone through the prototype you shared yesterday. The new layout is great, love the micro-interactions on the card.",
    time: "9:41 AM",
    unread: true,
  },
  {
    id: "2",
    sender: "Marcus Chen",
    avatar: "MC",
    avatarColor: "#0EA5E9",
    subject: "Re: Sprint Planning Tomorrow",
    preview:
      "Can we push the standup to 10am? I have a conflicting call with the EU team at 9. The animation PR is almost ready.",
    time: "8:15 AM",
    unread: true,
  },
  {
    id: "3",
    sender: "Vercel",
    avatar: "V",
    avatarColor: "#000000",
    subject: "Deployment Successful - Production",
    preview:
      "Your latest push to main has been deployed. Build time: 43s. 0 errors, 2 warnings.",
    time: "7:02 AM",
    unread: false,
  },
  {
    id: "4",
    sender: "Priya Nair",
    avatar: "PN",
    avatarColor: "#F59E0B",
    subject: "Your Figma file is ready",
    preview:
      "Finished cleaning up the component library. Everything is auto-layouted and uses the new variable tokens.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "5",
    sender: "GitHub",
    avatar: "GH",
    avatarColor: "#24292E",
    subject: "[swipe-to-archive] PR #47 merged",
    preview:
      "SwipeCard: Add haptic feedback and blur intensity interpolation. Merged by @kelvin into main. +142 −38.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "6",
    sender: "Apple",
    avatar: "A",
    avatarColor: "#6B7280",
    subject: "Your receipt from the App Store",
    preview:
      "Amount billed: $0.00. App: Expo Go. Thank you for using TestFlight.",
    time: "Mon",
    unread: false,
  },
  {
    id: "7",
    sender: "Lena Müller",
    avatar: "LM",
    avatarColor: "#8B5CF6",
    subject: "Catch-up this week?",
    preview:
      "Hey! It's been a while. Are you free for a quick coffee catch-up? I'm around Wednesday afternoon.",
    time: "Sun",
    unread: false,
  },
];

export default function Index() {
  const [emails, setEmails] = useState(SAMPLE_EMAILS);
  const [showToast, setShowToast] = useState(false);
  const [toastSender, setToastSender] = useState("");

  // Keep a ref to the archived email and its original index so Undo can restore it
  const lastArchivedRef = useRef<{ email: typeof SAMPLE_EMAILS[0]; index: number } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleArchive = useCallback((id: string, sender: string) => {
    setEmails((prev) => {
      const index = prev.findIndex((e) => e.id === id);
      const email = prev[index];
      if (email) {
        lastArchivedRef.current = { email, index };
      }
      return prev.filter((e) => e.id !== id);
    });
    setToastSender(sender);
    setShowToast(true);

    // Clear any previous timer
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setShowToast(false);
      lastArchivedRef.current = null;
    }, 2800);
  }, []);

  const handleUndo = useCallback(() => {
    // Cancel the auto-dismiss timer
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setShowToast(false);

    // Restore the archived email at its original position
    const saved = lastArchivedRef.current;
    if (saved) {
      setEmails((prev) => {
        const next = [...prev];
        const insertAt = Math.min(saved.index, next.length);
        next.splice(insertAt, 0, saved.email);
        return next;
      });
      lastArchivedRef.current = null;
    }
  }, []);


  const unreadCount = emails.filter((e) => e.unread).length;

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.heading}>Inbox</Text>
            {unreadCount > 0 && (
              <Text style={styles.subheading}>{unreadCount} unread</Text>
            )}
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>KA</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Email list */}
        {emails.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>All done</Text>
            <Text style={styles.emptySub}>Nothing left in your inbox.</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {emails.map((email) => (
              <SwipeCard
                key={email.id}
                email={email}
                onArchive={handleArchive}
              />
            ))}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        )}
      </SafeAreaView>

      <ArchivedToast
        visible={showToast}
        sender={toastSender}
        onUndo={handleUndo}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
    fontWeight: "400",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6366F1",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  bottomSpacer: {
    height: 80,
  },
});
