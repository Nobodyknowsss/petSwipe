"use client";

import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import "../../global.css";
import { useAuth } from "../provider/AuthProvider";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { SignIn, loading, setUserState } = useAuth();

  const handleLogin = async () => {
    await SignIn(email, password);
    // Navigation is handled automatically in AuthProvider based on verification status
  };

  useEffect(() => {
    setUserState(null);
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gradient-to-b from-orange-50 to-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-8 py-12">
          {/* Header */}
          <View className="items-center mb-12">
            <View
              className="justify-center items-center mb-6 w-24 h-24 rounded-full shadow-lg"
              style={{ backgroundColor: "#FF7200FF" }}
            >
              <Text className="text-4xl font-bold text-white">🐾</Text>
            </View>
            <Text className="mb-2 text-4xl font-bold text-gray-800">
              Welcome Back
            </Text>
            <Text className="text-lg leading-6 text-center text-gray-600">
              Sign in to continue caring for your furry friends
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-6">
            <View>
              <Text className="mb-3 text-sm font-semibold text-gray-700">
                Email Address
              </Text>
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                className="px-5 py-4 w-full text-base text-gray-800 bg-white rounded-2xl border-2 border-gray-100 shadow-sm"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View>
              <Text className="mb-3 text-sm font-semibold text-gray-700">
                Password
              </Text>
              <TextInput
                secureTextEntry={true}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                className="px-5 py-4 w-full text-base text-gray-800 bg-white rounded-2xl border-2 border-gray-100 shadow-sm"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              className={`w-full py-5 rounded-2xl shadow-lg mt-8 ${loading ? "opacity-70" : ""}`}
              style={{
                backgroundColor: loading ? "#D1D5DB" : "#FF7200FF",
                shadowColor: "#FF7200FF",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
              onPress={handleLogin}
              disabled={loading || !email || !password}
            >
              {loading ? (
                <View className="flex-row justify-center items-center">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="ml-3 text-lg font-bold text-white">
                    Signing In...
                  </Text>
                </View>
              ) : (
                <Text className="text-lg font-bold text-center text-white">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="items-center mt-10">
            <Text className="mb-6 text-base text-gray-600">
              Don&apos;t have an account?
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/signup")}
              disabled={loading}
              className="px-8 py-4 rounded-2xl border-2 shadow-sm"
              style={{
                borderColor: "#FF7200FF",
                backgroundColor: "rgba(255, 114, 0, 0.05)",
              }}
            >
              <Text
                className="text-base font-bold"
                style={{ color: "#FF7200FF" }}
              >
                Create Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(userTabs)/home")}
              disabled={loading}
              className="px-8 py-4 mt-6"
            >
              <Text className="text-base font-medium text-gray-500">
                Continue as Guest
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
