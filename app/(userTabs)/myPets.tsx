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
        return "#f47c0b"; // Bright Yellow
      case "approved":
        return "#34D399"; // Bright Green
      case "rejected":
        return "#F87171"; // Bright Red
      case "withdrawn":
        return "#9CA3AF"; // Gray
      default:
        return "#FCD34D";
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
      className="overflow-hidden mb-4 bg-white rounded-3xl"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
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
                  "https://via.placeholder.com/70x70/F3F4F6/9CA3AF?text=No+Image",
              }}
              style={{ width: 70, height: 70 }}
              className="bg-gray-100 rounded-2xl"
            />
          </View>

          {/* Pet Info */}
          <View className="flex-1">
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-lg font-bold text-gray-800">
                {request.pet.name}
              </Text>
              <View
                className="px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${getStatusColor(request.status)}30`,
                }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: getStatusColor(request.status) }}
                >
                  {getStatusText(request.status)}
                </Text>
              </View>
            </View>

            <Text className="mb-1 text-sm font-semibold text-gray-600">
              {request.pet.breed}
            </Text>
            <Text className="mb-1 text-xs text-gray-500">
              {request.pet.age} years • {request.pet.gender}
            </Text>
            <Text className="mb-2 text-xs text-gray-500">
              📍 {request.pet.location}
            </Text>

            <View className="flex-row justify-between items-center">
              <Text className="text-xs font-semibold text-gray-400">
                @{request.pet.owner.username}
              </Text>
              <Text className="text-xs text-gray-400">
                {new Date(request.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {request.status === "pending" && (
          <View className="flex-row gap-4 mt-4 space-x-3">
            <TouchableOpacity
              className="flex-1 py-3 rounded-2xl"
              style={{ backgroundColor: "#F3F4F6" }}
              onPress={() => withdrawRequest(request.id, request.pet.name)}
            >
              <Text className="font-bold text-center text-gray-600">
                Withdraw
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 rounded-2xl"
              style={{
                backgroundColor: "#8B5CF6",
                shadowColor: "#8B5CF6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={() =>
                router.push(
                  `./petDetails?petId=${request.pet.id}&fromMyPets=true`
                )
              }
            >
              <Text className="font-bold text-center text-white">View Pet</Text>
            </TouchableOpacity>
          </View>
        )}

        {request.status === "approved" && (
          <View className="mt-4">
            <TouchableOpacity
              className="py-3 rounded-2xl"
              style={{
                backgroundColor: "#10B981",
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              onPress={() => {
                Alert.alert(
                  "Congratulations!",
                  `Your adoption request for ${request.pet.name} has been approved! The pet owner will contact you soon.`
                );
              }}
            >
              <Text className="font-bold text-center text-white">
                🎉 Adoption Approved!
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const EmptyState = () => (
    <View className="flex-1 justify-center items-center py-16">
      <View
        className="justify-center items-center mb-4 w-24 h-24 rounded-full"
        style={{ backgroundColor: "#FFFFFF30" }}
      >
        <Text className="text-4xl">🐾</Text>
      </View>
      <Text className="mb-2 text-xl font-bold text-white">
        No Adoption Requests
      </Text>
      <Text className="px-8 mb-6 text-center text-white opacity-90">
        Start your pet adoption journey today!
      </Text>
      <TouchableOpacity
        className="px-6 py-3 rounded-2xl"
        style={{
          backgroundColor: "#FFFFFF",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 6,
        }}
        onPress={() => router.push("./home")}
      >
        <Text className="text-lg font-bold" style={{ color: "#FF7200FF" }}>
          Browse Pets
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: "#FF7200FF" }}
      >
        <View
          className="justify-center items-center mb-4 w-24 h-24 rounded-full"
          style={{ backgroundColor: "#FFFFFF30" }}
        >
          <Text className="text-4xl">🔒</Text>
        </View>
        <Text className="mb-2 text-xl font-bold text-white">
          Login Required
        </Text>
        <Text className="px-8 mb-6 text-center text-white opacity-90">
          Please log in to view your requests
        </Text>
        <TouchableOpacity
          className="px-6 py-3 rounded-2xl"
          style={{
            backgroundColor: "#FFFFFF",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 6,
          }}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text className="text-lg font-bold" style={{ color: "#FF7200FF" }}>
            Sign In
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#3b3b3b" }}>
      <View className="flex-1 mb-28">
        {/* Compact Header - 15% of screen */}
        <View className="justify-center px-6" style={{ height: HEADER_HEIGHT }}>
          <View className="items-center">
            <Text className="mb-1 text-xl font-bold text-white">
              My Requests 📋
            </Text>
            <Text className="text-sm text-white opacity-80">
              Track your applications
            </Text>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 px-4">
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <View
                className="justify-center items-center mb-3 w-16 h-16 rounded-full"
                style={{ backgroundColor: "#FFFFFF30" }}
              >
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
              <Text className="text-lg font-semibold text-white">
                Loading...
              </Text>
            </View>
          ) : adoptionRequests.length > 0 ? (
            <ScrollView
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
              {/* Compact Stats */}
              <View className="flex-row gap-4 mb-5 space-x-2">
                <View
                  className="flex-1 p-3 rounded-2xl"
                  style={{
                    backgroundColor: "#007AFF",
                    shadowColor: "#007AFF",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Text className="text-xl font-bold text-center text-white">
                    {adoptionRequests.length}
                  </Text>
                  <Text className="text-xs font-semibold text-center text-white opacity-90">
                    TOTAL
                  </Text>
                </View>

                <View
                  className="flex-1 p-3 rounded-2xl"
                  style={{
                    backgroundColor: "#FF9500",
                    shadowColor: "#FF9500",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Text className="text-xl font-bold text-center text-white">
                    {
                      adoptionRequests.filter((r) => r.status === "pending")
                        .length
                    }
                  </Text>
                  <Text className="text-xs font-semibold text-center text-white opacity-90">
                    PENDING
                  </Text>
                </View>

                <View
                  className="flex-1 p-3 rounded-2xl"
                  style={{
                    backgroundColor: "#34C759",
                    shadowColor: "#34C759",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Text className="text-xl font-bold text-center text-white">
                    {
                      adoptionRequests.filter((r) => r.status === "approved")
                        .length
                    }
                  </Text>
                  <Text className="text-xs font-semibold text-center text-white opacity-90">
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
    </SafeAreaView>
  );
}
