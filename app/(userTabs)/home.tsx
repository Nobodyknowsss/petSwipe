import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function Home() {
  const router = useRouter();
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-3xl font-bold text-black">home</Text>
      <Pressable className="mt-4" onPress={() => router.push("/(auth)/login")}>
        <Text className="p-4 text-lg text-white bg-green-500 rounded-[32px] border">
          Login
        </Text>
      </Pressable>
    </View>
  );
}
