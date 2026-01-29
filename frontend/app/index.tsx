import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../src/context/UserContext';
import { useTheme } from '../src/context/ThemeContext';
import { isFirebaseConfigured } from '../src/firebase/config';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, isLoading, login } = useUser();
  const { colors } = useTheme();
  const router = useRouter();

  // If user is already logged in, redirect to menu
  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/menu');
    }
  }, [user, isLoading]);

  const handleLogin = async () => {
    const trimmedUsername = username.trim();
    
    if (trimmedUsername.length < 3) {
      Alert.alert('Invalid Username', 'Username must be at least 3 characters long.');
      return;
    }
    
    if (trimmedUsername.length > 20) {
      Alert.alert('Invalid Username', 'Username must be less than 20 characters.');
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      Alert.alert('Invalid Username', 'Username can only contain letters, numbers, and underscores.');
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await login(trimmedUsername.toLowerCase());
      
      if (success) {
        router.replace('/menu');
      } else {
        Alert.alert('Error', 'Failed to login. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={[styles.logoContainer, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
              <Ionicons name="grid" size={60} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Connect 4</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Challenge the AI</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formSection}>
            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="person" size={24} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your username"
                placeholderTextColor={colors.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.primary }, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Start Playing</Text>
                  <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Enter a username to save your progress.
              No password required!
            </Text>
          </View>

          {/* Firebase Status */}
          {!isFirebaseConfigured() && (
            <View style={[styles.warningContainer, { backgroundColor: '#422006' }]}>
              <Ionicons name="warning" size={20} color="#F59E0B" />
              <Text style={styles.warningText}>
                Firebase not configured. Stats will not be saved.
              </Text>
            </View>
          )}
          
          {isFirebaseConfigured() && (
            <View style={[styles.successContainer, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.successText, { color: colors.success }]}>
                Cloud save enabled
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
  },
  formSection: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
  },
  loginButton: {
    flexDirection: 'row',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 16,
    lineHeight: 20,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  warningText: {
    color: '#FCD34D',
    fontSize: 13,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  successText: {
    fontSize: 13,
  },
});
