// CustomToggleSwitch.js

import React, { useState } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../Common/Constants';

const CustomToggleSwitch = ({ onToggle, initialEnabled = false }) => {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const translateX = useState(new Animated.Value(initialEnabled ? 1 : 0))[0];

  const toggleSwitch = () => {
    Animated.timing(translateX, {
      toValue: isEnabled ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();

    setIsEnabled((previousState) => !previousState);

    if (onToggle) {
      onToggle(!isEnabled);
    }
  };

  const interpolateTranslateX = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 17],
  });

  return (
    <TouchableOpacity
      style={styles.switchContainer}
      activeOpacity={0.8}
      onPress={toggleSwitch}
    >
      <LinearGradient
        colors={isEnabled ? [COLORS.primaryAccent, COLORS.primary] : [COLORS.lightGrey, COLORS.lightGrey]}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.switchThumb,
            {
              transform: [{ translateX: interpolateTranslateX }],
            },
          ]}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    width: 50,
    height: 30,
    justifyContent: 'center',
    borderRadius: 15,
    padding: 2,
    backgroundColor: '#ddd',
  },
  gradient: {
    flex: 1,
    borderRadius: 15,
    padding: 2,
  },
  switchThumb: {
    width: '55%',
    height: '100%',
    borderRadius: 13,
    backgroundColor: '#fff',
    elevation: 2,
  },
});

export default CustomToggleSwitch;
