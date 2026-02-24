# Ghostwriter - Implementation Guide

This guide provides step-by-step instructions for implementing the Ghostwriter UI based on the design system and wireframes.

## Quick Reference

- **Design System**: See `DESIGN_SYSTEM.md`
- **Wireframes & Flows**: See `WIREFRAMES_AND_FLOWS.md`
- **Mockups**: See `mockups/` folder (5 visual mockups)

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Create Color Constants

Create `frontend/src/constants/colors.ts`:

```typescript
export const COLORS = {
  // Primary
  primary: '#007AFF',
  primaryLight: '#4DA3FF',
  primaryDark: '#0051D5',
  
  // Neutral
  white: '#FFFFFF',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  border: '#E5E7EB',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  // Tones
  friendly: '#FF9500',
  professional: '#0084FF',
  assertive: '#FF3B30',
  apologetic: '#AF52DE',
  casual: '#34C759',
  
  // Semantic
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
};

export const TONE_COLORS = {
  friendly: COLORS.friendly,
  professional: COLORS.professional,
  assertive: COLORS.assertive,
  apologetic: COLORS.apologetic,
  casual: COLORS.casual,
};
```

### 3. Create Typography Constants

Create `frontend/src/constants/typography.ts`:

```typescript
export const TYPOGRAPHY = {
  // Font families
  primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: '"SF Mono", Monaco, "Cascadia Code", monospace',
  
  // Sizes
  display: { size: 32, weight: 700, lineHeight: 40 },
  heading1: { size: 24, weight: 700, lineHeight: 32 },
  heading2: { size: 20, weight: 600, lineHeight: 28 },
  bodyLarge: { size: 16, weight: 400, lineHeight: 24 },
  body: { size: 14, weight: 400, lineHeight: 20 },
  label: { size: 12, weight: 500, lineHeight: 16 },
  caption: { size: 11, weight: 400, lineHeight: 16 },
};
```

### 4. Create Spacing Constants

Create `frontend/src/constants/spacing.ts`:

```typescript
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};

export const PADDING = {
  screen: SPACING.lg,      // 16px
  card: SPACING.lg,        // 16px
  button: { v: 12, h: 16 }, // 12px vertical, 16px horizontal
  input: SPACING.md,       // 12px
};
```

---

## Screen Implementation

### Screen 1: Login Screen

**File**: `frontend/src/screens/LoginScreen.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setUser, setError } from '../store/slices/authSlice';
import apiService from '../services/api';
import storageService from '../services/storage';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email || !password) {
      dispatch(setError('Please fill in all fields'));
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.login(email, password);
      const { token, uid } = response.data;

      await storageService.saveAuthToken(token);
      await storageService.saveUserInfo(uid, email);

      dispatch(setUser({ user: { uid, email }, token }));
      navigation.replace('Home');
    } catch (error: any) {
      dispatch(setError(error.response?.data?.error?.message || 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>👻</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Ghostwriter</Text>

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
        placeholderTextColor={COLORS.textTertiary}
        keyboardType="email-address"
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
        placeholderTextColor={COLORS.textTertiary}
      />

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      {/* Register Link */}
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>
          Don't have an account? <Text style={styles.linkBold}>Register</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    justifyContent: 'center',
    minHeight: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  logo: {
    fontSize: 64,
  },
  title: {
    fontSize: TYPOGRAPHY.display.size,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING['2xl'],
    color: COLORS.textPrimary,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    fontSize: TYPOGRAPHY.body.size,
    color: COLORS.textPrimary,
  },
  button: {
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.bodyLarge.size,
    fontWeight: '700',
  },
  link: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.body.size,
  },
  linkBold: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
```

### Screen 2: Home Screen

