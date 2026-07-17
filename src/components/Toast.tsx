/* eslint-disable react-hooks/immutability */
import { useCallback, useEffect, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";

interface ToastProps {
  visible: boolean;
  sequence?: number;
  message?: string;
  onUndo: () => void;
  onDismiss?: () => void;
}

export default function Toast({
  visible,
  sequence = 0,
  message = "Moved to bin",
  onUndo,
  onDismiss,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(120);
  const opacity = useSharedValue(0);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (visible) {
      if (!isInitialMount.current && translateY.value < 60) {
        // Safe sequential bounce using withSequence to prevent UI thread crashes:
        translateY.value = withSequence(
          withTiming(14, { duration: 75 }),
          withSpring(0, {
            damping: 18,
            stiffness: 300,
            mass: 0.6,
          }),
        );
        opacity.value = withSequence(
          withTiming(0.6, { duration: 75 }),
          withTiming(1, { duration: 120 }),
        );
      } else {
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 280,
          mass: 0.7,
        });
        opacity.value = withTiming(1, { duration: 180 });
      }
    } else {
      translateY.value = withTiming(120, {
        duration: 180,
        easing: Easing.in(Easing.cubic),
      });
      opacity.value = withTiming(0, { duration: 160 });
    }
    isInitialMount.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, sequence]);

  const fireDismiss = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      } else {
        translateY.value = e.translationY * 0.15;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 25 || e.velocityY > 300) {
        scheduleOnRN(fireDismiss);
      } else {
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 240,
          mass: 0.8,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const handleUndoPress = useCallback(() => {
    opacity.value = 0;
    translateY.value = 120;
    onUndo();
  }, [opacity, translateY, onUndo]);

  const bottomOffset = Math.max(insets.bottom, 16) + 12;

  return (
    <View
      style={[styles.container, { bottom: bottomOffset }]}
      pointerEvents={visible ? "box-none" : "none"}
    >
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.toastCard, animatedStyle]}>
          <View style={styles.leftContent}>
            <View style={styles.iconBadge}>
              <Text style={styles.iconText}>✓</Text>
            </View>
            <Text style={styles.messageText} numberOfLines={1}>
              {message}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.6}
            onPress={handleUndoPress}
            style={styles.undoTextButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.undoText}>Undo</Text>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toastCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  iconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    color: "#6366F1",
    fontSize: 13,
    fontWeight: "700",
  },
  messageText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  undoTextButton: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  undoText: {
    color: "#6366F1",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
});
