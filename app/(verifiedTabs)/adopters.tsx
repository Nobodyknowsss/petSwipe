"use client";

import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../utils/supabase";
import { useAuth } from "../provider/AuthProvider";

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

export default function AdoptersPage() {
  const { user } = useAuth();
  const [adoptionRequests, setAdoptionRequests] = useState<AdoptionRequest[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      // Get adoption requests for pets owned by the current user
      const { data, error } = await supabase
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
        .eq("pet.ownerId", user.id)
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

  const handleViewApplication = (request: AdoptionRequest) => {
    router.push({
      pathname: "/(verifiedTabs)/applicationDetails",
      params: {
        requestId: request.id,
        adopterId: request.user.id,
        petId: request.pet.id,
        petName: request.pet.name,
        adopterName: request.user.username,
        status: request.status,
      },
    });
  };

  const handleAcceptRequest = async (
    requestId: string,
    petName: string,
    adopterName: string
  ) => {
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
                `${adopterName}'s application for ${petName} has been accepted!`
              );
              fetchAdoptionRequests(); // Refresh the list
            } catch (error) {
              console.error("Error accepting request:", error);
              Alert.alert("Error", "Failed to accept application.");
            }
          },
        },
      ]
    );
  };

  const handleRejectRequest = async (
    requestId: string,
    petName: string,
    adopterName: string
  ) => {
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
                `${adopterName}'s application for ${petName} has been rejected.`
              );
              fetchAdoptionRequests(); // Refresh the list
            } catch (error) {
              console.error("Error rejecting request:", error);
              Alert.alert("Error", "Failed to reject application.");
            }
          },
        },
      ]
    );
  };

  const filteredRequests = adoptionRequests.filter(
    (request) =>
      request.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.pet.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const AdopterCard = ({ request }: { request: AdoptionRequest }) => (
    <View
      className="overflow-hidden mb-4 bg-white rounded-3xl"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
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
                  "https://via.placeholder.com/70x70/F3F4F6/9CA3AF?text=Pet",
              }}
              className="w-16 h-16 rounded-2xl"
              style={{ backgroundColor: "#F3F4F6" }}
            />
          </View>

          {/* Request Info */}
          <View className="flex-1">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-lg font-bold text-gray-900">
                @{request.user.username}
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

            <Text className="mb-1 text-sm font-semibold text-gray-600">
              Wants to adopt: {request.pet.name}
            </Text>
            <Text className="mb-1 text-xs text-gray-500">
              {request.pet.breed} • {request.pet.age} years •{" "}
              {request.pet.gender}
            </Text>
            <Text className="mb-2 text-xs text-gray-500">
              📍 {request.pet.location}
            </Text>
            <Text className="text-xs text-gray-400">
              Applied: {new Date(request.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Message Section */}
        {request.message && (
          <View className="p-3 mt-4 bg-gray-50 rounded-2xl">
            <Text className="mb-1 text-xs font-semibold text-gray-500">
              MESSAGE FROM ADOPTER:
            </Text>
            <Text className="text-sm text-gray-700">{request.message}</Text>
          </View>
        )}

        {/* View Application Button - Always visible */}
        <View className="mt-4">
          <TouchableOpacity
            className="py-3 rounded-2xl"
            style={{ backgroundColor: "#007AFF" }}
            onPress={() => handleViewApplication(request)}
          >
            <Text className="font-semibold text-center text-white">
              View Application
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        {request.status === "pending" && (
          <View className="flex-row gap-4 mt-3 space-x-3">
            <TouchableOpacity
              className="flex-1 py-3 rounded-2xl"
              style={{ backgroundColor: "#FF3B30" }}
              onPress={() =>
                handleRejectRequest(
                  request.id,
                  request.pet.name,
                  request.user.username
                )
              }
            >
              <Text className="font-semibold text-center text-white">
                Reject
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 rounded-2xl"
              style={{ backgroundColor: "#34C759" }}
              onPress={() =>
                handleAcceptRequest(
                  request.id,
                  request.pet.name,
                  request.user.username
                )
              }
            >
              <Text className="font-semibold text-center text-white">
                Accept
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const EmptyState = () => (
    <View className="justify-center items-center py-20">
      <View
        className="justify-center items-center mb-6 w-32 h-32 rounded-full"
        style={{ backgroundColor: "#4A4A4A" }}
      >
        <Text className="text-5xl">👥</Text>
      </View>
      <Text className="mb-3 text-2xl font-bold text-white">
        No adoption requests
      </Text>
      <Text className="px-8 leading-6 text-center text-gray-300">
        {searchQuery
          ? "No requests match your search terms"
          : "No one has applied to adopt your pets yet"}
      </Text>
    </View>
  );

  if (!user) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: "#3b3b3b" }}
      >
        <View
          className="justify-center items-center mb-6 w-32 h-32 rounded-full"
          style={{ backgroundColor: "#4A4A4A" }}
        >
          <Text className="text-5xl">🔒</Text>
        </View>
        <Text className="mb-3 text-2xl font-bold text-white">
          Login Required
        </Text>
        <Text className="px-8 leading-6 text-center text-gray-300">
          Please log in to view adoption requests
        </Text>
        <TouchableOpacity
          className="px-8 py-4 mt-6 rounded-2xl"
          style={{ backgroundColor: "#007AFF" }}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text className="text-lg font-semibold text-white">Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 mb-28" style={{ backgroundColor: "#3b3b3b" }}>
      {/* Header */}
      <View className="px-6 pt-12 pb-6">
        <Text className="mb-2 text-2xl font-bold text-center text-white">
          Adoption Requests
        </Text>
        <Text className="mb-6 text-center text-gray-300">
          Review applications for your pets
        </Text>

        {/* Search Bar */}
        <View className="relative">
          <TextInput
            placeholder="Search by adopter name, pet name, or breed..."
            placeholderTextColor="#9CA3AF"
            className="px-5 py-4 pr-12 w-full text-base text-gray-800 bg-white rounded-2xl"
            style={{
              backgroundColor: "#FFFFFF",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View className="absolute top-4 right-4">
            <Text className="text-lg text-gray-500">🔍</Text>
          </View>
        </View>

        {/* Results Counter */}
        {searchQuery && (
          <Text className="mt-3 text-sm text-gray-300">
            {filteredRequests.length} request
            {filteredRequests.length !== 1 ? "s" : ""} found
          </Text>
        )}

        {/* Quick Stats */}
        {adoptionRequests.length > 0 && (
          <View className="flex-row gap-4 mt-4 space-x-3">
            <View
              className="flex-1 p-4 rounded-2xl"
              style={{
                backgroundColor: "#FF9500",
                shadowColor: "#FF9500",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Text className="text-2xl font-bold text-center text-white">
                {adoptionRequests.filter((r) => r.status === "pending").length}
              </Text>
              <Text className="text-xs font-semibold text-center text-white opacity-90">
                PENDING
              </Text>
            </View>
            <View
              className="flex-1 p-4 rounded-2xl"
              style={{
                backgroundColor: "#34C759",
                shadowColor: "#34C759",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Text className="text-2xl font-bold text-center text-white">
                {adoptionRequests.filter((r) => r.status === "approved").length}
              </Text>
              <Text className="text-xs font-semibold text-center text-white opacity-90">
                APPROVED
              </Text>
            </View>
            <View
              className="flex-1 p-4 rounded-2xl"
              style={{
                backgroundColor: "#007AFF",
                shadowColor: "#007AFF",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Text className="text-2xl font-bold text-center text-white">
                {adoptionRequests.length}
              </Text>
              <Text className="text-xs font-semibold text-center text-white opacity-90">
                TOTAL
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Adoption Requests List */}
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
            colors={["#FFFFFF"]}
          />
        }
      >
        {loading ? (
          <View className="justify-center items-center py-20">
            <View
              className="justify-center items-center mb-4 w-20 h-20 rounded-full"
              style={{ backgroundColor: "#4A4A4A" }}
            >
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
            <Text className="text-lg font-semibold text-white">
              Loading requests...
            </Text>
            <Text className="mt-1 text-sm text-gray-400">
              Please wait a moment
            </Text>
          </View>
        ) : filteredRequests.length > 0 ? (
          <>
            {filteredRequests.map((request) => (
              <AdopterCard key={request.id} request={request} />
            ))}
            <View className="h-20" />
          </>
        ) : (
          <EmptyState />
        )}
      </ScrollView>
    </View>
  );
}
