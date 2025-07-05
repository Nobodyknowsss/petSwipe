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
            photoUrl
          )
        `
        )
        .eq("id", requestId)
        .single();

      if (requestError) {
        console.error("Error fetching request:", requestError);
        Alert.alert("Error", "Failed to load application details.");
      } else {
        setAdoptionRequest(requestData as unknown as AdoptionRequest);
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
                    onPress: () => router.back(),
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
                    onPress: () => router.back(),
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
        return "#FCD34D";
      case "approved":
        return "#34D399";
      case "rejected":
        return "#F87171";
      case "withdrawn":
        return "#9CA3AF";
      default:
        return "#FCD34D";
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
      <SafeAreaView className="flex-1 justify-center items-center bg-gradient-to-b from-orange-50 to-white">
        <View
          className="justify-center items-center mb-4 w-20 h-20 rounded-full"
          style={{ backgroundColor: "rgba(255, 114, 0, 0.1)" }}
        >
          <ActivityIndicator size="large" color="#FF7200FF" />
        </View>
        <Text className="text-lg font-semibold text-gray-800">
          Loading application details...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-orange-50 to-white">
      <View className="flex-1 mb-28">
        {/* Header */}
        <View className="px-6 pt-8 pb-6">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="justify-center items-center mr-4 w-10 h-10 rounded-full"
              style={{ backgroundColor: "rgba(255, 114, 0, 0.1)" }}
            >
              <Text
                className="text-xl font-bold"
                style={{ color: "#FF7200FF" }}
              >
                ←
              </Text>
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-800">
                Application Details
              </Text>
              <Text className="text-gray-600">
                {adopterName} wants to adopt {petName}
              </Text>
            </View>
          </View>

          {/* Status Badge */}
          <View className="flex-row justify-center">
            <View
              className="px-4 py-2 rounded-full"
              style={{
                backgroundColor: `${getStatusColor(status as string)}30`,
              }}
            >
              <Text
                className="text-sm font-bold"
                style={{ color: getStatusColor(status as string) }}
              >
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
              className="p-5 mb-6 bg-white rounded-3xl"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Text className="mb-4 text-lg font-bold text-gray-800">
                Pet Information
              </Text>
              <View className="flex-row">
                <Image
                  source={{
                    uri:
                      adoptionRequest.pet.photoUrl ||
                      "https://via.placeholder.com/80x80/F3F4F6/9CA3AF?text=Pet",
                  }}
                  className="w-20 h-20 mr-4 rounded-2xl"
                  style={{ backgroundColor: "#F3F4F6" }}
                />
                <View className="flex-1">
                  <Text className="mb-1 text-xl font-bold text-gray-800">
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
              className="p-5 mb-6 bg-white rounded-3xl"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Text className="mb-3 text-lg font-bold text-gray-800">
                Message from Adopter
              </Text>
              <Text className="text-gray-700 leading-6">
                {adoptionRequest.message}
              </Text>
            </View>
          )}

          {/* Adopter Profile */}
          {adoptionProfile && (
            <View
              className="p-5 mb-6 bg-white rounded-3xl"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Text className="mb-4 text-lg font-bold text-gray-800">
                Adopter Profile
              </Text>

              <View className="space-y-4">
                {/* Basic Information */}
                <View>
                  <Text className="mb-2 text-sm font-semibold text-gray-500">
                    BASIC INFORMATION
                  </Text>
                  <View className="p-4 bg-gray-50 rounded-xl">
                    <Text className="mb-2 text-base font-semibold text-gray-800">
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
                    <View className="p-4 bg-gray-50 rounded-xl">
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
                    <View className="p-4 bg-gray-50 rounded-xl">
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
                  <View className="p-4 bg-gray-50 rounded-xl">
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
                    <View className="p-4 bg-gray-50 rounded-xl">
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
              className="p-5 mb-6 bg-white rounded-3xl"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Text className="mb-4 text-lg font-bold text-gray-800">
                Application Timeline
              </Text>
              <View className="space-y-2">
                <Text className="text-sm text-gray-600">
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
            <View className="flex-row mb-8 space-x-4">
              <TouchableOpacity
                className="flex-1 py-4 rounded-2xl"
                style={{ backgroundColor: "#F87171" }}
                onPress={handleRejectRequest}
              >
                <Text className="text-lg font-bold text-center text-white">
                  Reject Application
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-4 rounded-2xl"
                style={{
                  backgroundColor: "#10B981",
                  shadowColor: "#10B981",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={handleAcceptRequest}
              >
                <Text className="text-lg font-bold text-center text-white">
                  Accept Application
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="h-20" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
