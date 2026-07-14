import React, { useEffect } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

interface ArchivedToastProps {
  visible: boolean;
  sender: string;
  onUndo: () => void;
}

export default function ArchivedToast({ visible, sender, onUndo }: ArchivedToastProps) {
  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);
  const progressWidth = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 240, mass: 0.7 });
      opacity.value = withTiming(1, { duration: 180 });
      progressWidth.value = 1;
      progressWidth.value = withTiming(0, {
        duration: 2500,
        easing: Easing.linear,
      });
    } else {
      translateY.value = withTiming(80, { duration: 200 });
      opacity.value = withTiming(0, { duration: 160 });
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progressWidth.value, [0, 1], [0, 100], Extrapolation.CLAMP)}%`,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]} pointerEvents="box-none">
      <View style={styles.toast}>
        {/* Draining timer bar at bottom */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>

        {/* Check circle */}
        <View style={styles.checkCircle}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        {/* Text */}
        <View style={styles.textBlock}>
          <Text style={styles.title}>Archived</Text>
          <Text style={styles.sub} numberOfLines={1}>{sender}</Text>
        </View>

        {/* Undo */}
        <Pressable
          onPress={onUndo}
          style={({ pressed }) => [styles.undoBtn, pressed && styles.undoBtnPressed]}
          hitSlop={12}
        >
          <Text style={styles.undoText}>Undo</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 28,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  progressTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#F3F4F6",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366F1",
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkmark: {
    color: "#6366F1",
    fontSize: 13,
    fontWeight: "700",
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  sub: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 1,
  },
  undoBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
  },
  undoBtnPressed: {
    backgroundColor: "#E0E7FF",
  },
  undoText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6366F1",
  },
});
