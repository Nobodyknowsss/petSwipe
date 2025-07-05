"use client";

import { useRouter } from "expo-router";
import { useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  LikedVideos,
  Orders,
  SettingsModal,
  useLikedVideosCount,
} from "../../components/userTabs";
import { useAuth } from "../provider/AuthProvider";

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"liked" | "orders">("liked");
  const [showSettings, setShowSettings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Get liked videos count for stats
  const likedVideosCount = useLikedVideosCount();

  const onRefresh = async () => {
    setRefreshing(true);
    // The refresh logic is handled by individual components
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (!user) {
    // Guest user view - TikTok style
    return (
      <SafeAreaView className="flex-1 mb-24 bg-white">
        {/* Header with burger menu */}
        <View className="flex-row justify-between items-center px-6 py-4">
          <View className="w-8" />
          <Text className="text-lg font-semibold text-gray-900">Profile</Text>
          <TouchableOpacity onPress={() => setShowSettings(true)}>
            <Text className="text-2xl text-gray-700">☰</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1">
          <View className="flex-1 px-6 py-4">
            {/* Profile Section */}
            <View className="items-center mb-8">
              {/* Profile Picture */}
              <View
                className="justify-center items-center mb-4 w-24 h-24 rounded-full border-2"
                style={{ backgroundColor: "#F3F4F6", borderColor: "#E5E7EB" }}
              >
                <Text className="text-4xl">👤</Text>
              </View>

              {/* Username */}
              <Text className="mb-1 text-xl font-bold text-gray-900">
                @guest
              </Text>

              {/* Stats Row */}
              <View className="flex-row gap-12 justify-center items-center mb-6 space-x-12">
                <View className="items-center">
                  <Text className="text-lg font-bold text-gray-900">0</Text>
                  <Text className="text-sm text-gray-500">Following</Text>
                </View>
                <View className="items-center">
                  <Text className="text-lg font-bold text-gray-900">0</Text>
                  <Text className="text-sm text-gray-500">Followers</Text>
                </View>
                <View className="items-center">
                  <Text className="text-lg font-bold text-gray-900">0</Text>
                  <Text className="text-sm text-gray-500">Likes</Text>
                </View>
              </View>

              {/* Action Buttons Row */}
              <View className="flex-row gap-4 justify-center mb-4 space-x-3 w-full">
                <TouchableOpacity
                  className="flex-1 py-3 rounded-md"
                  style={{ backgroundColor: "#FF2D55" }}
                  onPress={() => router.push("/(auth)/login")}
                >
                  <Text className="text-base font-semibold text-center text-white">
                    Sign In
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 rounded-md border"
                  style={{ borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" }}
                  onPress={() => router.push("/(auth)/signup")}
                >
                  <Text className="text-base font-semibold text-center text-gray-900">
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Add Bio Button */}
              <TouchableOpacity
                className="px-4 py-2 rounded-md"
                style={{ backgroundColor: "#F3F4F6" }}
              >
                <Text className="text-sm font-medium text-gray-700">
                  + Add bio
                </Text>
              </TouchableOpacity>
            </View>

            {/* Benefits Section */}
            <View className="p-6 mb-6 bg-gray-50 rounded-2xl">
              <Text className="mb-4 text-lg font-bold text-gray-900">
                Join PetSwipe to:
              </Text>
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <Text className="mr-3 text-lg text-red-500">✓</Text>
                  <Text className="text-gray-700">Save your favorite pets</Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="mr-3 text-lg text-red-500">✓</Text>
                  <Text className="text-gray-700">
                    Connect with other pet lovers
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="mr-3 text-lg text-red-500">✓</Text>
                  <Text className="text-gray-700">
                    Access exclusive content
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="mr-3 text-lg text-red-500">✓</Text>
                  <Text className="text-gray-700">
                    Personalized recommendations
                  </Text>
                </View>
              </View>
            </View>

            {/* Tabs */}
            <View className="flex-row mb-6">
              <TouchableOpacity
                className={`flex-1 py-3 border-b-2 ${activeTab === "liked" ? "border-red-500" : "border-gray-200"}`}
                onPress={() => setActiveTab("liked")}
              >
                <Text
                  className={`text-center font-medium ${activeTab === "liked" ? "text-red-500" : "text-gray-500"}`}
                >
                  ❤️ Liked videos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 border-b-2 ${activeTab === "orders" ? "border-red-500" : "border-gray-200"}`}
                onPress={() => setActiveTab("orders")}
              >
                <Text
                  className={`text-center font-medium ${activeTab === "orders" ? "text-red-500" : "text-gray-500"}`}
                >
                  📋 Your orders
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            {activeTab === "liked" ? (
              <View className="flex-1 justify-center items-center py-12">
                <Text className="mb-4 text-6xl">🐾</Text>
                <Text className="mb-2 text-xl font-semibold text-gray-900">
                  No content yet
                </Text>
                <Text className="text-center text-gray-500">
                  Sign in to start exploring pets and saving your favorites!
                </Text>
              </View>
            ) : (
              <Orders isActive={activeTab === "orders"} />
            )}
          </View>
        </ScrollView>

        <SettingsModal
          visible={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </SafeAreaView>
    );
  }

  // Authenticated user view - TikTok style
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with burger menu */}
      <View className="flex-row justify-between items-center px-6 py-4">
        <View className="w-8" />
        <Text className="text-lg font-semibold text-gray-900">Profile</Text>
        <TouchableOpacity onPress={() => setShowSettings(true)}>
          <Text className="text-2xl text-gray-700">☰</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF2D55"]}
            tintColor="#FF2D55"
          />
        }
        showsVerticalScrollIndicator={true}
      >
        <View className="flex-1 px-6 py-4">
          {/* Profile Section */}
          <View className="items-center mb-8">
            {/* Profile Picture */}
            <View
              className="justify-center items-center mb-4 w-24 h-24 rounded-full border-2"
              style={{ backgroundColor: "#FF2D55", borderColor: "#FF2D55" }}
            >
              <Text className="text-4xl font-bold text-white">
                {user.username.charAt(0).toUpperCase()}
              </Text>
            </View>

            {/* Username */}
            <Text className="mb-1 text-xl font-bold text-gray-900">
              @{user.username}
            </Text>

            {/* Stats Row */}
            <View className="flex-row gap-16 justify-center items-center mb-6 space-x-12">
              <View className="items-center">
                <Text className="text-lg font-bold text-gray-900">0</Text>
                <Text className="text-sm text-gray-500">Following</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold text-gray-900">0</Text>
                <Text className="text-sm text-gray-500">Followers</Text>
              </View>
              <View className="items-center">
                <Text className="text-lg font-bold text-gray-900">
                  {likedVideosCount}
                </Text>
                <Text className="text-sm text-gray-500">Likes</Text>
              </View>
            </View>

            {/* Action Buttons Row */}
            <View className="flex-row gap-4 justify-center mb-4 space-x-3 w-full">
              <TouchableOpacity
                className="flex-1 py-3 rounded-md border"
                style={{ borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" }}
              >
                <Text className="text-base font-semibold text-center text-gray-900">
                  Edit Profile
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 rounded-md border"
                style={{ borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" }}
                onPress={() => router.push("/(adoptionProfile)/page")}
              >
                <Text className="text-base font-semibold text-center text-gray-900">
                  My adoption profile
                </Text>
              </TouchableOpacity>
            </View>

            {/* Add Bio Button */}
            <TouchableOpacity
              className="px-4 py-2 rounded-md"
              style={{ backgroundColor: "#F3F4F6" }}
            >
              <Text className="text-sm font-medium text-gray-700">
                + Add bio
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View className="flex-row mb-6">
            <TouchableOpacity
              className={`flex-1 py-3 border-b-2 ${activeTab === "liked" ? "border-red-500" : "border-gray-200"}`}
              onPress={() => setActiveTab("liked")}
            >
              <Text
                className={`text-center font-medium ${activeTab === "liked" ? "text-red-500" : "text-gray-500"}`}
              >
                ❤️ Liked videos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 border-b-2 ${activeTab === "orders" ? "border-red-500" : "border-gray-200"}`}
              onPress={() => setActiveTab("orders")}
            >
              <Text
                className={`text-center font-medium ${activeTab === "orders" ? "text-red-500" : "text-gray-500"}`}
              >
                📋 Your orders
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === "liked" ? (
            <LikedVideos
              isActive={activeTab === "liked"}
              onRefresh={onRefresh}
              refreshing={refreshing}
            />
          ) : (
            <Orders isActive={activeTab === "orders"} />
          )}
        </View>
      </ScrollView>

      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </SafeAreaView>
  );
}
