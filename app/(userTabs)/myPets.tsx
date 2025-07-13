"use client";

import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PetDetailsModal } from "../../components";
import { supabase } from "../../utils/supabase";
import { useAuth } from "../provider/AuthProvider";

const { height: screenHeight } = Dimensions.get("window");
const HEADER_HEIGHT = screenHeight * 0.08;

interface AdoptionRequest {
  id: string;
  status: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  pet: {
    id: string;
    name: string;
    breed: string;
    age: number;
    gender: string;
    location: string;
    photoUrl: string;
    owner: {
      username: string;
    };
  };
}

export default function MyPets() {
  const { user } = useAuth();
  const [adoptionRequests, setAdoptionRequests] = useState<AdoptionRequest[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPetDetailsModal, setShowPetDetailsModal] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  // Fetch adoption requests when screen focuses
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchAdoptionRequests();
      }
    }, [user])
  );

  const fetchAdoptionRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("Adoption_Request")
        .select(
          `
          id,
          status,
          message,
          createdAt,
          updatedAt,
          pet:Pet!inner (
            id,
            name,
            breed,
            age,
            gender,
            location,
            photoUrl,
            owner:User!inner (
              username
            )
          )
        `
        )
        .eq("user_id", user.id)
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Error fetching adoption requests:", error);
        Alert.alert("Error", "Failed to load adoption requests.");
        return;
      }

      setAdoptionRequests((data as unknown as AdoptionRequest[]) || []);
    } catch (error) {
      console.error("Error fetching adoption requests:", error);
      Alert.alert("Error", "Failed to load adoption requests.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAdoptionRequests();
    setRefreshing(false);
  }, []);

  const withdrawRequest = async (requestId: string, petName: string) => {
    Alert.alert(
      "Withdraw Request",
      `Are you sure you want to withdraw your adoption request for ${petName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Withdraw",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("Adoption_Request")
                .update({
                  status: "withdrawn",
                  updatedAt: new Date().toISOString(),
                })
                .eq("id", requestId);

              if (error) {
                console.error("Error withdrawing request:", error);
                Alert.alert("Error", "Failed to withdraw request.");
                return;
              }

              Alert.alert(
                "Success",
                "Your adoption request has been withdrawn."
              );
              fetchAdoptionRequests(); // Refresh the list
            } catch (error) {
              console.error("Error withdrawing request:", error);
              Alert.alert("Error", "Failed to withdraw request.");
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
        return "Under Review";
      case "approved":
        return "Approved";
      case "rejected":
        return "Not Selected";
      case "withdrawn":
        return "Withdrawn";
      default:
        return status;
    }
  };

  const AdoptionRequestCard = ({ request }: { request: AdoptionRequest }) => (
    <View
      className="overflow-hidden mb-4 rounded-3xl bg-slate-200"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 10,
      }}
    >
      <View className="p-5">
        <View className="flex-row">
          {/* Pet Image */}
          <View className="mr-4">
            <Image
              source={{
                uri:
                  request.pet.photoUrl ||
                  "https://via.placeholder.com/80x80/F3F4F6/9CA3AF?text=No+Image",
              }}
              style={{ width: 80, height: 80 }}
              className="bg-gray-100 rounded-2xl"
            />
          </View>

          {/* Pet Info */}
          <View className="flex-1">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-xl font-bold text-gray-900">
                {request.pet.name}
              </Text>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: getStatusColor(request.status) }}
              >
                <Text className="text-xs font-semibold text-white">
                  {getStatusText(request.status)}
                </Text>
              </View>
            </View>

            <Text className="mb-1 text-base font-semibold text-gray-700">
              {request.pet.breed}
            </Text>
            <Text className="mb-1 text-sm text-gray-600">
              {request.pet.age} years • {request.pet.gender}
            </Text>
            <Text className="mb-1 text-sm text-gray-600">
              📍{request.pet.location}
            </Text>

            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-semibold text-blue-600">
                @{request.pet.owner.username}
              </Text>
              <Text className="text-xs text-gray-500">
                {new Date(request.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {request.status === "pending" && (
          <View className="flex-row gap-4 mt-4 space-x-3">
            <TouchableOpacity
              className="flex-1 py-3 rounded-2xl border border-gray-200"
              style={{ backgroundColor: "#F8F9FA" }}
              onPress={() => withdrawRequest(request.id, request.pet.name)}
            >
              <Text className="font-semibold text-center text-gray-700">
                Withdraw
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 rounded-2xl"
              style={{
                backgroundColor: "#007AFF",
                shadowColor: "#007AFF",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 3,
              }}
              onPress={() => {
                setSelectedPetId(request.pet.id);
                setShowPetDetailsModal(true);
              }}
            >
              <Text className="font-semibold text-center text-white">
                View Pet
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {request.status === "approved" && (
          <View className="mt-4">
            <TouchableOpacity
              className="py-3 rounded-2xl"
              style={{
                backgroundColor: "#34C759",
                shadowColor: "#34C759",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 3,
              }}
              onPress={() => {
                Alert.alert(
                  "Congratulations!",
                  `Your adoption request for ${request.pet.name} has been approved! The pet owner will contact you soon.`
                );
              }}
            >
              <Text className="font-semibold text-center text-white">
                🎉 Adoption Approved!
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const EmptyState = () => (
    <View className="flex-1 justify-center items-center py-20">
      <View
        className="justify-center items-center mb-6 w-32 h-32 rounded-full"
        style={{
          backgroundColor: "#F0F8FF",
          borderWidth: 2,
          borderColor: "#E3F2FD",
        }}
      >
        <Text className="text-6xl">🐾</Text>
      </View>
      <Text className="mb-3 text-2xl font-bold text-gray-900">
        No Adoption Requests
      </Text>
      <Text className="px-8 mb-8 leading-6 text-center text-gray-600">
        Start your pet adoption journey today! Browse available pets and find
        your perfect companion.
      </Text>
      <TouchableOpacity
        className="px-8 py-4 rounded-2xl"
        style={{
          backgroundColor: "#007AFF",
          shadowColor: "#007AFF",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 6,
        }}
        onPress={() => router.push("./home")}
      >
        <Text className="text-lg font-semibold text-white">Browse Pets</Text>
      </TouchableOpacity>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <View
          className="justify-center items-center mb-6 w-32 h-32 rounded-full"
          style={{
            backgroundColor: "#F0F8FF",
            borderWidth: 2,
            borderColor: "#E3F2FD",
          }}
        >
          <Text className="text-6xl">🔒</Text>
        </View>
        <Text className="mb-3 text-2xl font-bold text-gray-900">
          Login Required
        </Text>
        <Text className="px-8 mb-8 leading-6 text-center text-gray-600">
          Please sign in to view your adoption requests and track your
          applications
        </Text>
        <TouchableOpacity
          className="px-8 py-4 rounded-2xl"
          style={{
            backgroundColor: "#007AFF",
            shadowColor: "#007AFF",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 6,
          }}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text className="text-lg font-semibold text-white">Sign In</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 mb-28">
        {/* Clean Header */}
        <View
          className="justify-center px-6 bg-white"
          style={{
            height: HEADER_HEIGHT,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <View className="items-center">
            <Text className="mb-1 text-2xl font-bold text-gray-900">
              My Requests 📋
            </Text>
            <Text className="text-sm text-gray-600">
              Track your adoption applications
            </Text>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 px-6" style={{ backgroundColor: "#F8F9FA" }}>
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <View
                className="justify-center items-center mb-4 w-20 h-20 rounded-full"
                style={{ backgroundColor: "#F0F8FF" }}
              >
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
              <Text className="text-lg font-semibold text-gray-900">
                Loading your requests...
              </Text>
              <Text className="mt-1 text-sm text-gray-600">
                Please wait a moment
              </Text>
            </View>
          ) : adoptionRequests.length > 0 ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#007AFF"
                />
              }
              contentContainerStyle={{ paddingTop: 20 }}
            >
              {/* Enhanced Stats */}
              <View className="flex-row gap-4 mb-6 space-x-3">
                <View
                  className="flex-1 p-4 bg-white rounded-2xl"
                  style={{
                    shadowColor: "#007AFF",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 12,
                    elevation: 6,
                  }}
                >
                  <Text className="text-2xl font-bold text-center text-gray-900">
                    {adoptionRequests.length}
                  </Text>
                  <Text className="text-xs font-semibold text-center text-gray-600">
                    TOTAL REQUESTS
                  </Text>
                </View>

                <View
                  className="flex-1 p-4 bg-white rounded-2xl"
                  style={{
                    shadowColor: "#FF9500",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 12,
                    elevation: 6,
                  }}
                >
                  <Text className="text-2xl font-bold text-center text-orange-500">
                    {
                      adoptionRequests.filter((r) => r.status === "pending")
                        .length
                    }
                  </Text>
                  <Text className="text-xs font-semibold text-center text-gray-600">
                    PENDING
                  </Text>
                </View>

                <View
                  className="flex-1 p-4 bg-white rounded-2xl"
                  style={{
                    shadowColor: "#34C759",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 12,
                    elevation: 6,
                  }}
                >
                  <Text className="text-2xl font-bold text-center text-green-500">
                    {
                      adoptionRequests.filter((r) => r.status === "approved")
                        .length
                    }
                  </Text>
                  <Text className="text-xs font-semibold text-center text-gray-600">
                    APPROVED
                  </Text>
                </View>
              </View>

              {/* Adoption Requests List */}
              {adoptionRequests.map((request) => (
                <AdoptionRequestCard key={request.id} request={request} />
              ))}

              <View className="h-20" />
            </ScrollView>
          ) : (
            <EmptyState />
          )}
        </View>
      </View>

      {/* Pet Details Modal */}
      <PetDetailsModal
        visible={showPetDetailsModal}
        onClose={() => {
          setShowPetDetailsModal(false);
          setSelectedPetId(null);
        }}
        petId={selectedPetId || undefined}
      />
    </SafeAreaView>
  );
}
