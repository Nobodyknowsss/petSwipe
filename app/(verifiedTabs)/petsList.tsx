"use client";

import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
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

export default function PetsList() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch pets from Supabase
  const fetchPets = async () => {
    try {
      setLoading(true);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Error", "You must be logged in to view your pets.");
        return;
      }

      // Fetch pets for the current user
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
      setRefreshing(false);
    }
  };

  // Load pets when component mounts
  useEffect(() => {
    fetchPets();
  }, []);

  const filteredPets = pets.filter(
    (pet) =>
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPet = () => {
    router.push("./addPet");
  };

  const handleEditPet = (petId: string) => {
    // Navigate to edit pet screen
    console.log("Edit pet:", petId);
  };

  const handleDeletePet = async (petId: string, petName: string) => {
    Alert.alert(
      "Delete Pet",
      `Are you sure you want to delete ${petName}? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("Pet")
                .delete()
                .eq("id", petId);

              if (error) {
                console.error("Error deleting pet:", error);
                Alert.alert("Error", "Failed to delete pet. Please try again.");
                return;
              }

              // Remove from local state
              setPets(pets.filter((pet) => pet.id !== petId));
              Alert.alert("Success", `${petName} has been deleted.`);
            } catch (error) {
              console.error("Error deleting pet:", error);
              Alert.alert("Error", "Failed to delete pet. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPets();
  };

  const PetCard = ({ pet }: { pet: Pet }) => (
    <View
      className="p-4 mb-4 bg-white rounded-2xl"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="flex-row">
        {/* Pet Image */}
        <View className="mr-4">
          <Image
            source={{
              uri:
                pet.photoUrl ||
                "https://via.placeholder.com/160x160/F3F4F6/9CA3AF?text=No+Image",
            }}
            className="w-40 h-40 rounded-xl"
            style={{ backgroundColor: "#F3F4F6" }}
          />
        </View>

        {/* Pet Info */}
        <View className="flex-1">
          <Text className="mb-1 text-lg font-bold text-gray-800">
            {pet.name}
          </Text>
          <Text className="mb-1 text-sm text-gray-600">{pet.breed}</Text>
          <Text className="text-sm text-gray-500">{pet.age} years old</Text>
          <Text className="text-sm text-gray-500">{pet.gender}</Text>
          <Text className="text-sm text-gray-500">{pet.location}</Text>
          {pet.description && (
            <Text className="mt-1 text-xs text-gray-500" numberOfLines={2}>
              {pet.description}
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View className="justify-center space-y-2">
          <TouchableOpacity
            className="px-3 py-3 rounded-lg"
            style={{ backgroundColor: "rgba(255, 114, 0, 0.1)" }}
            onPress={() => handleEditPet(pet.id)}
          >
            <Text
              className="text-xs font-bold text-center"
              style={{ color: "#FF7200FF" }}
            >
              EDIT
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="px-3 py-3 mt-4 bg-red-50 rounded-lg"
            onPress={() => handleDeletePet(pet.id, pet.name)}
          >
            <Text className="text-xs font-semibold text-red-600">DELETE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const EmptyState = () => (
    <View className="justify-center items-center py-16">
      <View
        className="justify-center items-center mb-4 w-20 h-20 rounded-full"
        style={{ backgroundColor: "rgba(255, 114, 0, 0.1)" }}
      >
        <Text className="text-3xl">🐾</Text>
      </View>
      <Text className="mb-2 text-xl font-bold text-gray-800">
        No pets found
      </Text>
      <Text className="mb-6 text-center text-gray-600">
        {searchQuery
          ? "Try adjusting your search terms"
          : "Add your first pet to get started"}
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          className="px-6 py-3 rounded-xl"
          style={{ backgroundColor: "#FF7200FF" }}
          onPress={handleAddPet}
        >
          <Text className="font-semibold text-white">Add Your First Pet</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <View className="px-6 pt-12 pb-6">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => router.push("./managePets")}
            className="mr-4"
          >
            <Text className="text-2xl font-bold text-gray-800">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">My Pets</Text>
          <TouchableOpacity
            onPress={handleRefresh}
            className="ml-auto"
            disabled={refreshing}
          >
            <Text className="text-sm font-medium text-orange-500">
              {refreshing ? "⟳" : "Refresh"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="relative">
          <TextInput
            placeholder="Search pets by name or breed..."
            placeholderTextColor="#9CA3AF"
            className="px-5 py-4 pr-12 w-full text-base text-gray-800 bg-white rounded-2xl border-2 border-gray-100"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View className="absolute top-4 right-4">
            <Text className="text-lg text-gray-400">🔍</Text>
          </View>
        </View>

        {/* Results Counter */}
        {searchQuery && (
          <Text className="mt-3 text-sm text-gray-600">
            {filteredPets.length} pet{filteredPets.length !== 1 ? "s" : ""}{" "}
            found
          </Text>
        )}
      </View>

      {/* Pet List */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="justify-center items-center py-16">
            <ActivityIndicator size="large" color="#FF7200FF" />
            <Text className="mt-4 text-gray-600">Loading pets...</Text>
          </View>
        ) : filteredPets.length > 0 ? (
          <>
            {filteredPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
            <View className="h-20" />
          </>
        ) : (
          <EmptyState />
        )}
      </ScrollView>

      {/* Floating Add Button */}
      {pets.length > 0 && (
        <TouchableOpacity
          className="absolute right-6 bottom-40 justify-center items-center w-16 h-16 rounded-full shadow-lg"
          style={{
            backgroundColor: "#FF7200FF",
            shadowColor: "#FF7200FF",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
          onPress={handleAddPet}
        >
          <Text className="text-4xl font-bold text-white">+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
