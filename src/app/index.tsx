import SwipeCard from "@/components/SwipeCard";
import Toast from "@/components/Toast";
import { generateEmails, type Email } from "@/data/emails";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const ALL_EMAILS = generateEmails(2500);
const PAGE_SIZE = 50;

export default function Index() {
  const [emails, setEmails] = useState<Email[]>(ALL_EMAILS);
  const [lastArchived, setLastArchived] = useState<{
    email: Email;
    index: number;
  } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastSequence, setToastSequence] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [lastRestoredId, setLastRestoredId] = useState<string | null>(null);

  const emailsRef = useRef(emails);
  const lastArchivedRef = useRef(lastArchived);
  const undoItemRef = useRef<{ email: Email; index: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoneIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    emailsRef.current = emails;
  }, [emails]);

  useEffect(() => {
    lastArchivedRef.current = lastArchived;
  }, [lastArchived]);

  const handleArchiveStart = useCallback((id: string) => {
    const originalIndex = emailsRef.current.findIndex((e) => e.id === id);
    if (originalIndex === -1) return;
    const archivedEmail = emailsRef.current[originalIndex];

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const item = { email: archivedEmail, index: originalIndex };
    undoItemRef.current = item;
    setLastArchived(item);
    setToastVisible(true);
    setToastSequence((prev) => prev + 1);

    timerRef.current = setTimeout(() => {
      setToastVisible(false);
      setTimeout(() => {
        setLastArchived((current) =>
          current?.email.id === archivedEmail.id ? null : current,
        );
      }, 200);
    }, 1500);
  }, []);

  const handleArchiveComplete = useCallback((id: string) => {
    if (undoneIdsRef.current.has(id)) {
      undoneIdsRef.current.delete(id);
      return;
    }
    setEmails((prev) => (prev || []).filter((e) => e.id !== id));
  }, []);

  const handleUndo = useCallback(() => {
    const item = undoItemRef.current;
    if (!item) return;
    undoItemRef.current = null;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const isStillInEmails = emailsRef.current.some(
      (e) => e.id === item.email.id,
    );
    if (isStillInEmails) {
      undoneIdsRef.current.add(item.email.id);
    } else {
      setLastRestoredId(item.email.id);
      setEmails((prev) => {
        const copy = [...(prev || [])];
        const insertIdx = Math.min(item.index, copy.length);
        copy.splice(insertIdx, 0, item.email);
        return copy;
      });
      setVisibleCount((prev) => Math.max(prev, item.index + 1));
      setTimeout(() => {
        setLastRestoredId((cur) => (cur === item.email.id ? null : cur));
      }, 350);
    }

    setToastVisible(false);
    setLastArchived(null);
  }, []);

  const handleDismissToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToastVisible(false);
    setTimeout(() => {
      setLastArchived(null);
    }, 200);
  }, []);

  const safeEmails = useMemo(() => emails || [], [emails]);

  const visibleEmails = useMemo(
    () => safeEmails.slice(0, visibleCount),
    [safeEmails, visibleCount],
  );

  const unreadCount = useMemo(
    () => safeEmails.filter((e) => e.unread).length,
    [safeEmails],
  );

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => {
      const next = prev + PAGE_SIZE;
      return next >= safeEmails.length ? safeEmails.length : next;
    });
  }, [safeEmails.length]);

  const renderFooter = useCallback(() => {
    if (visibleCount >= safeEmails.length) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#6366F1" />
      </View>
    );
  }, [visibleCount, safeEmails.length]);

  const renderItem = useCallback(
    ({ item }: { item: Email }) => (
      <SwipeCard
        email={item}
        onArchiveStart={handleArchiveStart}
        onArchiveComplete={handleArchiveComplete}
        isRestoring={item.id === lastRestoredId}
      />
    ),
    [handleArchiveStart, handleArchiveComplete, lastRestoredId],
  );

  const keyExtractor = useCallback((item: Email) => item.id, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
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

        <View style={styles.divider} />

        {visibleEmails.length === 0 && safeEmails.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>All done</Text>
            <Text style={styles.emptySub}>Nothing left in your inbox.</Text>
          </View>
        ) : (
          <FlatList
            data={visibleEmails}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            initialNumToRender={50}
            maxToRenderPerBatch={50}
            updateCellsBatchingPeriod={30}
            windowSize={99999}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.4}
            ListFooterComponent={renderFooter}
          />
        )}
      </SafeAreaView>

      <Toast
        visible={toastVisible && lastArchived !== null}
        sequence={toastSequence}
        message="Moved to bin"
        onUndo={handleUndo}
        onDismiss={handleDismissToast}
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
  listContent: {
    paddingBottom: 80,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: "#E0E7FF",
    borderTopColor: "#6366F1",
  },
});