**File**: `frontend/src/screens/HomeScreen.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import apiService from '../services/api';
import { setRecentMessages } from '../store/slices/messageSlice';
import { COLORS, TYPOGRAPHY, SPACING, TONE_COLORS } from '../constants';
import { TONES, TONE_DESCRIPTIONS } from '../types/index';

export default function HomeScreen({ navigation }: any) {
  const [message, setMessage] = useState('');
  const [selectedTone, setSelectedTone] = useState<string>('friendly');
  const [loading, setLoading] = useState(false);
  const { recentMessages } = useSelector((state: any) => state.messages);
  const dispatch = useDispatch();

  const handleGenerateReply = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.generateReply(
        message,
        selectedTone,
        recentMessages
      );

      // Update recent messages
      dispatch(setRecentMessages([...recentMessages, message].slice(-10)));

      navigation.navigate('Result', {
        suggestions: response.data.suggestions,
        originalMessage: message,
        tone: selectedTone,
      });
    } catch (error: any) {
      alert('Error: ' + error.response?.data?.error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👻 Ghostwriter</Text>
      </View>

      {/* Main Heading */}
      <Text style={styles.heading}>What do you need to reply to?</Text>

      {/* Message Input */}
      <TextInput
        style={styles.messageInput}
        placeholder="Paste the message here..."
        multiline
        numberOfLines={4}
        value={message}
        onChangeText={setMessage}
        editable={!loading}
        placeholderTextColor={COLORS.textTertiary}
        textAlignVertical="top"
      />

      {/* Tone Selection */}
      <Text style={styles.subheading}>Choose a tone:</Text>
      <View style={styles.toneGrid}>
        {TONES.map((tone) => (
          <TouchableOpacity
            key={tone}
            style={[
              styles.toneButton,
              selectedTone === tone && styles.toneButtonActive,
              { backgroundColor: TONE_COLORS[tone as keyof typeof TONE_COLORS] },
            ]}
            onPress={() => setSelectedTone(tone)}
            disabled={loading}
          >
            <Text style={styles.toneButtonText}>
              {tone.charAt(0).toUpperCase() + tone.slice(1)}
            </Text>
            <Text style={styles.toneDescription}>
              {TONE_DESCRIPTIONS[tone as any]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Generate Button */}
      <TouchableOpacity
        style={[styles.generateButton, loading && styles.buttonDisabled]}
        onPress={handleGenerateReply}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.generateButtonText}>Generate Suggestions</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.heading1.size,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  heading: {
    fontSize: TYPOGRAPHY.heading1.size,
    fontWeight: '700',
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  messageInput: {
    marginHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.body.size,
    color: COLORS.textPrimary,
    minHeight: 100,
    marginBottom: SPACING.xl,
  },
  subheading: {
    fontSize: TYPOGRAPHY.heading2.size,
    fontWeight: '600',
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  toneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  toneButton: {
    flex: 1,
    minWidth: '45%',
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toneButtonActive: {
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  toneButtonText: {
    fontSize: TYPOGRAPHY.label.size,
    fontWeight: '600',
    color: COLORS.white,
  },
  toneDescription: {
    fontSize: TYPOGRAPHY.caption.size,
    color: COLORS.white,
    marginTop: SPACING.xs,
    opacity: 0.9,
  },
  generateButton: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.bodyLarge.size,
    fontWeight: '700',
  },
});
```

### Screen 3: Result Screen

**File**: `frontend/src/screens/ResultScreen.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Clipboard,
} from 'react-native';
import { useDispatch } from 'react-redux';
import apiService from '../services/api';
import { addMessage } from '../store/slices/messageSlice';
import { COLORS, TYPOGRAPHY, SPACING, TONE_COLORS } from '../constants';

export default function ResultScreen({ route, navigation }: any) {
  const { suggestions, originalMessage, tone } = route.params;
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const dispatch = useDispatch();

  const handleCopy = (text: string, index: number) => {
    Clipboard.setString(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleSave = async (suggestion: string) => {
    try {
      await apiService.saveMessage(
        originalMessage,
        tone,
        suggestions,
        suggestion
      );

      dispatch(
        addMessage({
          id: Date.now().toString(),
          originalMessage,
          tone,
          suggestions,
          selectedSuggestion: suggestion,
          createdAt: new Date().toISOString(),
          tokensUsed: 300,
        })
      );

      alert('Suggestion saved!');
    } catch (error) {
      alert('Failed to save suggestion');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ghostwriter</Text>
      </View>

      {/* Original Message */}
      <View style={styles.section}>
        <Text style={styles.label}>Original Message</Text>
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{originalMessage}</Text>
        </View>
      </View>

      {/* Tone Badge */}
      <View style={styles.toneBadgeContainer}>
        <View
          style={[
            styles.toneBadge,
            {
              backgroundColor:
                TONE_COLORS[tone as keyof typeof TONE_COLORS],
            },
          ]}
        >
          <Text style={styles.toneBadgeText}>
            {tone.charAt(0).toUpperCase() + tone.slice(1)} Tone
          </Text>
        </View>
      </View>

      {/* Suggestions */}
      <Text style={styles.heading}>Suggestions</Text>
      {suggestions.map((suggestion: string, index: number) => (
        <View key={index} style={styles.suggestionCard}>
          <Text style={styles.suggestionText}>{suggestion}</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => handleCopy(suggestion, index)}
            >
              <Text
                style={[
                  styles.copyButtonText,
                  copiedIndex === index && styles.copiedText,
                ]}
              >
                {copiedIndex === index ? '✓ Copied' : 'Copy'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleSave(suggestion)}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Generate Another Button */}
      <TouchableOpacity
        style={styles.generateAnotherButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.generateAnotherButtonText}>Generate Another</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    fontSize: TYPOGRAPHY.body.size,
    color: COLORS.primary,
    marginRight: SPACING.lg,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.heading1.size,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.caption.size,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  messageBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    minHeight: 60,
  },
  messageText: {
    fontSize: TYPOGRAPHY.body.size,
    color: COLORS.textPrimary,
    lineHeight: TYPOGRAPHY.body.lineHeight,
  },
  toneBadgeContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  toneBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  toneBadgeText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.label.size,
    fontWeight: '600',
  },
  heading: {
    fontSize: TYPOGRAPHY.heading2.size,
    fontWeight: '600',
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  suggestionCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionText: {
    fontSize: TYPOGRAPHY.body.size,
    color: COLORS.textPrimary,
    lineHeight: TYPOGRAPHY.body.lineHeight,
    marginBottom: SPACING.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  copyButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  copyButtonText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.label.size,
    fontWeight: '600',
  },
  copiedText: {
    color: COLORS.success,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.label.size,
    fontWeight: '600',
  },
  generateAnotherButton: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateAnotherButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.bodyLarge.size,
    fontWeight: '700',
  },
});
```

