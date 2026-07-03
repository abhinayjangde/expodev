import { useState } from "react";
import { Modal, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const [count, setCount] = useState(0);
  const [warningVisible, setWarningVisible] = useState(false);

  const handleDecrement = () => {
    if (count === 0) {
      setWarningVisible(true);
      return;
    }

    setCount((value) => value - 1);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <View style={styles.backgroundGlow} />
      <View style={styles.container}>
        <Text style={styles.kicker}>Simple counter</Text>
        <Text style={styles.title}>Tap to change the value</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Current count</Text>
          <Text style={styles.count}>{count}</Text>
          <View style={styles.buttonRow}>
            <CounterButton label="-1" onPress={handleDecrement} />
            <CounterButton label="Reset" onPress={() => setCount(0)} variant="secondary" />
            <CounterButton label="+1" onPress={() => setCount((value) => value + 1)} />
          </View>
        </View>
      </View>

      <Modal transparent animationType="fade" visible={warningVisible} onRequestClose={() => setWarningVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cannot go below zero</Text>
            <Text style={styles.modalMessage}>The counter cannot be negative.</Text>
            <Pressable onPress={() => setWarningVisible(false)} style={({ pressed }) => [styles.modalButton, pressed && styles.buttonPressed]}>
              <Text style={styles.modalButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

type CounterButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
};

function CounterButton({ label, onPress, variant = "primary" }: CounterButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, variant === "secondary" && styles.secondaryButton, pressed && styles.buttonPressed]}
    >
      <Text style={[styles.buttonText, variant === "secondary" && styles.secondaryButtonText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0b1020",
  },
  backgroundGlow: {
    position: "absolute",
    top: -120,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 999,
    backgroundColor: "rgba(161, 167, 247, 0.22)",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  kicker: {
    color: "#7dd3fc",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  title: {
    color: "#f8fafc",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800",
    marginBottom: 20,
    maxWidth: 280,
  },
  card: {
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderColor: "rgba(148, 163, 184, 0.22)",
    borderWidth: 1,
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  label: {
    color: "#cbd5e1",
    fontSize: 16,
    marginBottom: 8,
  },
  count: {
    color: "#ffffff",
    fontSize: 72,
    lineHeight: 80,
    fontWeight: "900",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#38bdf8",
  },
  secondaryButton: {
    backgroundColor: "rgba(148, 163, 184, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.28)",
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  buttonText: {
    color: "#082f49",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButtonText: {
    color: "#e2e8f0",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    padding: 24,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  modalTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
  },
  modalMessage: {
    color: "#cbd5e1",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
  },
  modalButton: {
    alignSelf: "flex-end",
    minWidth: 92,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "#38bdf8",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#082f49",
    fontSize: 16,
    fontWeight: "800",
  },
});
