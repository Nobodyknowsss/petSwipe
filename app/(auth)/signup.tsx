"use client";

import { useRouter } from "expo-router";
import { useState } from "react";
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

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const { SignUp, loading } = useAuth();

  const handleSignUp = async () => {
    const success = await SignUp(email, password, username);
    if (success) {
      router.push("/(userTabs)/home");
    }
  };

  const isFormValid = email && password && username && email.includes("@");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gradient-to-b from-orange-50 to-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-8 py-12">
          <View className="items-center mb-10">
            <View
              className="justify-center items-center mb-6 w-24 h-24 rounded-full shadow-lg"
              style={{ backgroundColor: "#FF7200FF" }}
            >
              <Text className="text-4xl font-bold text-white">🐾</Text>
            </View>
            <Text className="mb-2 text-4xl font-bold text-gray-800">
              Join PetSwipe
            </Text>
            <Text className="text-lg leading-6 text-center text-gray-600">
              Create your account to start your pet journey
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-5">
            <View>
              <Text className="mb-3 text-sm font-semibold text-gray-700">
                Username
              </Text>
              <TextInput
                placeholder="Choose a username"
                placeholderTextColor="#9CA3AF"
                className="px-5 py-4 w-full text-base text-gray-800 bg-white rounded-2xl border-2 border-gray-100 shadow-sm"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

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
                placeholder="Create a password"
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
              <Text className="mt-2 ml-1 text-xs text-gray-500">
                Password should be at least 6 characters
              </Text>
            </View>

            <TouchableOpacity
              className={`w-full py-5 rounded-2xl shadow-lg mt-8 ${loading || !isFormValid ? "opacity-70" : ""}`}
              style={{
                backgroundColor:
                  loading || !isFormValid ? "#D1D5DB" : "#FF7200FF",
                shadowColor: "#FF7200FF",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isFormValid && !loading ? 0.3 : 0.1,
                shadowRadius: 12,
                elevation: 6,
              }}
              onPress={handleSignUp}
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <View className="flex-row justify-center items-center">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="ml-3 text-lg font-bold text-white">
                    Creating Account...
                  </Text>
                </View>
              ) : (
                <Text className="text-lg font-bold text-center text-white">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="items-center mt-10">
            <Text className="mb-6 text-base text-gray-600">
              Already have an account?
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
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
                Sign In
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
