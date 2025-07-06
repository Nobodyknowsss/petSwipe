"use client";

import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../../utils/supabase";
import { useAuth } from "../provider/AuthProvider";

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
    className={`p-4 mb-3 bg-white rounded-2xl ${enabled ? "":"opacity-60"}`}
    style={{
      shadowColor: enabled ? color : "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: enabled ? 0.2 : 0.05,
      shadowRadius: 12,
      elevation: 8,
    }}
    disabled={!enabled}
  >
    <View className="items-center">
      <View
        className="justify-center items-center mb-3 w-14 h-14 rounded-full"
        style={{
          backgroundColor: enabled ? `${color}20` : "#F3F4F6",
          borderWidth: 2,
          borderColor: enabled ? `${color}30` : "#E5E7EB",
        }}
      >
        <Text className="text-2xl">{icon}</Text>
      </View>

      <Text
        className="mb-2 text-base font-bold text-center"
        style={{ color: enabled ? "#1F2937" : "#9CA3AF" }}
      >
        {title}
      </Text>

      <Text
        className="px-2 text-sm leading-5 text-center"
        style={{ color: enabled ? "#6B7280" : "#9CA3AF" }}
      >
        {description}
      </Text>

      {!enabled && (
        <View
          className="px-3 py-1 mt-3 rounded-full"
          style={{ backgroundColor: "rgba(156, 163, 175, 0.2)" }}
        >
          <Text className="text-xs font-semibold text-gray-500">
            Coming Soon
          </Text>
        </View>
      )}

      {enabled && (
        <View
          className="px-3 py-1 mt-3 rounded-full"
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

// Enhanced Stats Card Component
const StatsCard = ({
  value,
  label,
  color,
  loading = false,
}: {
  value: string | number;
  label: string;
  color: string;
  loading?: boolean;
}) => (
  <View
    className="flex-1 p-4 mx-1 bg-white rounded-xl"
    style={{
      shadowColor: color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 6,
    }}
  >
    <View className="items-center">
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Text className="mb-1 text-2xl font-bold" style={{ color: color }}>
          {value}
        </Text>
      )}
      <Text className="text-xs font-semibold text-center text-gray-600">
        {label}
      </Text>
    </View>
  </View>
);

export default function ManagePets() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPets: 0,
    totalPosts: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch stats when screen focuses
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchStats();
      }
    }, [user])
  );

  const fetchStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Fetch total pets count
      const { count: petsCount, error: petsError } = await supabase
        .from("Pet")
        .select("*", { count: "exact", head: true })
        .eq("ownerId", user.id);

      // Fetch total posts/videos count
      const { count: postsCount, error: postsError } = await supabase
        .from("Video")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (petsError) {
        console.error("Error fetching pets count:", petsError);
      }
      if (postsError) {
        console.error("Error fetching posts count:", postsError);
      }

      setStats({
        totalPets: petsCount || 0,
        totalPosts: postsCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToPets = () => {
    router.push("./petsList");
  };

  const handleNavigateToAddPet = () => {
    router.push("./addPet");
  };

  const handleNavigateToPost = () => {
    router.push("./createPost");
  };

  const handleDeletePost = () => {
    console.log("Delete post functionality - to be implemented");
  };

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center mb-28 bg-white">
        <View
          className="justify-center items-center mb-6 w-24 h-24 rounded-full"
          style={{
            backgroundColor: "#F0F8FF",
            borderWidth: 2,
            borderColor: "#E3F2FD",
          }}
        >
          <Text className="text-4xl">🔒</Text>
        </View>
        <Text className="mb-3 text-2xl font-bold text-gray-900">
          Login Required
        </Text>
        <Text className="px-8 text-center text-gray-600">
          Please log in to manage your pets
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 mb-28 bg-white">
      {/* Enhanced Header */}
      <View
        className="px-6 pt-12 pb-6 bg-white"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <View className="items-center">
          <View
            className="justify-center items-center mb-4 w-10 h-10 rounded-full"
            style={{
              backgroundColor: "rgba(255, 114, 0, 0.15)",
              borderWidth: 2,
              borderColor: "rgba(255, 114, 0, 0.3)",
            }}
          >
            <Text className="text-xl">🏠</Text>
          </View>
          <Text className="mb-2 text-xl font-bold text-center text-gray-900">
            Pet Management
          </Text>
          <Text className="leading-5 text-center text-gray-600">
            Manage your beloved pets in one place
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-6 bg-slate-300">
        {/* Action Cards - 2x2 Grid */}
        <View className="flex-1 pt-6">
          <View className="flex-row mb-3">
            <View className="flex-1 mr-2">
              <DashboardCard
                title="My Pets"
                description="View and manage all your pets"
                icon="🐾"
                onPress={handleNavigateToPets}
                color="#FF7200FF"
              />
            </View>
            <View className="flex-1 ml-2">
              <DashboardCard
                title="Add New Pet"
                description="Register a new pet with details"
                icon="➕"
                onPress={handleNavigateToAddPet}
                color="#10B981"
              />
            </View>
          </View>

          <View className="flex-row">
            <View className="flex-1 mr-2">
              <DashboardCard
                title="Create Post"
                description="Share stories about your pets"
                icon="📝"
                onPress={handleNavigateToPost}
                color="#8B5CF6"
                enabled={true}
              />
            </View>
            <View className="flex-1 ml-2">
              <DashboardCard
                title="Delete Post"
                description="Remove posts you no longer want"
                icon="🗑️"
                onPress={handleDeletePost}
                color="#FF3B30"
                enabled={true}
              />
            </View>
          </View>
        </View>

        {/* Enhanced Quick Stats */}
        <View className="mb-6">
          <Text className="mb-4 text-lg font-bold text-gray-900">
            Quick Overview
          </Text>
          <View className="flex-row">
            <StatsCard
              value={stats.totalPets}
              label="Total Pets"
              color="#FF7200FF"
              loading={loading}
            />
            <StatsCard
              value={stats.totalPosts}
              label="Posts Created"
              color="#10B981"
              loading={loading}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
