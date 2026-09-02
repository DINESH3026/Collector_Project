import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AuthInputProps extends TextInputProps {
  label: string;
  labelRightText?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  error?: string;
  isPassword?: boolean;
  isSelectable?: boolean;
  onPressSelect?: () => void;
  displayValue?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  labelRightText,
  iconName,
  error,
  isPassword = false,
  isSelectable = false,
  onPressSelect,
  displayValue,
  placeholder,
  value,
  onChangeText,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const renderContent = () => (
    <View
      style={[
        styles.inputContainer,
        isFocused && styles.inputFocused,
        error ? styles.inputError : null,
      ]}
    >
      <Ionicons
        name={iconName}
        size={20}
        color={isFocused ? '#2563EB' : '#9CA3AF'}
        style={styles.leftIcon}
      />

      {isSelectable ? (
        <Text
          style={[
            styles.inputText,
            !displayValue && styles.placeholderText,
          ]}
        >
          {displayValue || placeholder}
        </Text>
      ) : (
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      )}

      {isPassword && (
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.rightIconContainer}
        >
          <Ionicons
            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#9CA3AF"
          />
        </TouchableOpacity>
      )}

      {isSelectable && (
        <View style={styles.rightIconContainer}>
          <Ionicons name="chevron-down-outline" size={18} color="#6B7280" />
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {labelRightText ? <Text style={styles.labelRight}>{labelRightText}</Text> : null}
      </View>

      {isSelectable ? (
        <TouchableOpacity activeOpacity={0.7} onPress={onPressSelect}>
          {renderContent()}
        </TouchableOpacity>
      ) : (
        renderContent()
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.2,
  },
  labelRight: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 14,
  },
  inputFocused: {
    borderColor: '#2563EB',
    backgroundColor: '#FAFAFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '400',
    height: '100%',
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '400',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  rightIconContainer: {
    padding: 4,
    marginLeft: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
});
