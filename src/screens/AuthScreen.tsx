import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/useAuthStore';
import { trackEventFireAndForget } from '../services/analytics';

type AuthMode = 'signIn' | 'signUp' | 'forgotPassword' | 'checkEmail';

interface AuthScreenProps {
  onClose?: () => void;
  onSuccess?: () => void;
  initialMode?: 'signIn' | 'signUp';
}

export function AuthScreen({ onClose, onSuccess, initialMode = 'signIn' }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { signIn, signUp, resetPassword, resendVerification, isLoading, error, clearError } = useAuthStore();

  const handleSignIn = async () => {
    setLocalError(null);
    clearError();

    if (!email.trim()) {
      setLocalError('Please enter your email');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password');
      return;
    }

    const success = await signIn(email.trim(), password);
    if (success) {
      trackEventFireAndForget('account_signed_in');
      onSuccess?.();
    }
  };

  const handleSignUp = async () => {
    setLocalError(null);
    clearError();

    if (!email.trim()) {
      setLocalError('Please enter your email');
      return;
    }
    if (!password) {
      setLocalError('Please enter a password');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    const success = await signUp(email.trim(), password);
    if (success) {
      trackEventFireAndForget('account_created');
      setMode('checkEmail');
    }
  };

  const handleForgotPassword = async () => {
    setLocalError(null);
    clearError();

    if (!email.trim()) {
      setLocalError('Please enter your email');
      return;
    }

    const success = await resetPassword(email.trim());
    if (success) {
      trackEventFireAndForget('password_reset_requested');
      setMode('checkEmail');
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) return;
    await resendVerification(email.trim());
  };

  const displayError = localError || error;

  const renderSignIn = () => (
    <>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to sync your training data</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color={Colors.gray400} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.gray400}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color={Colors.gray400} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.gray400}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.gray400} />
        </TouchableOpacity>
      </View>

      {displayError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={Colors.error} />
          <Text style={styles.errorText}>{displayError}</Text>
        </View>
      )}

      <Button
        title="Sign In"
        onPress={handleSignIn}
        loading={isLoading}
        fullWidth
        style={styles.button}
      />

      <TouchableOpacity onPress={() => { setMode('forgotPassword'); clearError(); setLocalError(null); }}>
        <Text style={styles.linkText}>Forgot password?</Text>
      </TouchableOpacity>

      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => { setMode('signUp'); clearError(); setLocalError(null); }}>
          <Text style={styles.switchLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderSignUp = () => (
    <>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Sign up to save your progress across devices</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color={Colors.gray400} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.gray400}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color={Colors.gray400} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.gray400}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.gray400} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color={Colors.gray400} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor={Colors.gray400}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
      </View>

      {displayError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={Colors.error} />
          <Text style={styles.errorText}>{displayError}</Text>
        </View>
      )}

      <Button
        title="Create Account"
        onPress={handleSignUp}
        loading={isLoading}
        fullWidth
        style={styles.button}
      />

      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => { setMode('signIn'); clearError(); setLocalError(null); }}>
          <Text style={styles.switchLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderForgotPassword = () => (
    <>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your email and we'll send you a reset link</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color={Colors.gray400} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.gray400}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {displayError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color={Colors.error} />
          <Text style={styles.errorText}>{displayError}</Text>
        </View>
      )}

      <Button
        title="Send Reset Link"
        onPress={handleForgotPassword}
        loading={isLoading}
        fullWidth
        style={styles.button}
      />

      <TouchableOpacity onPress={() => { setMode('signIn'); clearError(); setLocalError(null); }}>
        <Text style={styles.linkText}>Back to Sign In</Text>
      </TouchableOpacity>
    </>
  );

  const renderCheckEmail = () => (
    <View style={styles.checkEmailContainer}>
      <View style={styles.iconCircle}>
        <Ionicons name="mail" size={48} color={Colors.primary} />
      </View>

      <Text style={styles.title}>Check Your Email</Text>
      <Text style={styles.subtitle}>
        We've sent a verification link to{'\n'}
        <Text style={styles.emailHighlight}>{email}</Text>
      </Text>

      <Text style={styles.instructionText}>
        Click the link in the email to verify your account, then come back here to sign in.
      </Text>

      <Button
        title="Back to Sign In"
        onPress={() => { setMode('signIn'); clearError(); setLocalError(null); }}
        fullWidth
        style={styles.button}
      />

      <TouchableOpacity onPress={handleResendVerification} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} />
        ) : (
          <Text style={styles.linkText}>Resend verification email</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={28} color={Colors.gray600} />
            </TouchableOpacity>
          )}

          <View style={styles.content}>
            {mode === 'signIn' && renderSignIn()}
            {mode === 'signUp' && renderSignUp()}
            {mode === 'forgotPassword' && renderForgotPassword()}
            {mode === 'checkEmail' && renderCheckEmail()}
          </View>

          {onClose && mode !== 'checkEmail' && (
            <TouchableOpacity style={styles.skipContainer} onPress={onClose}>
              <Text style={styles.skipText}>Continue without account</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.gray900,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray500,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.gray900,
  },
  eyeIcon: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.errorDark,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  button: {
    marginTop: 8,
    marginBottom: 24,
  },
  linkText: {
    color: Colors.primary,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  switchText: {
    color: Colors.gray500,
    fontSize: 14,
  },
  switchLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  skipContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipText: {
    color: Colors.gray400,
    fontSize: 14,
  },
  checkEmailContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emailHighlight: {
    color: Colors.gray900,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 14,
    color: Colors.gray500,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
});
