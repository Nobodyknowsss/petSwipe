"use client";

import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../utils/supabase";
import { useAuth } from "../provider/AuthProvider";

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

interface AdoptionProfile {
  id: number;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  // ... other fields
}

export default function PetDetails() {
  const { user } = useAuth();
  const { userId, petId, showFirst, fromVideo, videoDate, fromMyPets } =
    useLocalSearchParams();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"list" | "details">("list");
  const [adoptionLoading, setAdoptionLoading] = useState(false);

  useEffect(() => {
    if (petId) {
      // Direct pet details view
      fetchSinglePet(petId as string);
      setStep("details");
    } else if (userId) {
      // Show pets by user
      if (showFirst === "true") {
        fetchUserPetsAndShowFirst(userId as string);
      } else {
        fetchUserPets(userId as string);
      }
    } else {
      // No pet or user specified, go back
      Alert.alert("Error", "No pet specified to view.");
      router.back();
    }
  }, [userId, petId, showFirst, fromVideo, videoDate, fromMyPets]);

  // Add new utility functions for adoption flow
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

      // Check if required fields are filled
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
            message: `Interest expressed in adopting ${selectedPet?.name}`,
            updatedAt: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        // Check if it's a duplicate request error
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

    if (!selectedPet) {
      Alert.alert("Error", "Pet information not found.");
      return;
    }

    Alert.alert("Adopt", `Would you like to adopt ${selectedPet.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          setAdoptionLoading(true);
          try {
            // Check if user has completed adoption profile
            const hasProfile = await checkAdoptionProfile(user.id);

            if (!hasProfile) {
              Alert.alert(
                "Complete Your Profile",
                "You need to complete your adoption profile before expressing interest in pets.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Complete Profile",
                    onPress: () => router.push("/(adoptionProfile)/page"),
                  },
                ]
              );
              return;
            }

            // Create adoption request
            const success = await createAdoptionRequest(
              selectedPet.id,
              user.id
            );

            if (success) {
              Alert.alert(
                "Success!",
                `Your interest in ${selectedPet.name} has been submitted! You can track your adoption requests in My Pets.`,
                [
                  {
                    text: "View My Pets",
                    onPress: () => router.push("/(userTabs)/myPets"),
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
        router.back();
        return;
      }

      setSelectedPet(data);
    } catch (error) {
      console.error("Error fetching pet:", error);
      Alert.alert("Error", "Failed to load pet details.");
      router.back();
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
        return;
      }

      setPets(data || []);
      // If only one pet, go directly to details
      if (data && data.length === 1) {
        setSelectedPet(data[0]);
        setStep("details");
      }
    } catch (error) {
      console.error("Error fetching pets:", error);
      Alert.alert("Error", "Failed to load pets.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPetsAndShowFirst = async (ownerId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("Pet")
        .select("*")
        .eq("ownerId", ownerId)
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Error fetching user pets:", error);
        Alert.alert("Error", "Failed to load pet details.");
        return;
      }

      if (data && data.length > 0) {
        let petToShow = data[0]; // Default to most recent pet

        // If we have video date, try to find the pet created closest to video time
        if (videoDate) {
          const videoTime = new Date(videoDate as string).getTime();
          let closestPet = data[0];
          let smallestTimeDiff = Math.abs(
            new Date(data[0].createdAt).getTime() - videoTime
          );

          for (const pet of data) {
            const petTime = new Date(pet.createdAt).getTime();
            const timeDiff = Math.abs(petTime - videoTime);
            if (timeDiff < smallestTimeDiff) {
              smallestTimeDiff = timeDiff;
              closestPet = pet;
            }
          }
          petToShow = closestPet;
        }

        setSelectedPet(petToShow);
        setPets(data);
        setStep("details");
      } else {
        Alert.alert("No pets found", "This user hasn't added any pets yet.");
        router.back();
      }
    } catch (error) {
      console.error("Error fetching user pets:", error);
      Alert.alert("Error", "Failed to load pet details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPet = (pet: Pet) => {
    setSelectedPet(pet);
    setStep("details");
  };

  const handleBack = () => {
    if (fromMyPets === "true") {
      // If coming from My Pets, go back to My Pets
      router.push("/(userTabs)/myPets");
    } else if (fromVideo === "true") {
      // If coming from video, always go back to video feed
      router.back();
    } else if (step === "details" && pets.length > 1) {
      setStep("list");
      setSelectedPet(null);
    } else {
      router.back();
    }
  };

  const PetCard = ({ pet }: { pet: Pet }) => (
    <TouchableOpacity
      onPress={() => handleSelectPet(pet)}
      className="overflow-hidden mb-4 bg-white rounded-2xl"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
      }}
    >
      <View className="p-5">
        <View className="flex-row">
          {/* Pet Image */}
          <View className="mr-4">
            <Image
              source={{
                uri:
                  pet.photoUrl ||
                  "https://via.placeholder.com/100x100/F3F4F6/9CA3AF?text=No+Image",
              }}
              style={{ width: 100, height: 100 }}
              className="bg-gray-100 rounded-xl"
            />
          </View>

          {/* Pet Info */}
          <View className="flex-1 justify-center">
            <Text className="mb-2 text-xl font-bold text-gray-800">
              {pet.name}
            </Text>
            <Text className="mb-1 text-base text-gray-600">{pet.breed}</Text>
            <Text className="mb-1 text-sm text-gray-500">
              {pet.age} years old • {pet.gender}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-500">📍 {pet.location}</Text>
            </View>
          </View>

          {/* Arrow Icon */}
          <View className="justify-center items-center">
            <View
              className="justify-center items-center w-12 h-12 rounded-full"
              style={{ backgroundColor: "rgba(255, 114, 0, 0.1)" }}
            >
              <Text className="text-lg" style={{ color: "#FF7200FF" }}>
                →
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const PetDetailsView = ({ pet }: { pet: Pet }) => (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Hero Image */}
      <View className="mb-8">
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

      {/* Updated Contact Button */}
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
              Interested in {pet.name}?
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View className="h-20" />
    </ScrollView>
  );

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
          Loading pet details...
        </Text>
        <Text className="mt-1 text-sm text-gray-500">Please wait a moment</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-orange-50 to-white">
      <View className="flex-1 mb-28">
        {/* Professional Header */}
        <View className="px-6 pt-8 pb-6">
          <View className="flex-row items-center mb-2">
            <TouchableOpacity
              onPress={handleBack}
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
                {step === "details" ? selectedPet?.name : "Pet Selection"}
              </Text>
              {step === "list" && (
                <Text className="mt-1 text-sm text-gray-500">
                  {pets.length} pet{pets.length !== 1 ? "s" : ""} available
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 px-4">
          {step === "list" ? (
            // Pet Selection List
            <>
              {pets.length > 0 && (
                <View className="mb-6">
                  <Text className="mb-2 text-lg font-bold text-gray-800">
                    Choose a pet to learn more
                  </Text>
                  <Text className="text-gray-600">
                    Tap on any pet to view detailed information
                  </Text>
                </View>
              )}

              <ScrollView showsVerticalScrollIndicator={false}>
                {pets.map((pet) => (
                  <PetCard key={pet.id} pet={pet} />
                ))}
              </ScrollView>
            </>
          ) : (
            // Pet Details View
            selectedPet && <PetDetailsView pet={selectedPet} />
          )}

          {/* Empty State */}
          {pets.length === 0 && step === "list" && (
            <View className="flex-1 justify-center items-center">
              <View
                className="justify-center items-center mb-4 w-20 h-20 rounded-full"
                style={{ backgroundColor: "rgba(255, 114, 0, 0.1)" }}
              >
                <Text className="text-3xl">🐾</Text>
              </View>
              <Text className="mb-2 text-xl font-bold text-gray-800">
                No pets available
              </Text>
              <Text className="px-8 text-center text-gray-500">
                This user hasnt added any pets yet. Check back later for new
                additions!
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
