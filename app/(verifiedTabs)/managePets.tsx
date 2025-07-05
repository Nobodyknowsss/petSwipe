"use client";

import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

// Compact Dashboard Card Component
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
    className={`p-3 mb-3 bg-white rounded-2xl ${enabled ? "":"opacity-60"}`}
    style={{
      shadowColor: enabled ? color : "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: enabled ? 0.1 : 0.03,
      shadowRadius: 8,
      elevation: 4,
    }}
    disabled={!enabled}
  >
    <View className="items-center">
      <View
        className="justify-center items-center mb-2 w-12 h-12 rounded-full"
        style={{
          backgroundColor: enabled ? `${color}20` : "#F3F4F6",
          borderWidth: 1,
          borderColor: enabled ? `${color}30` : "#E5E7EB",
        }}
      >
        <Text className="text-2xl">{icon}</Text>
      </View>

      <Text
        className="mb-1 text-sm font-bold text-center"
        style={{ color: enabled ? "#1F2937" : "#9CA3AF" }}
      >
        {title}
      </Text>

      <Text
        className="px-1 text-xs leading-4 text-center"
        style={{ color: enabled ? "#6B7280" : "#9CA3AF" }}
      >
        {description}
      </Text>

      {!enabled && (
        <View
          className="px-2 py-1 mt-2 rounded-full"
          style={{ backgroundColor: "rgba(156, 163, 175, 0.2)" }}
        >
          <Text className="text-xs font-semibold text-gray-500">
            Coming Soon
          </Text>
        </View>
      )}

      {enabled && (
        <View
          className="px-2 py-1 mt-2 rounded-full"
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

// Compact Stats Card Component
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
    className="flex-1 p-3 mx-1 bg-white rounded-xl"
    style={{
      shadowColor: color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    }}
  >
    <View className="items-center">
      <Text className="mb-1 text-xl font-bold" style={{ color: color }}>
        {value}
      </Text>
      <Text className="text-xs font-medium text-center text-gray-600">
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
    <View className="flex-1 mb-28" style={{ backgroundColor: "#3b3b3b" }}>
      {/* Compact Header */}
      <View className="px-6 pt-8 pb-4">
        <View className="items-center">
          <View
            className="justify-center items-center mb-2 w-12 h-12 rounded-full"
            style={{ backgroundColor: "rgba(255, 114, 0, 0.15)" }}
          >
            <Text className="text-xl">🏠</Text>
          </View>
          <Text className="mb-1 text-xl font-bold text-center text-white">
            Pet Management
          </Text>
          <Text className="px-4 text-sm leading-4 text-center text-white">
            Manage your beloved pets in one place
          </Text>
        </View>
      </View>

      {/* Main Content - No Scroll */}
      <View className="flex-1 px-6">
        {/* Compact Action Cards */}
        <View className="flex-1 mb-4">
          <DashboardCard
            title="My Pets"
            description="View and manage all your pets"
            icon="🐾"
            onPress={handleNavigateToPets}
            color="#FF7200FF"
          />

          <DashboardCard
            title="Add New Pet"
            description="Register a new pet with details"
            icon="➕"
            onPress={handleNavigateToAddPet}
            color="#10B981"
          />

          <DashboardCard
            title="Create Post"
            description="Share stories about your pets"
            icon="📝"
            onPress={handleNavigateToPost}
            color="#8B5CF6"
            enabled={true}
          />
        </View>

        {/* Compact Quick Stats */}
        <View className="mb-4">
          <Text className="mb-3 text-base font-bold text-white">
            Quick Overview
          </Text>
          <View className="flex-row">
            <StatsCard value="7" label="Total Pets" color="#FF7200FF" />
            <StatsCard value="0" label="Posts Created" color="#10B981" />
          </View>
        </View>
      </View>
    </View>
  );
}
