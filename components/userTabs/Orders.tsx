"use client";

import { Text, View } from "react-native";

interface OrdersProps {
  isActive: boolean;
}

export default function Orders({ isActive }: OrdersProps) {
  if (!isActive) return null;

  return (
    <View className="flex-1 mb-6">
      <View className="flex-1 justify-center items-center py-12">
        <Text className="mb-4 text-6xl">📋</Text>
        <Text className="mb-2 text-xl font-semibold text-gray-900">
          No orders yet
        </Text>
        <Text className="text-center text-gray-500">
          Your pet-related orders will appear here
        </Text>
      </View>
    </View>
  );
}
