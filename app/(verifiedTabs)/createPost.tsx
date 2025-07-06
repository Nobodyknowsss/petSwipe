"use client";

import { router } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
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

export default function CreatePost() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Select Pet, Step 2: Preview & Confirm

  // Video player for the selected pet
  const videoPlayer = useVideoPlayer(selectedPet?.videoUrl || "", (player) => {
    player.loop = false;
  });

  const fetchPets = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Error", "You must be logged in to create a post.");
        return;
      }

      const { data, error } = await supabase
        .from("Pet")
        .select("*")
        .eq("ownerId", user.id)
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Error fetching pets:", error);
        Alert.alert("Error", "Failed to load pets. Please try again.");
        return;
      }

      setPets(data || []);
    } catch (error) {
      console.error("Error fetching pets:", error);
      Alert.alert("Error", "Failed to load pets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  useEffect(() => {
    return () => {
      if (videoPlayer) {
        try {
          videoPlayer.pause();
        } catch (error) {
          console.log("Error pausing video:", error);
        }
      }
    };
  }, [videoPlayer]);

  const handleSelectPet = (pet: Pet) => {
    setSelectedPet(pet);
    setStep(2);
  };

  const handleBackToSelection = () => {
    setStep(1);
    setSelectedPet(null);
  };

  const handleConfirmPost = async () => {
    if (!selectedPet) return;

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Error", "You must be logged in to create a post.");
        return;
      }

      // Save post to Video table
      const { data, error } = await supabase
        .from("Video")
        .insert([
          {
            uri: selectedPet.videoUrl,
            user_id: user.id,
            // pet_id: selectedPet.id, // TODO: Add this after database migration
            description:
              selectedPet.description ||
              `Check out my pet ${selectedPet.name}! ${selectedPet.breed}, ${selectedPet.age} years old from ${selectedPet.location}.`,
          },
        ])
        .select();

      if (error) {
        console.error("Error creating post:", error);
        Alert.alert("Error", "Failed to create post. Please try again.");
        return;
      }

      console.log("Post created successfully:", data);
      Alert.alert(
        "Post Created!",
        `Your post featuring ${selectedPet.name} has been shared with the community!`,
        [
          {
            text: "OK",
            onPress: () => router.push("./managePets"),
          },
        ]
      );
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Failed to create post. Please try again.");
    }
  };

  const PetSelectionCard = ({ pet }: { pet: Pet }) => (
    <TouchableOpacity
      onPress={() => handleSelectPet(pet)}
      className="p-5 mb-4 bg-white rounded-2xl"
      style={{
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
      }}
    >
      <View className="flex-row">
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
        <View className="flex-1 justify-center">
          <Text className="mb-1 text-lg font-bold text-gray-900">
            {pet.name}
          </Text>
          <Text className="mb-1 text-sm text-gray-600">{pet.breed}</Text>
          <Text className="text-sm text-gray-500">
            {pet.age} years old • {pet.gender}
          </Text>
          <Text className="text-sm text-gray-500">📍 {pet.location}</Text>
        </View>
        <View className="justify-center items-center">
          <View
            className="justify-center items-center w-12 h-12 rounded-full"
            style={{ backgroundColor: "rgba(0, 122, 255, 0.1)" }}
          >
            <Text className="text-lg" style={{ color: "#007AFF" }}>
              →
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View className="justify-center items-center py-20">
      <View
        className="justify-center items-center mb-6 w-24 h-24 rounded-full"
        style={{
          backgroundColor: "#F0F8FF",
          borderWidth: 2,
          borderColor: "#E3F2FD",
        }}
      >
        <Text className="text-4xl">🐾</Text>
      </View>
      <Text className="mb-3 text-2xl font-bold text-gray-900">
        No pets available
      </Text>
      <Text className="px-8 mb-8 text-center text-gray-600">
        You need to add pets first before creating a post
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
        onPress={() => router.push("./addPet")}
      >
        <Text className="text-lg font-semibold text-white">
          Add Your First Pet
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Step 1: Pet Selection
  if (step === 1) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 mb-28">
          {/* Enhanced Header */}
          <View
            className="px-6 pt-12 pb-6 bg-white"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center mb-6">
              <TouchableOpacity
                onPress={() => router.push("./managePets")}
                className="justify-center items-center mr-4 w-10 h-10 rounded-full"
                style={{ backgroundColor: "rgba(0, 122, 255, 0.1)" }}
              >
                <Text
                  className="text-xl font-bold"
                  style={{ color: "#007AFF" }}
                >
                  ←
                </Text>
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900">
                  Create Post
                </Text>
                <Text className="text-sm text-gray-500">
                  Share your pet with the community
                </Text>
              </View>
            </View>

            <View className="items-center">
              <View
                className="justify-center items-center mb-4 w-10 h-10 rounded-full"
                style={{
                  backgroundColor: "rgba(0, 122, 255, 0.1)",
                  borderWidth: 2,
                  borderColor: "rgba(0, 122, 255, 0.2)",
                }}
              >
                <Text className="text-xl">📝</Text>
              </View>
              <Text className="mb-2 text-base font-bold text-center text-gray-900">
                Choose Your Pet
              </Text>
              <Text className="text-sm leading-5 text-center text-gray-600">
                Select which pet you would like to feature in your post
              </Text>
            </View>
          </View>

          {/* Content */}
          <View className="flex-1 px-6" style={{ backgroundColor: "#F8F9FA" }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 16 }}
            >
              {loading ? (
                <View className="justify-center items-center py-20">
                  <View
                    className="justify-center items-center mb-4 w-20 h-20 rounded-full"
                    style={{ backgroundColor: "#F0F8FF" }}
                  >
                    <ActivityIndicator size="large" color="#007AFF" />
                  </View>
                  <Text className="text-lg font-semibold text-gray-900">
                    Loading pets...
                  </Text>
                  <Text className="mt-1 text-sm text-gray-500">
                    Please wait a moment
                  </Text>
                </View>
              ) : pets.length > 0 ? (
                <>
                  {pets.map((pet) => (
                    <PetSelectionCard key={pet.id} pet={pet} />
                  ))}
                  <View className="h-20" />
                </>
              ) : (
                <EmptyState />
              )}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Step 2: Preview & Confirm
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 mb-28">
        {/* Enhanced Header */}
        <View
          className="px-6 pt-12 pb-6 bg-white"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={handleBackToSelection}
              className="justify-center items-center mr-4 w-10 h-10 rounded-full"
              style={{ backgroundColor: "rgba(0, 122, 255, 0.1)" }}
            >
              <Text className="text-xl font-bold" style={{ color: "#007AFF" }}>
                ←
              </Text>
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                Preview Post
              </Text>
              <Text className="text-sm text-gray-500">
                Review before sharing
              </Text>
            </View>
          </View>

          <View className="items-center">
            <View
              className="justify-center items-center mb-4 w-16 h-16 rounded-full"
              style={{
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                borderWidth: 2,
                borderColor: "rgba(34, 197, 94, 0.2)",
              }}
            >
              <Text className="text-2xl">👀</Text>
            </View>
            <Text className="mb-2 text-lg font-bold text-center text-gray-900">
              Ready to Share?
            </Text>
            <Text className="leading-5 text-center text-gray-600">
              Review your post before sharing with the community
            </Text>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 px-6" style={{ backgroundColor: "#F8F9FA" }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 16 }}
          >
            {selectedPet && (
              <View
                className="p-6 mb-6 bg-white rounded-3xl"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.1,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                {/* Pet Header */}
                <View className="flex-row items-center mb-6">
                  <Image
                    source={{
                      uri:
                        selectedPet.photoUrl ||
                        "https://via.placeholder.com/60x60/F3F4F6/9CA3AF?text=Pet",
                    }}
                    style={{ width: 60, height: 60 }}
                    className="mr-4 bg-gray-100 rounded-full"
                  />
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-900">
                      {selectedPet.name}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {selectedPet.breed} • {selectedPet.age} years old
                    </Text>
                  </View>
                </View>

                {/* Video Preview */}
                {selectedPet.videoUrl && (
                  <View className="mb-6">
                    <Text className="mb-3 text-base font-semibold text-gray-900">
                      Featured Video
                    </Text>
                    <View className="overflow-hidden rounded-2xl">
                      <VideoView
                        style={{ width: "100%", height: 300 }}
                        player={videoPlayer}
                        allowsFullscreen
                        allowsPictureInPicture
                      />
                    </View>
                  </View>
                )}

                {/* Description */}
                <View className="mb-6">
                  <Text className="mb-3 text-base font-semibold text-gray-900">
                    Description:
                  </Text>
                  <View
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: "#F8F9FA" }}
                  >
                    <Text className="leading-6 text-gray-700">
                      {selectedPet.description || "No description available."}
                    </Text>
                  </View>
                </View>

                {/* Pet Details */}
                <View
                  className="p-4 mb-6 rounded-xl"
                  style={{ backgroundColor: "#F0F8FF" }}
                >
                  <Text className="mb-3 text-base font-semibold text-gray-900">
                    Pet Details
                  </Text>
                  <View className="space-y-2">
                    <View className="flex-row">
                      <Text className="w-20 text-sm font-medium text-gray-600">
                        Gender:
                      </Text>
                      <Text className="text-sm text-gray-900">
                        {selectedPet.gender}
                      </Text>
                    </View>
                    <View className="flex-row">
                      <Text className="w-20 text-sm font-medium text-gray-600">
                        Location:
                      </Text>
                      <Text className="text-sm text-gray-900">
                        {selectedPet.location}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Confirm Button */}
                <TouchableOpacity
                  onPress={handleConfirmPost}
                  className="py-4 rounded-2xl"
                  style={{
                    backgroundColor: "#34C759",
                    shadowColor: "#34C759",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 6,
                  }}
                >
                  <Text className="text-base font-bold text-center text-white">
                    Confirm & Share Post 🚀
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <View className="h-20" />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
