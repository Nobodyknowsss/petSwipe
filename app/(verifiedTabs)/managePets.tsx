"use client";

import { useState } from "react";
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

interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  image: string;
  description?: string;
}

const mockPets: Pet[] = [
  {
    id: "1",
    name: "Buddy",
    breed: "Golden Retriever",
    age: 3,
    image:
      "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=200&q=80",
    description: "Friendly and energetic dog",
  },
  {
    id: "2",
    name: "Luna",
    breed: "Persian Cat",
    age: 2,
    image:
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=200&q=80",
    description: "Calm and affectionate cat",
  },
  {
    id: "3",
    name: "Max",
    breed: "German Shepherd",
    age: 5,
    image:
      "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=200&q=80",
    description: "Loyal and protective companion",
  },
  {
    id: "4",
    name: "Daisy",
    breed: "Labrador Retriever",
    age: 4,
    image:
      "https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=200&q=80",
    description: "Loves to play and swim",
  },
  {
    id: "5",
    name: "Rocky",
    breed: "Bulldog",
    age: 6,
    image:
      "https://unsplash.com/photos/adult-english-bulldog-sleeping-on-white-textile-5oI6qQLrSaE",
    description: "Strong and cuddly buddy",
  },
  {
    id: "6",
    name: "Milo",
    breed: "Siberian Husky",
    age: 8,
    image:
      "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=200&q=80",
    description: "Energetic and playful pup",
  },
  {
    id: "7",
    name: "Nala",
    breed: "British Shorthair",
    age: 3,
    image:
      "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=200&q=80",
    description: "Chill and cuddly cat",
  },
];

export default function ManagePet() {
  const [pets, setPets] = useState<Pet[]>(mockPets);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredPets = pets.filter(
    (pet) =>
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPet = () => {
    console.log("Add new pet");
  };

  const handleEditPet = (petId: string) => {
    // Navigate to edit pet screen
    console.log("Edit pet:", petId);
  };

  const handleDeletePet = (petId: string, petName: string) => {
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
          onPress: () => {
            setPets(pets.filter((pet) => pet.id !== petId));
          },
        },
      ]
    );
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
            source={{ uri: pet.image }}
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
            className="px-3 py-3 mt-4 rounded-lg bg-red-50"
            onPress={() => handleDeletePet(pet.id, pet.name)}
          >
            <Text className="text-xs font-semibold text-red-600">DELETE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const EmptyState = () => (
    <View className="items-center justify-center py-16">
      <View
        className="items-center justify-center w-20 h-20 mb-4 rounded-full"
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
        <Text className="mb-6 text-2xl font-bold text-center text-gray-800">
          Manage Pets
        </Text>

        {/* Search Bar */}
        <View className="relative">
          <TextInput
            placeholder="Search pets by name or breed..."
            placeholderTextColor="#9CA3AF"
            className="w-full px-5 py-4 pr-12 text-base text-gray-800 bg-white border-2 border-gray-100 rounded-2xl"
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
          <View className="items-center justify-center py-16">
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
          className="absolute items-center justify-center w-16 h-16 rounded-full shadow-lg right-6 bottom-40"
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
