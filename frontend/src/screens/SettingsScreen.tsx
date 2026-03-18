import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from "react-native";

const PRIVACY_URL =
  "https://rahulprakash.co.in/apps/connect4/privacy.php";

const TERMS_URL =
  "https://rahulprakash.co.in/apps/connect4/terms.php";

export default function SettingsScreen() {
  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Unable to open this link.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>

        <TouchableOpacity
          style={styles.option}
          onPress={() => openLink(PRIVACY_URL)}
        >
          <Text style={styles.optionText}>Privacy Policy  ›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => openLink(TERMS_URL)}
        >
          <Text style={styles.optionText}>Terms of Service  ›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 30,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#555",
  },
  option: {
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  optionText: {
    fontSize: 16,
  },
});