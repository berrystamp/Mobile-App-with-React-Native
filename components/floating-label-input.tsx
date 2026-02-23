import React, { useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface FloatingLabelInputProps extends TextInputProps {
  label: string;
  rightIcon?: React.ReactNode;
}

export function FloatingLabelInput({
  label,
  value,
  rightIcon,
  onFocus,
  onBlur,
  ...props
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef<TextInput>(null);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
    onBlur?.(e);
  };

  const labelTop = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [17, -9],
  });

  const labelFontSize = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 12],
  });

  const labelColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#aaaaaa', '#6B6BD6'],
  });

  return (
    <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
      <View
        style={[
          styles.container,
          { borderColor: isFocused ? '#6B6BD6' : '#DEDEDE' },
        ]}
      >
        <Animated.Text
          style={[
            styles.label,
            {
              top: labelTop,
              fontSize: labelFontSize,
              color: labelColor,
              backgroundColor: '#fff',
              paddingHorizontal: 4,
            },
          ]}
        >
          {label}
        </Animated.Text>
        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor="#aaa"
            {...props}
          />
          {rightIcon && <View style={styles.iconWrapper}>{rightIcon}</View>}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.2,
    borderRadius: 8,
    paddingHorizontal: 14,
    marginBottom: 18,
    position: 'relative',
    backgroundColor: '#fff',
  },
  label: {
    position: 'absolute',
    left: 10,
    zIndex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a2e',
    paddingVertical: 0,
    paddingTop: 20,
    paddingBottom: 10,
  },
  iconWrapper: {
    paddingLeft: 8,
  },
});
