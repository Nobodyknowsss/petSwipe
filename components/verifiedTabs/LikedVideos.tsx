"use client";

import { Text, View } from "react-native";

interface LikedVideosProps {
  isActive: boolean;
}

export default function LikedVideos({ isActive }: LikedVideosProps) {
  if (!isActive) return null;

  return (
    <View className="flex-1 mb-6">
      <View className="flex-row flex-wrap">
        {/* Placeholder for liked videos grid */}
        <View className="p-1 w-1/3">
          <View className="justify-center items-center bg-gray-200 rounded-lg aspect-square">
            <Text className="text-4xl">🐕</Text>
          </View>
        </View>
        <View className="p-1 w-1/3">
          <View className="justify-center items-center bg-gray-200 rounded-lg aspect-square">
            <Text className="text-4xl">🐱</Text>
          </View>
        </View>
        <View className="p-1 w-1/3">
          <View className="justify-center items-center bg-gray-200 rounded-lg aspect-square">
            <Text className="text-4xl">🐰</Text>
          </View>
        </View>
        <View className="p-1 w-1/3">
          <View className="justify-center items-center bg-gray-200 rounded-lg aspect-square">
            <Text className="text-4xl">🐦</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
