"use client";

import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

// Enhanced Dashboard Card Component
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
    className={`p-6 mb-6 bg-white rounded-3xl ${enabled ? "":"opacity-60"}`}
    style={{
      shadowColor: enabled ? color : "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: enabled ? 0.15 : 0.05,
      shadowRadius: 16,
      elevation: 8,
    }}
    disabled={!enabled}
  >
    <View className="items-center">
      <View
        className="justify-center items-center mb-5 w-24 h-24 rounded-full"
        style={{
          backgroundColor: enabled ? `${color}20` : "#F3F4F6",
          borderWidth: 2,
          borderColor: enabled ? `${color}30` : "#E5E7EB",
        }}
      >
        <Text className="text-5xl">{icon}</Text>
      </View>

      <Text
        className="mb-3 text-xl font-bold text-center"
        style={{ color: enabled ? "#1F2937" : "#9CA3AF" }}
      >
        {title}
      </Text>

      <Text
        className="px-2 text-sm leading-6 text-center"
        style={{ color: enabled ? "#6B7280" : "#9CA3AF" }}
      >
        {description}
      </Text>

      {!enabled && (
        <View
          className="px-4 py-2 mt-4 rounded-full"
          style={{ backgroundColor: "rgba(156, 163, 175, 0.2)" }}
        >
          <Text className="text-xs font-semibold text-gray-500">
            Coming Soon
          </Text>
        </View>
      )}

      {enabled && (
        <View
          className="px-4 py-2 mt-4 rounded-full"
          style={{ backgroundColor: `${color}15` }}
        >
          <Text className="text-xs font-semibold" style={{ color: color }}>
            Tap to Continue →
          </Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

const StatsCard = ({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) => (
  <View
    className="flex-1 p-5 mx-1 bg-white rounded-2xl"
    style={{
      shadowColor: color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    }}
  >
    <View className="items-center">
      <Text className="mb-1 text-3xl font-bold" style={{ color: color }}>
        {value}
      </Text>
      <Text className="text-sm font-medium text-center text-gray-600">
        {label}
      </Text>
    </View>
  </View>
);

export default function ManagePets() {
  const handleNavigateToPets = () => {
    router.push("./petsList");
  };

  const handleNavigateToAddPet = () => {
    router.push("./addPet");
  };

  const handleNavigateToPost = () => {
    router.push("./createPost");
  };

  return (
    <View className="flex-1 mb-36 bg-gradient-to-b from-orange-50 to-white">
      <View className="px-6 pt-12 pb-8">
        <View className="items-center">
          <View
            className="justify-center items-center mb-4 w-8 h-8 rounded-full"
            style={{ backgroundColor: "rgba(255, 114, 0, 0.15)" }}
          >
            <Text className="text-3xl">🏠</Text>
          </View>
          <Text className="mb-2 text-3xl font-bold text-center text-gray-800">
            Pet Management
          </Text>
          <Text className="px-4 leading-5 text-center text-gray-600">
            Everything you need to manage your beloved pets in one place
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          <DashboardCard
            title="My Pets"
            description="View, edit, and manage all your registered pets with ease"
            icon="🐾"
            onPress={handleNavigateToPets}
            color="#FF7200FF"
          />

          <DashboardCard
            title="Add New Pet"
            description="Register a new furry friend with photos, videos and details"
            icon="➕"
            onPress={handleNavigateToAddPet}
            color="#10B981"
          />

          <DashboardCard
            title="Create Post"
            description="Share amazing stories and updates about your pets with the community"
            icon="📝"
            onPress={handleNavigateToPost}
            color="#8B5CF6"
            enabled={true}
          />
        </View>

        <View className="mb-8">
          <Text className="mb-5 text-xl font-bold text-gray-800">
            Quick Overview
          </Text>
          <View className="flex-row">
            <StatsCard value="7" label="Total Pets" color="#FF7200FF" />
            <StatsCard value="0" label="Posts Created" color="#10B981" />
          </View>
        </View>
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
