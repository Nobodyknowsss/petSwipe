"use client";

import { router } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
    player.play = false;
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

  const handleConfirmPost = () => {
    if (!selectedPet) return;

    Alert.alert(
      "Post Created!",
      `Your post featuring ${selectedPet.name} will be shared with the community!`,
      [
        {
          text: "OK",
          onPress: () => router.push("./managePets"),
        },
      ]
    );
  };

  const PetSelectionCard = ({ pet }: { pet: Pet }) => (
    <TouchableOpacity
      onPress={() => handleSelectPet(pet)}
      className="p-4 mb-4 bg-white rounded-2xl"
      style={{
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <View className="flex-row">
        <View className="mr-4">
          <Image
            source={{
              uri:
                pet.photoUrl ||
                "https://via.placeholder.com/120x120/F3F4F6/9CA3AF?text=No+Image",
            }}
            style={{ width: 120, height: 120 }}
            className="bg-gray-100 rounded-xl"
          />
        </View>
        <View className="flex-1 justify-center">
          <Text className="mb-1 text-lg font-bold text-gray-800">
            {pet.name}
          </Text>
          <Text className="mb-1 text-sm text-gray-600">{pet.breed}</Text>
          <Text className="text-sm text-gray-500">
            {pet.age} years old • {pet.gender}
          </Text>
          <Text className="text-sm text-gray-500">{pet.location}</Text>
        </View>
        <View className="justify-center items-center">
          <View
            className="justify-center items-center w-12 h-12 rounded-full"
            style={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
          >
            <Text className="text-lg">→</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View className="justify-center items-center py-16">
      <View
        className="justify-center items-center mb-4 w-20 h-20 rounded-full"
        style={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
      >
        <Text className="text-3xl">🐾</Text>
      </View>
      <Text className="mb-2 text-xl font-bold text-gray-800">
        No pets available
      </Text>
      <Text className="px-8 mb-6 text-center text-gray-600">
        You need to add pets first before creating a post
      </Text>
      <TouchableOpacity
        className="px-6 py-3 rounded-xl"
        style={{ backgroundColor: "#8B5CF6" }}
        onPress={() => router.push("./addPet")}
      >
        <Text className="font-semibold text-white">Add Your First Pet</Text>
      </TouchableOpacity>
    </View>
  );

  // Step 1: Pet Selection
  if (step === 1) {
    return (
      <View className="flex-1 mb-28 bg-gradient-to-b from-purple-50 to-white">
        {/* Header */}
        <View className="px-6 pt-8 pb-4">
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => router.push("./managePets")}
              className="mr-4"
            >
              <Text className="text-2xl font-bold text-gray-800">←</Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-800">
              Create Post
            </Text>
          </View>

          <View className="items-center mb-6">
            <View
              className="justify-center items-center mb-4 w-16 h-16 rounded-full"
              style={{ backgroundColor: "rgba(139, 92, 246, 0.15)" }}
            >
              <Text className="text-2xl">📝</Text>
            </View>
            <Text className="mb-2 text-lg font-bold text-center text-gray-800">
              Choose Your Pet
            </Text>
            <Text className="px-4 text-center text-gray-600">
              Select which pet you would like to feature in your post
            </Text>
          </View>
        </View>

        {/* Pet List */}
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View className="justify-center items-center py-16">
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text className="mt-4 text-gray-600">Loading pets...</Text>
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
    );
  }

  // Step 2: Preview & Confirm
  return (
    <View className="flex-1 mb-28 bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <View className="px-6 pt-8 pb-4">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={handleBackToSelection} className="mr-4">
            <Text className="text-2xl font-bold text-gray-800">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">Preview Post</Text>
        </View>

        <View className="items-center mb-6">
          <View
            className="justify-center items-center mb-4 w-16 h-16 rounded-full"
            style={{ backgroundColor: "rgba(139, 92, 246, 0.15)" }}
          >
            <Text className="text-2xl">👀</Text>
          </View>
          <Text className="mb-2 text-lg font-bold text-center text-gray-800">
            Ready to Share?
          </Text>
          <Text className="px-4 text-center text-gray-600">
            Review your post before sharing with the community
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {selectedPet && (
          <View
            className="p-6 mb-6 bg-white rounded-3xl"
            style={{
              shadowColor: "#8B5CF6",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
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
                <Text className="text-xl font-bold text-gray-800">
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
                <Text className="mb-3 text-base font-semibold text-gray-800">
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
              <Text className="mb-3 text-base font-semibold text-gray-800">
                Description
              </Text>
              <View
                className="p-4 rounded-xl"
                style={{ backgroundColor: "#F9FAFB" }}
              >
                <Text className="leading-6 text-gray-700">
                  {selectedPet.description || "No description available."}
                </Text>
              </View>
            </View>

            {/* Pet Details */}
            <View className="p-4 mb-6 bg-purple-50 rounded-xl">
              <Text className="mb-3 text-base font-semibold text-gray-800">
                Pet Details
              </Text>
              <View className="space-y-2">
                <View className="flex-row">
                  <Text className="w-20 text-sm font-medium text-gray-600">
                    Gender:
                  </Text>
                  <Text className="text-sm text-gray-800">
                    {selectedPet.gender}
                  </Text>
                </View>
                <View className="flex-row">
                  <Text className="w-20 text-sm font-medium text-gray-600">
                    Location:
                  </Text>
                  <Text className="text-sm text-gray-800">
                    {selectedPet.location}
                  </Text>
                </View>
              </View>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              onPress={handleConfirmPost}
              className="py-4 rounded-2xl"
              style={{ backgroundColor: "#8B5CF6" }}
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
  );
}
