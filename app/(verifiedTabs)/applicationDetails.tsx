"use client";

import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../utils/supabase";

interface AdoptionProfile {
  id: number;
  first_name: string;
  last_name: string;
  address: string;
  phone: string;
  email: string;
  birth_date: string;
  occupation: string;
  company_name: string;
  social: string;
  social_link: string;
  status: string;
  pronouns: string;
  alt_first_name: string;
  alt_last_name: string;
  alt_relationship: string;
  alt_phone: string;
  alt_email: string;
  preference: string;
  has_adopted: boolean;
  adopt_specific_pet: boolean;
  pet_description: string;
}

interface AdoptionRequest {
  id: string;
  status: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  pet: {
    id: string;
    name: string;
    breed: string;
    age: number;
    gender: string;
    location: string;
    photoUrl: string;
    ownerId: string;
  };
}

export default function ApplicationDetails() {
  const { requestId, adopterId, petId, petName, adopterName, status } =
    useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [adoptionProfile, setAdoptionProfile] =
    useState<AdoptionProfile | null>(null);
  const [adoptionRequest, setAdoptionRequest] =
    useState<AdoptionRequest | null>(null);

  useEffect(() => {
    fetchApplicationDetails();
  }, []);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);

      // Get current user to verify pet ownership
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert(
          "Error",
          "You must be logged in to view application details."
        );
        router.push("/(verifiedTabs)/adopters");
        return;
      }

      // Fetch detailed adoption request
      const { data: requestData, error: requestError } = await supabase
        .from("Adoption_Request")
        .select(
          `
          id,
          status,
          message,
          createdAt,
          updatedAt,
          user:User!inner (
            id,
            username,
            email
          ),
          pet:Pet!inner (
            id,
            name,
            breed,
            age,
            gender,
            location,
            photoUrl,
            ownerId
          )
        `
        )
        .eq("id", requestId)
        .single();

      if (requestError || !requestData) {
        console.error("Error fetching request:", requestError);
        Alert.alert("Error", "Failed to load application details.");
        router.push("/(verifiedTabs)/adopters");
        return;
      }

      // CRITICAL: Verify that the pet belongs to the current user
      const adoptionRequestData = requestData as unknown as AdoptionRequest & {
        pet: { ownerId: string };
      };
      if (adoptionRequestData.pet.ownerId !== user.id) {
        Alert.alert(
          "Error",
          "You don't have permission to view this application."
        );
        router.push("/(verifiedTabs)/adopters");
        return;
      }

      setAdoptionRequest(adoptionRequestData);

      // Fetch adoption profile
      const { data: profileData, error: profileError } = await supabase
        .from("Adoption Profile")
        .select("*")
        .eq("user_id", adopterId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      } else {
        setAdoptionProfile(profileData);
      }
    } catch (error) {
      console.error("Error fetching application details:", error);
      Alert.alert("Error", "Failed to load application details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    Alert.alert(
      "Accept Application",
      `Are you sure you want to accept ${adopterName}'s application for ${petName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          style: "default",
          onPress: async () => {
            try {
              // Get current user for authorization
              const {
                data: { user },
              } = await supabase.auth.getUser();
              if (!user) {
                Alert.alert(
                  "Error",
                  "You must be logged in to perform this action."
                );
                return;
              }

              // CRITICAL: Verify pet ownership before updating
              if (!adoptionRequest || adoptionRequest.pet.ownerId !== user.id) {
                Alert.alert(
                  "Error",
                  "You don't have permission to perform this action."
                );
                return;
              }

              const { error } = await supabase
                .from("Adoption_Request")
                .update({
                  status: "approved",
                  updatedAt: new Date().toISOString(),
                })
                .eq("id", requestId);

              if (error) {
                console.error("Error accepting request:", error);
                Alert.alert("Error", "Failed to accept application.");
                return;
              }

              Alert.alert(
                "Success!",
                `${adopterName}'s application for ${petName} has been accepted!`,
                [
                  {
                    text: "OK",
                    onPress: () => router.push("/(verifiedTabs)/adopters"),
                  },
                ]
              );
            } catch (error) {
              console.error("Error accepting request:", error);
              Alert.alert("Error", "Failed to accept application.");
            }
          },
        },
      ]
    );
  };

  const handleRejectRequest = async () => {
    Alert.alert(
      "Reject Application",
      `Are you sure you want to reject ${adopterName}'s application for ${petName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            try {
              // Get current user for authorization
              const {
                data: { user },
              } = await supabase.auth.getUser();
              if (!user) {
                Alert.alert(
                  "Error",
                  "You must be logged in to perform this action."
                );
                return;
              }

              // CRITICAL: Verify pet ownership before updating
              if (!adoptionRequest || adoptionRequest.pet.ownerId !== user.id) {
                Alert.alert(
                  "Error",
                  "You don't have permission to perform this action."
                );
                return;
              }

              const { error } = await supabase
                .from("Adoption_Request")
                .update({
                  status: "rejected",
                  updatedAt: new Date().toISOString(),
                })
                .eq("id", requestId);

              if (error) {
                console.error("Error rejecting request:", error);
                Alert.alert("Error", "Failed to reject application.");
                return;
              }

              Alert.alert(
                "Application Rejected",
                `${adopterName}'s application for ${petName} has been rejected.`,
                [
                  {
                    text: "OK",
                    onPress: () => router.push("/(verifiedTabs)/adopters"),
                  },
                ]
              );
            } catch (error) {
              console.error("Error rejecting request:", error);
              Alert.alert("Error", "Failed to reject application.");
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FF9500"; // Orange
      case "approved":
        return "#34C759"; // Green
      case "rejected":
        return "#FF3B30"; // Red
      case "withdrawn":
        return "#8E8E93"; // Gray
      default:
        return "#FF9500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending Review";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "withdrawn":
        return "Withdrawn";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: "#3b3b3b" }}
      >
        <View
          className="justify-center items-center mb-4 w-20 h-20 rounded-full"
          style={{ backgroundColor: "#4A4A4A" }}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
        <Text className="text-lg font-semibold text-white">
          Loading application details...
        </Text>
        <Text className="mt-1 text-sm text-gray-400">Please wait a moment</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#3b3b3b" }}>
      <View className="flex-1 mb-28">
        {/* Compact Header */}
        <View className="px-6 pt-8 pb-4">
          <View className="flex-row items-center mb-3">
            <TouchableOpacity
              onPress={() => router.push("/(verifiedTabs)/adopters")}
              className="justify-center items-center mr-4 w-10 h-10 rounded-full"
              style={{ backgroundColor: "#4A4A4A" }}
            >
              <Text className="text-xl font-bold text-white">←</Text>
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-xl font-bold text-white">
                Application Details
              </Text>
              <Text className="text-sm text-gray-300">
                {adopterName} wants to adopt {petName}
              </Text>
            </View>
          </View>

          {/* Status Badge */}
          <View className="flex-row justify-center">
            <View
              className="px-4 py-2 rounded-full"
              style={{
                backgroundColor: getStatusColor(status as string),
              }}
            >
              <Text className="text-sm font-semibold text-white">
                {getStatusText(status as string)}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Pet Information */}
          {adoptionRequest && (
            <View
              className="p-5 mb-4 bg-white rounded-3xl"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 3,
              }}
            >
              <Text className="mb-4 text-lg font-bold text-gray-900">
                Pet Information
              </Text>
              <View className="flex-row">
                <Image
                  source={{
                    uri:
                      adoptionRequest.pet.photoUrl ||
                      "https://via.placeholder.com/80x80/F3F4F6/9CA3AF?text=Pet",
                  }}
                  className="mr-4 w-20 h-20 rounded-2xl"
                  style={{ backgroundColor: "#F3F4F6" }}
                />
                <View className="flex-1">
                  <Text className="mb-1 text-xl font-bold text-gray-900">
                    {adoptionRequest.pet.name}
                  </Text>
                  <Text className="mb-1 text-gray-600">
                    {adoptionRequest.pet.breed}
                  </Text>
                  <Text className="mb-1 text-sm text-gray-500">
                    {adoptionRequest.pet.age} years •{" "}
                    {adoptionRequest.pet.gender}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    📍 {adoptionRequest.pet.location}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Application Message */}
          {adoptionRequest?.message && (
            <View
              className="p-5 mb-4 bg-white rounded-3xl"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 3,
              }}
            >
              <Text className="mb-3 text-lg font-bold text-gray-900">
                Message from Adopter
              </Text>
              <View className="p-3 bg-gray-50 rounded-2xl">
                <Text className="mb-1 text-xs font-semibold text-gray-500">
                  MESSAGE FROM ADOPTER:
                </Text>
                <Text className="text-sm text-gray-700">
                  {adoptionRequest.message}
                </Text>
              </View>
            </View>
          )}

          {/* Adopter Profile */}
          {adoptionProfile && (
            <View
              className="p-5 mb-4 bg-white rounded-3xl"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 3,
              }}
            >
              <Text className="mb-4 text-lg font-bold text-gray-900">
                Adopter Profile
              </Text>

              <View className="space-y-3">
                {/* Basic Information */}
                <View>
                  <Text className="mb-2 text-sm font-semibold text-gray-500">
                    BASIC INFORMATION
                  </Text>
                  <View className="p-4 bg-gray-50 rounded-2xl">
                    <Text className="mb-2 text-base font-semibold text-gray-900">
                      {adoptionProfile.first_name} {adoptionProfile.last_name}
                    </Text>
                    <Text className="mb-1 text-sm text-gray-600">
                      📧 {adoptionProfile.email}
                    </Text>
                    <Text className="mb-1 text-sm text-gray-600">
                      📞 {adoptionProfile.phone}
                    </Text>
                    {adoptionProfile.address && (
                      <Text className="mb-1 text-sm text-gray-600">
                        📍 {adoptionProfile.address}
                      </Text>
                    )}
                    {adoptionProfile.birth_date && (
                      <Text className="text-sm text-gray-600">
                        🎂{" "}
                        {new Date(
                          adoptionProfile.birth_date
                        ).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Work Information */}
                {(adoptionProfile.occupation ||
                  adoptionProfile.company_name) && (
                  <View>
                    <Text className="mb-2 text-sm font-semibold text-gray-500">
                      WORK INFORMATION
                    </Text>
                    <View className="p-4 bg-gray-50 rounded-2xl">
                      {adoptionProfile.occupation && (
                        <Text className="mb-1 text-sm text-gray-600">
                          💼 {adoptionProfile.occupation}
                        </Text>
                      )}
                      {adoptionProfile.company_name && (
                        <Text className="text-sm text-gray-600">
                          🏢 {adoptionProfile.company_name}
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* Emergency Contact */}
                {(adoptionProfile.alt_first_name ||
                  adoptionProfile.alt_phone) && (
                  <View>
                    <Text className="mb-2 text-sm font-semibold text-gray-500">
                      EMERGENCY CONTACT
                    </Text>
                    <View className="p-4 bg-gray-50 rounded-2xl">
                      {adoptionProfile.alt_first_name && (
                        <Text className="mb-1 text-sm text-gray-600">
                          👤 {adoptionProfile.alt_first_name}{" "}
                          {adoptionProfile.alt_last_name}
                        </Text>
                      )}
                      {adoptionProfile.alt_relationship && (
                        <Text className="mb-1 text-sm text-gray-600">
                          🤝 {adoptionProfile.alt_relationship}
                        </Text>
                      )}
                      {adoptionProfile.alt_phone && (
                        <Text className="mb-1 text-sm text-gray-600">
                          📞 {adoptionProfile.alt_phone}
                        </Text>
                      )}
                      {adoptionProfile.alt_email && (
                        <Text className="text-sm text-gray-600">
                          📧 {adoptionProfile.alt_email}
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* Adoption Preferences */}
                <View>
                  <Text className="mb-2 text-sm font-semibold text-gray-500">
                    ADOPTION PREFERENCES
                  </Text>
                  <View className="p-4 bg-gray-50 rounded-2xl">
                    {adoptionProfile.preference && (
                      <Text className="mb-1 text-sm text-gray-600">
                        ❤️ Pet Preference: {adoptionProfile.preference}
                      </Text>
                    )}
                    <Text className="mb-1 text-sm text-gray-600">
                      🏠 Has adopted before:{" "}
                      {adoptionProfile.has_adopted ? "Yes" : "No"}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      🎯 Adopting specific pet:{" "}
                      {adoptionProfile.adopt_specific_pet ? "Yes" : "No"}
                    </Text>
                  </View>
                </View>

                {/* Pet Description */}
                {adoptionProfile.pet_description && (
                  <View>
                    <Text className="mb-2 text-sm font-semibold text-gray-500">
                      WHAT THEY&apos;RE LOOKING FOR
                    </Text>
                    <View className="p-4 bg-gray-50 rounded-2xl">
                      <Text className="text-sm text-gray-700">
                        {adoptionProfile.pet_description}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Application Timeline */}
          {adoptionRequest && (
            <View
              className="p-5 mb-4 bg-white rounded-3xl"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 3,
              }}
            >
              <Text className="mb-3 text-lg font-bold text-gray-900">
                Application Timeline
              </Text>
              <View className="p-4 bg-gray-50 rounded-2xl">
                <Text className="mb-1 text-sm text-gray-600">
                  📅 Applied:{" "}
                  {new Date(adoptionRequest.createdAt).toLocaleDateString()}
                </Text>
                <Text className="text-sm text-gray-600">
                  🔄 Last Updated:{" "}
                  {new Date(adoptionRequest.updatedAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          {status === "pending" && (
            <View className="flex-row gap-4 mb-6 space-x-4">
              <TouchableOpacity
                className="flex-1 py-4 rounded-2xl"
                style={{ backgroundColor: "#FF3B30" }}
                onPress={handleRejectRequest}
              >
                <Text className="text-lg font-semibold text-center text-white">
                  Reject Application
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-4 rounded-2xl"
                style={{ backgroundColor: "#34C759" }}
                onPress={handleAcceptRequest}
              >
                <Text className="text-lg font-semibold text-center text-white">
                  Accept Application
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="h-8" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
