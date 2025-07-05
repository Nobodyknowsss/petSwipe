import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

interface TypingIndicatorProps {
  username: string;
  isVisible: boolean;
}

export default function TypingIndicator({
  username,
  isVisible,
}: TypingIndicatorProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Fade in the typing indicator
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Animate dots
      const animateDots = () => {
        const createDotAnimation = (dot: Animated.Value, delay: number) => {
          return Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]);
        };

        Animated.loop(
          Animated.parallel([
            createDotAnimation(dot1, 0),
            createDotAnimation(dot2, 200),
            createDotAnimation(dot3, 400),
          ])
        ).start();
      };

      animateDots();
    } else {
      // Fade out the typing indicator
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Animated.View style={{ opacity }} className="px-4 mb-3 items-start">
      <View className="flex-row items-center bg-gray-700 rounded-2xl rounded-bl-md px-4 py-2">
        <Text className="text-gray-300 text-sm mr-2">{username} is typing</Text>
        <View className="flex-row items-center space-x-1">
          <Animated.View
            style={{
              opacity: dot1,
              transform: [
                {
                  scale: dot1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            }}
            className="w-1.5 h-1.5 rounded-full bg-gray-400"
          />
          <Animated.View
            style={{
              opacity: dot2,
              transform: [
                {
                  scale: dot2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            }}
            className="w-1.5 h-1.5 rounded-full bg-gray-400"
          />
          <Animated.View
            style={{
              opacity: dot3,
              transform: [
                {
                  scale: dot3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            }}
            className="w-1.5 h-1.5 rounded-full bg-gray-400"
          />
        </View>
      </View>
    </Animated.View>
  );
}
