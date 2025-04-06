import React, { useState , useEffect} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { useUserPrefs } from "../UserPrefsContext"; // adjust path if needed

type Persona = "Motherly" | "Friendly" | "Mentor" | "Coach";
type ValueChoice = string;

interface QuizAnswers {
  persona?: Persona;
  band1?: ValueChoice;
  band2?: ValueChoice;
  band3?: ValueChoice;
  band4?: ValueChoice;
  band5?: ValueChoice;
}

const sentimentBands = [
  {
    key: "band1",
    label: "When you’re very distressed (score 1–2), which matters more?",
  },
  { key: "band2", label: "When you’re quite sad (3–4), which matters more?" },
  { key: "band3", label: "When you’re neutral (5–6), which matters more?" },
  { key: "band4", label: "When you’re happy (7–8), which matters more?" },
  { key: "band5", label: "When you’re elated (9–10), which matters more?" },
];

export default function QuizScreen({
  onComplete,
}: {
  onComplete: (answers: QuizAnswers) => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const { setPrefs } = useUserPrefs();

  useEffect(() => {
    if (step > sentimentBands.length) {
      setPrefs(answers);       // store in context
      console.log("Quiz completed with answers:", answers);
      router.replace("/");     // go to Chat (index)
    }
  }, [step]);

  const personaOptions: Persona[] = ["Motherly", "Friendly", "Mentor", "Coach"];
  const valueOptions = [
    "Caring",
    "Truthfulness",
    "Empathy",
    "Growth",
    "Celebration",
    "Honesty",
  ];

  const handleSelect = (key: keyof QuizAnswers, value: any) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    setStep((s) => s + 1);
  };

  // Render persona selection
  if (step === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Which voice feels most supportive?</Text>
        {personaOptions.map((p) => (
          <TouchableOpacity
            key={p}
            style={styles.button}
            onPress={() => handleSelect("persona", p)}
          >
            <Text style={styles.buttonText}>{p}</Text>
          </TouchableOpacity>
        ))}
      </SafeAreaView>
    );
  }

  // Render sentiment‑band questions
  const bandIndex = step - 1;
  if (bandIndex < sentimentBands.length) {
    const band = sentimentBands[bandIndex];
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>{band.label}</Text>
        {valueOptions.map((v) => (
          <TouchableOpacity
            key={v}
            style={styles.button}
            onPress={() => handleSelect(band.key as any, v)}
          >
            <Text style={styles.buttonText}>{v}</Text>
          </TouchableOpacity>
        ))}
      </SafeAreaView>
    );
  }

  // All done

  // setPrefs(answers);
  // router.replace("/");
  // console.log("Quiz completed with answers:", answers);
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFF1DE",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#1A1A1A",
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    width: "80%",
  },
  buttonText: { color: "#FFF1DE", textAlign: "center", fontSize: 18 },
});
