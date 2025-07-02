"use client";

import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Adopter {
  id: string;
  name: string;
  location: string;
  image: string;
  applicationDate: string;
  petInterested: string;
}

const mockAdopers: Adopter[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    location: "New York, NY",
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=200&q=80",
    applicationDate: "2024-01-15",
    petInterested: "Buddy - Golden Retriever",
  },
  {
    id: "2",
    name: "Michael Chen",
    location: "Los Angeles, CA",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    applicationDate: "2024-01-12",
    petInterested: "Luna - Persian Cat",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    location: "Chicago, IL",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    applicationDate: "2024-01-10",
    petInterested: "Max - German Shepherd",
  },
  {
    id: "4",
    name: "David Thompson",
    location: "Austin, TX",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    applicationDate: "2024-01-08",
    petInterested: "Daisy - Labrador Retriever",
  },
  {
    id: "5",
    name: "Jessica Williams",
    location: "Miami, FL",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    applicationDate: "2024-01-05",
    petInterested: "Rocky - Bulldog",
  },
  {
    id: "6",
    name: "Robert Davis",
    location: "Seattle, WA",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    applicationDate: "2024-01-03",
    petInterested: "Milo - Siberian Husky",
  },
];

export default function AdoptersPage() {
  const [adopters, setAdopters] = useState<Adopter[]>(mockAdopers);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredAdopters = adopters.filter(
    (adopter) =>
      adopter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adopter.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adopter.petInterested.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewApplication = (adopterId: string) => {
    // Navigate to application details screen
    console.log("View application:", adopterId);
  };

  const AdopterCard = ({ adopter }: { adopter: Adopter }) => (
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
        {/* Adopter Image */}
        <View className="mr-4">
          <Image
            source={{ uri: adopter.image }}
            className="w-20 h-20 rounded-full"
            style={{ backgroundColor: "#F3F4F6" }}
          />
        </View>

        {/* Adopter Info */}
        <View className="flex-1">
          <Text className="mb-2 text-lg font-bold text-gray-800">
            {adopter.name}
          </Text>
          <Text className="mb-1 text-sm text-gray-600">
            📍 {adopter.location}
          </Text>
          <Text className="mb-1 text-sm text-gray-500">
            Interested in:{" "}
            <Text className="font-semibold">{adopter.petInterested}</Text>
          </Text>
          <Text className="text-xs text-gray-400">
            Applied: {adopter.applicationDate}
          </Text>
        </View>

        {/* Action Button */}
        <View className="justify-center">
          <TouchableOpacity
            className="px-4 py-3 rounded-xl"
            style={{ backgroundColor: "#FF7200FF" }}
            onPress={() => handleViewApplication(adopter.id)}
          >
            <Text className="text-xs font-bold text-center text-white">
              VIEW{"\n"}APPLICATION
            </Text>
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
        <Text className="text-3xl">👥</Text>
      </View>
      <Text className="mb-2 text-xl font-bold text-gray-800">
        No adopters found
      </Text>
      <Text className="mb-6 text-center text-gray-600">
        {searchQuery
          ? "Try adjusting your search terms"
          : "No adoption applications have been submitted yet"}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 mb-28 bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <View className="px-6 pt-12 pb-6">
        <Text className="mb-6 text-2xl font-bold text-center text-gray-800">
          Pawsible Partners
        </Text>

        {/* Search Bar */}
        <View className="relative">
          <TextInput
            placeholder="Search by name, location, or pet interest..."
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
            {filteredAdopters.length} adopter
            {filteredAdopters.length !== 1 ? "s" : ""} found
          </Text>
        )}
      </View>

      {/* Adopters List */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="justify-center items-center py-16">
            <ActivityIndicator size="large" color="#FF7200FF" />
            <Text className="mt-4 text-gray-600">Loading adopters...</Text>
          </View>
        ) : filteredAdopters.length > 0 ? (
          <>
            {filteredAdopters.map((adopter) => (
              <AdopterCard key={adopter.id} adopter={adopter} />
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
