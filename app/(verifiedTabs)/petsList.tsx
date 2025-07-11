"use client";

import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
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
    // Navigate to edit pet screen with pet ID as parameter
    router.push(`./editPet?petId=${petId}`);
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
      className="p-5 mb-4 rounded-2xl bg-slate-200"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
      }}
    >
      <View className="flex-row">
        {/* Pet Image */}
        <View className="mr-4">
          <Image
            source={{
              uri:
                pet.photoUrl ||
                "https://via.placeholder.com/100x100/F3F4F6/9CA3AF?text=No+Image",
            }}
            className="w-24 h-24 rounded-xl"
            style={{ backgroundColor: "#F3F4F6" }}
          />
        </View>

        {/* Pet Info */}
        <View className="flex-1">
          <Text className="mb-1 text-lg font-bold text-gray-900">
            {pet.name}
          </Text>
          <Text className="mb-1 text-sm text-gray-600">{pet.breed}</Text>
          <Text className="text-sm text-gray-500">
            {pet.age} years old • {pet.gender}
          </Text>
          <Text className="mb-1 text-sm text-gray-500">📍{pet.location}</Text>
          {pet.description && (
            <Text className="mt-1 text-xs text-gray-500" numberOfLines={2}>
              {pet.description}
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View className="gap-4 justify-center ml-4 space-y-2">
          <TouchableOpacity
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor: "#007AFF",
              shadowColor: "#007AFF",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => handleEditPet(pet.id)}
          >
            <Text className="text-xs font-semibold text-center text-white">
              EDIT
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor: "#FF3B30",
              shadowColor: "#FF3B30",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => handleDeletePet(pet.id, pet.name)}
          >
            <Text className="text-xs font-semibold text-center text-white">
              DELETE
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
        No pets found
      </Text>
      <Text className="px-8 mb-8 text-center text-gray-600">
        {searchQuery
          ? "Try adjusting your search terms"
          : "Add your first pet to get started"}
      </Text>
      {!searchQuery && (
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
          onPress={handleAddPet}
        >
          <Text className="text-lg font-semibold text-white">
            Add Your First Pet
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 mb-28 bg-white">
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
              <Text className="text-xl font-bold" style={{ color: "#007AFF" }}>
                ←
              </Text>
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">My Pets</Text>
              <Text className="text-sm text-gray-500">
                Manage your pet collection
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 rounded-xl"
              style={{
                backgroundColor: refreshing
                  ? "#F3F4F6"
                  : "rgba(0, 122, 255, 0.1)",
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: refreshing ? "#9CA3AF" : "#007AFF" }}
              >
                {refreshing ? "⟳" : "Refresh"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Enhanced Search Bar */}
          <View className="relative">
            <TextInput
              placeholder="Search pets by name or breed..."
              placeholderTextColor="#9CA3AF"
              className="px-5 py-4 pr-12 w-full text-base text-gray-900 bg-white rounded-2xl border-2 border-gray-100"
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
        </View>
      </View>
    </SafeAreaView>
  );
}
