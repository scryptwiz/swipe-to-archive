/* eslint-disable react-hooks/immutability */
import { memo, useCallback, useEffect, useMemo } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.4;

interface Email {
  id: string;
  sender: string;
  avatar: string;
  avatarColor: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
}

interface SwipeCardProps {
  email: Email;
  onArchiveStart?: (id: string, sender: string) => void;
  onArchiveComplete: (id: string) => void;
  isRestoring?: boolean;
}

function SwipeCard({
  email,
  onArchiveStart,
  onArchiveComplete,
  isRestoring = false,
}: SwipeCardProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const wasRestoringOnMount = useMemo(() => isRestoring, []);

  const translateX = useSharedValue(0);
  const entranceX = useSharedValue(wasRestoringOnMount ? -SCREEN_WIDTH * 0.2 : 0);
  const cardOpacity = useSharedValue(wasRestoringOnMount ? 0 : 1);
  const isArchiving = useSharedValue(false);
  const rowHeight = useSharedValue(0);
  const wrapperHeight = useSharedValue(-1);

  useEffect(() => {
    if (wasRestoringOnMount) {
      cardOpacity.value = withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.ease),
      });
      entranceX.value = withSpring(0, {
        damping: 22,
        stiffness: 280,
        mass: 0.6,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fireArchiveStart = useCallback(() => {
    onArchiveStart?.(email.id, email.sender);
  }, [email.id, email.sender, onArchiveStart]);

  const fireArchiveComplete = useCallback(() => {
    onArchiveComplete(email.id);
  }, [email.id, onArchiveComplete]);

  const triggerArchive = useCallback(() => {
    "worklet";
    scheduleOnRN(fireArchiveStart);
    translateX.value = withTiming(-SCREEN_WIDTH * 1.2, { duration: 230 });
    cardOpacity.value = withTiming(0, { duration: 190 });
    wrapperHeight.value = rowHeight.value > 0 ? rowHeight.value : 80;
    wrapperHeight.value = withTiming(
      0,
      { duration: 230, easing: Easing.out(Easing.ease) },
      () => {
        scheduleOnRN(fireArchiveComplete);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pan = Gesture.Pan()
    .activeOffsetX([-12, -1])
    .failOffsetY([-6, 6])
    .onUpdate((e) => {
      translateX.value = Math.min(0, e.translationX);
    })
    .onEnd((e) => {
      const shouldArchive =
        Math.abs(e.translationX) > SWIPE_THRESHOLD || e.velocityX < -800;

      if (shouldArchive && !isArchiving.value) {
        isArchiving.value = true;
        triggerArchive();
      } else {
        translateX.value = withSpring(0, {
          damping: 22,
          stiffness: 220,
          mass: 0.8,
        });
      }
    });

  const wrapperStyle = useAnimatedStyle(() => {
    return wrapperHeight.value < 0
      ? { overflow: "hidden" }
      : { height: wrapperHeight.value, overflow: "hidden" };
  });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value + entranceX.value }],
    opacity: cardOpacity.value,
  }));

  const archiveBgStyle = useAnimatedStyle(() => {
    const progress = Math.abs(translateX.value) / SWIPE_THRESHOLD;
    return {
      opacity: interpolate(
        progress,
        [0, 0.4, 1],
        [0, 0.7, 1],
        Extrapolation.CLAMP,
      ),
    };
  });

  return (
    <Animated.View style={[styles.wrapper, wrapperStyle]}>
      <Animated.View style={[styles.archiveBehind, archiveBgStyle]}>
        <Text style={styles.archiveText}>Archive</Text>
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View
          style={[styles.card, cardStyle]}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0 && rowHeight.value === 0) {
              rowHeight.value = h;
            }
          }}
        >
          {email.unread && <View style={styles.unreadBar} />}

          <View style={styles.row}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: email.avatarColor + "18" },
              ]}
            >
              <Text style={[styles.avatarText, { color: email.avatarColor }]}>
                {email.avatar}
              </Text>
            </View>

            <View style={styles.content}>
              <View style={styles.topLine}>
                <Text
                  style={[styles.sender, email.unread && styles.senderBold]}
                  numberOfLines={1}
                >
                  {email.sender}
                </Text>
                <Text style={styles.time}>{email.time}</Text>
              </View>
              <Text style={styles.subject} numberOfLines={1}>
                {email.subject}
              </Text>
              <Text style={styles.preview} numberOfLines={2}>
                {email.preview}
              </Text>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

export default memo(SwipeCard);

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    marginBottom: 1,
  },
  archiveBehind: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#EEF2FF",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: 28,
    gap: 4,
  },
  archiveText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6366F1",
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    position: "relative",
  },
  unreadBar: {
    position: "absolute",
    left: 0,
    top: 14,
    bottom: 14,
    width: 3,
    backgroundColor: "#6366F1",
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  topLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  sender: {
    fontSize: 15,
    fontWeight: "400",
    color: "#374151",
    flex: 1,
  },
  senderBold: {
    fontWeight: "600",
    color: "#111827",
  },
  time: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 8,
    flexShrink: 0,
  },
  subject: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 3,
  },
  preview: {
    fontSize: 13,
    color: "#9CA3AF",
    lineHeight: 18,
  },
});
