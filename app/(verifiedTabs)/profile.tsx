"use client";

import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../provider/AuthProvider";

export default function Profile() {
  const { user, SignOut, loading } = useAuth();
  const router = useRouter();

  if (!user) {
    // Guest user view
    return (
      <ScrollView className="flex-1 bg-gradient-to-b from-orange-50 to-white">
        <View className="flex-1 px-6 py-8">
          {/* Header */}
          <View className="items-center mb-8">
            <View
              className="justify-center items-center mb-4 w-24 h-24 rounded-full shadow-lg"
              style={{ backgroundColor: "rgba(255, 114, 0, 0.1)" }}
            >
              <Text className="text-4xl">👤</Text>
            </View>
            <Text className="mb-2 text-2xl font-bold text-gray-800">
              Guest User
            </Text>
            <Text className="leading-6 text-center text-gray-600">
              Sign in to unlock all features and save your preferences
            </Text>
          </View>

          {/* Benefits Section */}
          <View
            className="p-6 mb-6 bg-white rounded-2xl"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text className="mb-4 text-lg font-bold text-gray-800">
              Join PetSwipe to:
            </Text>
            <View className="space-y-3">
              <View className="flex-row items-center">
                <Text className="mr-3 text-lg" style={{ color: "#FF7200FF" }}>
                  ✓
                </Text>
                <Text className="text-gray-700">Save your favorite pets</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="mr-3 text-lg" style={{ color: "#FF7200FF" }}>
                  ✓
                </Text>
                <Text className="text-gray-700">
                  Connect with other pet lovers
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="mr-3 text-lg" style={{ color: "#FF7200FF" }}>
                  ✓
                </Text>
                <Text className="text-gray-700">Access exclusive content</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="mr-3 text-lg" style={{ color: "#FF7200FF" }}>
                  ✓
                </Text>
                <Text className="text-gray-700">
                  Personalized recommendations
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="space-y-4">
            <TouchableOpacity
              className="py-5 w-full rounded-2xl shadow-lg"
              style={{
                backgroundColor: "#FF7200FF",
                shadowColor: "#FF7200FF",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text className="text-lg font-bold text-center text-white">
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="py-5 mt-2 w-full rounded-2xl border-2 shadow-sm"
              style={{
                borderColor: "#FF7200FF",
                backgroundColor: "rgba(255, 114, 0, 0.05)",
              }}
              onPress={() => router.push("/(auth)/signup")}
            >
              <Text
                className="text-lg font-bold text-center"
                style={{ color: "#FF7200FF" }}
              >
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Guest Features */}
          <View
            className="p-6 mt-8 bg-white rounded-2xl"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text className="mb-4 text-lg font-bold text-gray-800">
              Available as Guest:
            </Text>
            <View className="space-y-2">
              <Text className="text-gray-600">• Browse pet profiles</Text>
              <Text className="text-gray-600">• View shop items</Text>
              <Text className="text-gray-600">• Explore content</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Authenticated user view
  return (
    <ScrollView className="flex-1 bg-gradient-to-b from-orange-50 to-white">
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="items-center mb-8">
          <View
            className="justify-center items-center mb-4 w-24 h-24 rounded-full shadow-lg"
            style={{ backgroundColor: "#FF7200FF" }}
          >
            <Text className="text-4xl font-bold text-white">
              {user.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="mb-1 text-2xl font-bold text-gray-800">
            {user.username}
          </Text>
          <Text className="text-gray-600">{user.email}</Text>
        </View>

        {/* Profile Stats */}
        <View
          className="p-6 mb-6 bg-white rounded-2xl"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Text className="mb-4 text-lg font-bold text-gray-800">
            Your Activity
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text
                className="text-2xl font-bold"
                style={{ color: "#FF7200FF" }}
              >
                0
              </Text>
              <Text className="text-sm text-gray-600">Favorites</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-500">0</Text>
              <Text className="text-sm text-gray-600">Matches</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-purple-500">0</Text>
              <Text className="text-sm text-gray-600">Messages</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View
          className="p-6 mb-6 bg-white rounded-2xl"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Text className="mb-4 text-lg font-bold text-gray-800">Settings</Text>
          <TouchableOpacity className="py-4 border-b border-gray-100">
            <Text className="font-medium text-gray-700">Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-4 border-b border-gray-100">
            <Text className="font-medium text-gray-700">Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-4 border-b border-gray-100">
            <Text className="font-medium text-gray-700">Privacy</Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-4">
            <Text className="font-medium text-gray-700">Help & Support</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          className={`w-full py-5 rounded-2xl shadow-lg ${loading ? "opacity-70" : ""}`}
          style={{
            backgroundColor: loading ? "#D1D5DB" : "#EF4444",
            shadowColor: "#EF4444",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: loading ? 0.1 : 0.3,
            shadowRadius: 12,
            elevation: 6,
          }}
          onPress={SignOut}
          disabled={loading}
        >
          <Text className="text-lg font-bold text-center text-white">
            {loading ? "Signing Out..." : "Sign Out"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
