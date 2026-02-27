import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../src/context/UserContext';

export default function TutorialScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(0);

  const slides = [
    {
      title: "Welcome to Connect 4 AI",
      description:
        "Challenge an intelligent AI in this classic strategy game.",
    },
    {
      title: "How to Win",
      description:
        "Drop your discs and connect 4 in a row — horizontally, vertically, or diagonally.",
    },
    {
      title: "Choose Difficulty",
      description:
        "Select Easy, Medium, or Hard depending on how much challenge you want.",
    },
    {
      title: "You're Ready!",
      description:
        "Let’s start playing and test your strategy skills!",
    },
  ];

  const goToNextScreen = async () => {
    await AsyncStorage.setItem('hasSeenTutorial', 'true');

    if (user) {
      router.replace('/menu');   // Already logged in
    } else {
      router.replace('/');       // Go to login
    }
  };

  const nextSlide = () => {
    if (step === slides.length - 1) {
      goToNextScreen();
    } else {
      setStep(step + 1);
    }
  };

  const skipTutorial = async () => {
    await goToNextScreen();
  };

  return (
    <View style={styles.container}>
      <View style={styles.slide}>
        <Text style={styles.title}>{slides[step].title}</Text>
        <Text style={styles.description}>
          {slides[step].description}
        </Text>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity onPress={skipTutorial}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={nextSlide}>
          <Text style={styles.buttonText}>
            {step === slides.length - 1 ? "Play Now" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'space-between',
    padding: 30,
  },
  slide: {
    marginTop: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#94a3b8',
    lineHeight: 24,
  },
  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skip: {
    color: '#94a3b8',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});