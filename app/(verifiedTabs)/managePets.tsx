"use client";

import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

// Dashboard Card Component
const DashboardCard = ({
  title,
  description,
  icon,
  onPress,
  color = "#FF7200FF",
  enabled = true,
}: {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
  color?: string;
  enabled?: boolean;
}) => (
  <TouchableOpacity
    onPress={enabled ? onPress : undefined}
    className={`p-6 mb-4 bg-white rounded-3xl ${enabled ? "" : "opacity-50"}`}
    style={{
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
    }}
    disabled={!enabled}
  >
    <View className="items-center">
      {/* Icon */}
      <View
        className="items-center justify-center w-20 h-20 mb-4 rounded-full"
        style={{ backgroundColor: `${color}15` }}
      >
        <Text className="text-4xl">{icon}</Text>
      </View>

      {/* Title */}
      <Text
        className="mb-2 text-xl font-bold text-center"
        style={{ color: enabled ? "#1F2937" : "#9CA3AF" }}
      >
        {title}
      </Text>

      {/* Description */}
      <Text
        className="text-center text-sm leading-5"
        style={{ color: enabled ? "#6B7280" : "#9CA3AF" }}
      >
        {description}
      </Text>

      {/* Enabled/Disabled indicator */}
      {!enabled && (
        <View className="mt-3 px-3 py-1 bg-gray-200 rounded-full">
          <Text className="text-xs text-gray-500 font-medium">Coming Soon</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

export default function ManagePets() {
  const handleNavigateToPets = () => {
    router.push("./petsList");
  };

  const handleNavigateToAddPet = () => {
    router.push("./addPet");
  };

  const handleNavigateToPost = () => {
    // TODO: Navigate to post screen when implemented
    console.log("Post feature coming soon!");
  };

  return (
    <View className="flex-1 bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <View className="px-6 pt-12 pb-6">
        <Text className="text-3xl font-bold text-center text-gray-800">
          Pet Management
        </Text>
        <Text className="mt-2 text-center text-gray-600">
          Manage your pets and create posts
        </Text>
      </View>

      {/* Dashboard Cards */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="pb-8">
          {/* Pets Card */}
          <DashboardCard
            title="My Pets"
            description="View, edit, and manage all your registered pets"
            icon="🐾"
            onPress={handleNavigateToPets}
            color="#FF7200FF"
          />

          {/* Add Pet Card */}
          <DashboardCard
            title="Add New Pet"
            description="Register a new pet with photos and videos"
            icon="➕"
            onPress={handleNavigateToAddPet}
            color="#10B981"
          />

          {/* Post Card */}
          <DashboardCard
            title="Create Post"
            description="Share stories and updates about your pets"
            icon="📝"
            onPress={handleNavigateToPost}
            color="#8B5CF6"
            enabled={false} // Disabled until implemented
          />
        </View>

        {/* Quick Stats */}
        <View className="mb-8">
          <Text className="mb-4 text-lg font-semibold text-gray-800">
            Quick Stats
          </Text>
          <View className="flex-row justify-between">
            <View className="flex-1 p-4 mr-2 bg-white rounded-2xl">
              <Text className="text-2xl font-bold text-orange-500">7</Text>
              <Text className="text-sm text-gray-600">Total Pets</Text>
            </View>
            <View className="flex-1 p-4 ml-2 bg-white rounded-2xl">
              <Text className="text-2xl font-bold text-green-500">0</Text>
              <Text className="text-sm text-gray-600">Posts Created</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="mb-8">
          <Text className="mb-4 text-lg font-semibold text-gray-800">
            Recent Activity
          </Text>
          <View className="p-4 bg-white rounded-2xl">
            <Text className="text-gray-600">
              No recent activity. Start by adding a new pet!
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
