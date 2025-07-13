"use client";

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../app/provider/AuthProvider";
import { supabase } from "../../utils/supabase";

const { width: screenWidth } = Dimensions.get("window");

interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  gender: string;
  location: string;
  description: string;
  photoUrl: string;
  videoUrl: string;
  ownerId: string;
  createdAt: string;
}

interface PetDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  petId?: string;
  userId?: string;
}

export default function PetDetailsModal({
  visible,
  onClose,
  petId,
  userId,
}: PetDetailsModalProps) {
  const { user } = useAuth();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(false);
  const [adoptionLoading, setAdoptionLoading] = useState(false);

  useEffect(() => {
    if (visible && (petId || userId)) {
      if (petId) {
        fetchSinglePet(petId);
      } else if (userId) {
        fetchUserPets(userId);
      }
    }
  }, [visible, petId, userId]);

  const fetchSinglePet = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("Pet")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        Alert.alert("Error", "Pet not found.");
        onClose();
        return;
      }

      setPet(data);
    } catch (error) {
      console.error("Error fetching pet:", error);
      Alert.alert("Error", "Failed to load pet details.");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPets = async (ownerId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("Pet")
        .select("*")
        .eq("ownerId", ownerId)
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Error fetching pets:", error);
        Alert.alert("Error", "Failed to load pets.");
        onClose();
        return;
      }

      if (data && data.length > 0) {
        setPet(data[0]); // Show the most recent pet
      } else {
        Alert.alert("No pets found", "This user hasn't added any pets yet.");
        onClose();
      }
    } catch (error) {
      console.error("Error fetching pets:", error);
      Alert.alert("Error", "Failed to load pets.");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Adoption flow functions
  const checkAdoptionProfile = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("Adoption Profile")
        .select("id, first_name, last_name, phone, email")
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        return false;
      }

      return !!(data.first_name && data.last_name && data.phone && data.email);
    } catch (error) {
      console.error("Error checking adoption profile:", error);
      return false;
    }
  };

  const createAdoptionRequest = async (petId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from("Adoption_Request")
        .insert([
          {
            user_id: userId,
            pet_id: petId,
            status: "pending",
            message: `Interest expressed in adopting ${pet?.name}`,
            updatedAt: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          Alert.alert(
            "Already Applied",
            "You have already expressed interest in this pet. Check your adoption requests in My Pets."
          );
          return false;
        }
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Error creating adoption request:", error);
      Alert.alert(
        "Error",
        "Failed to submit adoption request. Please try again."
      );
      return false;
    }
  };

  const handleAdoptionInterest = async () => {
    if (!user) {
      Alert.alert(
        "Login Required",
        "Please log in to express interest in adoption."
      );
      return;
    }

    if (!pet) {
      Alert.alert("Error", "Pet information not found.");
      return;
    }

    Alert.alert("Adopt", `Would you like to adopt ${pet.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          setAdoptionLoading(true);
          try {
            const hasProfile = await checkAdoptionProfile(user.id);

            if (!hasProfile) {
              Alert.alert(
                "Complete Your Profile",
                "You need to complete your adoption profile before expressing interest in pets.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Complete Profile",
                    onPress: () => {
                      onClose();
                      // Navigate to adoption profile page
                      // You might need to implement this navigation
                    },
                  },
                ]
              );
              return;
            }

            const success = await createAdoptionRequest(pet.id, user.id);

            if (success) {
              Alert.alert(
                "Success!",
                `Your interest in ${pet.name} has been submitted! You can track your adoption requests in My Pets.`,
                [
                  {
                    text: "View My Pets",
                    onPress: () => {
                      onClose();
                      // Navigate to My Pets page
                      // You might need to implement this navigation
                    },
                  },
                  { text: "OK", style: "default" },
                ]
              );
            }
          } catch (error) {
            console.error("Error in adoption process:", error);
            Alert.alert("Error", "Something went wrong. Please try again.");
          } finally {
            setAdoptionLoading(false);
          }
        },
      },
    ]);
  };

  const handleClose = () => {
    setPet(null);
    setLoading(false);
    setAdoptionLoading(false);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-gradient-to-b from-orange-50 to-white">
        {/* Header */}
        <View className="px-6 pt-12 pb-6 bg-white border-b border-gray-200">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity
              onPress={handleClose}
              className="justify-center items-center w-10 h-10 rounded-full"
              style={{ backgroundColor: "rgba(255, 114, 0, 0.1)" }}
            >
              <Text
                className="text-xl font-bold"
                style={{ color: "#FF7200FF" }}
              >
                ✕
              </Text>
            </TouchableOpacity>
            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-gray-800">
                {pet?.name || "Pet Details"}
              </Text>
            </View>
            <View className="w-10" />
          </View>
        </View>

        {/* Content */}
        <View className="flex-1">
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <View
                className="justify-center items-center mb-4 w-20 h-20 rounded-full"
                style={{ backgroundColor: "rgba(255, 114, 0, 0.1)" }}
              >
                <ActivityIndicator size="large" color="#FF7200FF" />
              </View>
              <Text className="text-lg font-semibold text-gray-800">
                Loading pet details...
              </Text>
              <Text className="mt-1 text-sm text-gray-500">
                Please wait a moment
              </Text>
            </View>
          ) : pet ? (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {/* Hero Image */}
              <View className="items-center mb-8">
                <Image
                  source={{
                    uri:
                      pet.photoUrl ||
                      "https://via.placeholder.com/400x300/F3F4F6/9CA3AF?text=No+Image",
                  }}
                  style={{
                    width: screenWidth - 32,
                    height: 280,
                    borderRadius: 20,
                  }}
                  className="bg-gray-100"
                />
              </View>

              {/* Pet Information Card */}
              <View
                className="p-6 mx-4 mb-6 bg-white rounded-2xl"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                {/* Name */}
                <Text className="mb-6 text-3xl font-bold text-gray-800">
                  {pet.name}
                </Text>

                {/* Basic Info Grid */}
                <View className="space-y-4">
                  <View className="flex-row space-x-4">
                    <View className="flex-1">
                      <Text className="mb-1 text-sm font-semibold text-gray-500">
                        BREED
                      </Text>
                      <Text className="text-lg font-semibold text-gray-800">
                        {pet.breed}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="mb-1 text-sm font-semibold text-gray-500">
                        AGE
                      </Text>
                      <Text className="text-lg font-semibold text-gray-800">
                        {pet.age} years old
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row space-x-4">
                    <View className="flex-1">
                      <Text className="mb-1 text-sm font-semibold text-gray-500">
                        GENDER
                      </Text>
                      <Text className="text-lg font-semibold text-gray-800">
                        {pet.gender}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="mb-1 text-sm font-semibold text-gray-500">
                        LOCATION
                      </Text>
                      <Text className="text-lg font-semibold text-gray-800">
                        {pet.location}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Description Card */}
              {pet.description && (
                <View
                  className="p-6 mx-4 mb-6 bg-white rounded-2xl"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                    elevation: 6,
                  }}
                >
                  <Text className="mb-3 text-sm font-semibold text-gray-500">
                    ABOUT {pet.name.toUpperCase()}
                  </Text>
                  <Text className="text-base leading-7 text-gray-700">
                    {pet.description}
                  </Text>
                </View>
              )}

              {/* Adoption Button */}
              <View className="mx-4 mb-8">
                <TouchableOpacity
                  className="py-5 rounded-2xl"
                  style={{
                    backgroundColor: adoptionLoading ? "#CCC" : "#FF7200FF",
                    shadowColor: "#FF7200FF",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                  onPress={handleAdoptionInterest}
                  disabled={adoptionLoading}
                >
                  {adoptionLoading ? (
                    <View className="flex-row justify-center items-center">
                      <ActivityIndicator size="small" color="white" />
                      <Text className="ml-2 text-lg font-bold text-center text-white">
                        Processing...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-lg font-bold text-center text-white">
                      Want to adopt {pet.name}?
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              <View className="h-20" />
            </ScrollView>
          ) : (
            <View className="flex-1 justify-center items-center">
              <Text className="text-lg text-gray-600">
                No pet information available
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