---

## Component Library

### Button Component

**File**: `frontend/src/components/Button.tsx`

```typescript
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
}

export default function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      opacity: disabled ? 0.6 : 1,
    };

    const sizeStyles = {
      small: { height: 36, paddingHorizontal: SPACING.md },
      medium: { height: 44, paddingHorizontal: SPACING.lg },
      large: { height: 52, paddingHorizontal: SPACING.xl },
    };

    const variantStyles = {
      primary: { backgroundColor: COLORS.primary },
      secondary: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
      },
      tertiary: { backgroundColor: 'transparent' },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const variantTextStyles = {
      primary: { color: COLORS.white },
      secondary: { color: COLORS.primary },
      tertiary: { color: COLORS.primary },
    };

    return {
      fontSize: TYPOGRAPHY.bodyLarge.size,
      fontWeight: '700',
      ...variantTextStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
}
```

---

## Testing Checklist

### Layout Testing
- [ ] All screens render without errors
- [ ] All text is visible and readable
- [ ] All buttons are tappable (44x44px minimum)
- [ ] Proper spacing between elements
- [ ] Proper padding on all screens

### Interaction Testing
- [ ] Login/Register navigation works
- [ ] Home screen generates suggestions
- [ ] Result screen displays suggestions correctly
- [ ] Copy button copies to clipboard
- [ ] Save button saves to history
- [ ] Bottom navigation switches screens
- [ ] Back button works

### Styling Testing
- [ ] Colors match design system
- [ ] Typography matches design system
- [ ] Focus states visible
- [ ] Disabled states visible
- [ ] Loading states work

### Accessibility Testing
- [ ] All interactive elements have focus indicators
- [ ] Text contrast meets WCAG AA standards
- [ ] All buttons are 44x44px minimum
- [ ] Keyboard navigation works
- [ ] Screen readers can read all content

---

## Performance Optimization

### Image Optimization
- Use appropriate image sizes
- Compress images before deployment
- Use lazy loading for images

### Code Splitting
- Split screens into separate files
- Use dynamic imports for heavy components
- Lazy load analytics screen

### State Management
- Use Redux selectors to prevent unnecessary renders
- Memoize expensive computations
- Clean up listeners on unmount

### Network Optimization
- Cache API responses
- Implement request debouncing
- Show loading states during requests

---

## Deployment Checklist

Before submitting to app stores:

- [ ] All screens implemented
- [ ] All API endpoints working
- [ ] All animations smooth
- [ ] All error messages user-friendly
- [ ] All loading states visible
- [ ] All text properly localized
- [ ] All images optimized
- [ ] All permissions requested
- [ ] Privacy policy included
- [ ] Terms of service included
- [ ] App tested on multiple devices
- [ ] App tested on multiple OS versions
- [ ] Performance optimized
- [ ] Security reviewed
- [ ] Analytics integrated

---

## Next Steps

1. **Implement remaining screens** (History, Analytics)
2. **Add animations** (transitions, loading states)
3. **Implement error handling** (network errors, validation)
4. **Add offline support** (cache messages locally)
5. **Implement push notifications** (new features, updates)
6. **Add analytics** (track user behavior)
7. **Optimize performance** (reduce bundle size, improve load times)
8. **Test thoroughly** (manual testing, automated testing)
9. **Submit to app stores** (Google Play, TestFlight)
10. **Monitor and iterate** (fix bugs, add features based on feedback)

