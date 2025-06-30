import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
export default function Login() {
  const router = useRouter();
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-3xl font-bold text-black">login</Text>
      <Pressable
        className="mt-4"
        onPress={() => router.push("/(userTabs)/home")}
      >
        <Text className="p-4 text-lg text-white bg-green-500 rounded-[32px] border">
          Home
        </Text>
      </Pressable>
    </View>
  );
}
