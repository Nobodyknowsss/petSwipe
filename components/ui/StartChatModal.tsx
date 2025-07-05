"use client";

import { MessageCircle, Search, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../app/provider/AuthProvider";
import { supabase } from "../../utils/supabase";

interface SearchUser {
  id: string;
  username: string;
  verified: boolean;
  is_seller: boolean;
}

interface StartChatModalProps {
  visible: boolean;
  onClose: () => void;
  onUserSelect: (userId: string, username: string) => void;
}

export default function StartChatModal({
  visible,
  onClose,
  onUserSelect,
}: StartChatModalProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchTimeoutRef = useRef<number | null>(null);

  // Real-time search as user types
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(() => {
        searchUsers(searchQuery.trim());
      }, 300);
      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
      };
    } else {
      setSearchResults([]);
      setHasSearched(false);
    }
  }, [searchQuery]);

  const searchUsers = async (query: string) => {
    if (!query || !user) return;

    try {
      setLoading(true);
      setHasSearched(true);
      const { data, error } = await supabase
        .from("User")
        .select("id, username, verified, is_seller")
        .ilike("username", `%${query}%`)
        .neq("id", user.id) // Exclude current user
        .limit(20);

      if (error) {
        console.error("Error searching users:", error);
        Alert.alert("Error", "Failed to search users");
        return;
      }

      setSearchResults(data || []);
    } catch (error) {
      console.error("Error searching users:", error);
      Alert.alert("Error", "Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (selectedUser: SearchUser) => {
    try {
      console.log("Selected user:", selectedUser);
      onUserSelect(selectedUser.id, selectedUser.username);
      setSearchQuery("");
      setSearchResults([]);
      setHasSearched(false);
      onClose();
    } catch (error) {
      console.error("Error selecting user:", error);
      Alert.alert("Error", "Failed to start chat");
    }
  };

  const getUserBadge = (searchUser: SearchUser) => {
    if (searchUser.verified) return "✓";
    if (searchUser.is_seller) return "🏪";
    return null;
  };

  const getUserBadgeColor = (searchUser: SearchUser) => {
    if (searchUser.verified) return "#007AFF";
    if (searchUser.is_seller) return "#34C759";
    return "#8E8E93";
  };

  const renderUserItem = ({ item }: { item: SearchUser }) => (
    <TouchableOpacity
      className="overflow-hidden mx-4 mb-3 bg-white rounded-2xl active:opacity-70"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
      }}
      onPress={() => handleUserSelect(item)}
    >
      <View className="flex-row items-center p-4">
        {/* Enhanced Avatar */}
        <View className="relative">
          <View
            className="justify-center items-center w-14 h-14 rounded-full"
            style={{
              backgroundColor: "#007AFF",
              shadowColor: "#007AFF",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-lg font-bold text-white">
              {item.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          {/* Enhanced Badge */}
          {getUserBadge(item) && (
            <View
              className="absolute -top-1 -right-1 justify-center items-center w-6 h-6 rounded-full border-2 border-white"
              style={{
                backgroundColor: getUserBadgeColor(item),
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text className="text-xs font-bold text-white">
                {getUserBadge(item)}
              </Text>
            </View>
          )}
        </View>

        {/* Enhanced User Info */}
        <View className="flex-1 ml-4">
          <View className="flex-row items-center mb-1">
            <Text className="text-lg font-bold text-gray-900">
              @{item.username}
            </Text>
            {item.verified && (
              <View className="px-2 py-1 ml-2 bg-blue-50 rounded-full">
                <Text className="text-xs font-semibold text-blue-600">
                  Verified
                </Text>
              </View>
            )}
            {item.is_seller && (
              <View className="px-2 py-1 ml-2 bg-green-50 rounded-full">
                <Text className="text-xs font-semibold text-green-600">
                  Business
                </Text>
              </View>
            )}
          </View>
          <Text className="text-sm text-gray-500">
            Tap to start a conversation
          </Text>
        </View>

        {/* Enhanced Message Icon */}
        <View
          className="justify-center items-center w-10 h-10 rounded-full"
          style={{ backgroundColor: "rgba(0, 122, 255, 0.1)" }}
        >
          <MessageCircle size={20} color="#007AFF" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1" style={{ backgroundColor: "#F8F9FA" }}>
        {/* Enhanced Header */}
        <View
          className="flex-row justify-between items-center px-6 py-4 bg-white"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={onClose}
              className="justify-center items-center mr-4 w-10 h-10 rounded-full"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
            >
              <X size={20} color="#374151" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                Find People
              </Text>
              <Text className="text-sm text-gray-500">
                Start new conversations
              </Text>
            </View>
          </View>
        </View>

        {/* Enhanced Search Input */}
        <View className="px-6 py-4">
          <View
            className="flex-row items-center px-4 py-3 bg-white rounded-2xl"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View
              className="justify-center items-center mr-3 w-8 h-8 rounded-full"
              style={{ backgroundColor: "rgba(0, 122, 255, 0.1)" }}
            >
              <Search size={18} color="#007AFF" />
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by username"
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-base text-gray-900"
              returnKeyType="search"
              autoFocus
              style={{ fontSize: 16 }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                className="justify-center items-center ml-2 w-8 h-8 rounded-full"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
              >
                <X size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          {searchQuery.length > 0 && (
            <Text className="mt-2 ml-4 text-xs text-gray-500">
              Searching for "{searchQuery}"... {searchResults.length} result
              {searchResults.length !== 1 ? "s" : ""} found
            </Text>
          )}
        </View>

        {/* Enhanced Search Results */}
        <View className="flex-1 pb-20">
          {loading && searchQuery.length > 0 ? (
            <View className="flex-1 justify-center items-center">
              <View
                className="justify-center items-center mb-4 w-20 h-20 rounded-full"
                style={{ backgroundColor: "rgba(0, 122, 255, 0.1)" }}
              >
                <ActivityIndicator size="large" color="#007AFF" />
              </View>
              <Text className="mb-2 text-lg font-semibold text-gray-900">
                Searching...
              </Text>
              <Text className="text-gray-500">Finding people for you</Text>
            </View>
          ) : hasSearched && searchResults.length === 0 ? (
            <View className="flex-1 justify-center items-center px-8">
              <View
                className="justify-center items-center mb-6 w-24 h-24 rounded-full"
                style={{ backgroundColor: "rgba(142, 142, 147, 0.1)" }}
              >
                <Search size={32} color="#8E8E93" />
              </View>
              <Text className="mb-3 text-2xl font-bold text-center text-gray-900">
                No results found
              </Text>
              <Text className="mb-6 leading-6 text-center text-gray-500">
                We couldnt find anyone with the username {searchQuery}. Try
                searching for a different username or check the spelling.
              </Text>
              <TouchableOpacity
                onPress={clearSearch}
                className="px-6 py-3 rounded-2xl"
                style={{ backgroundColor: "#007AFF" }}
              >
                <Text className="font-semibold text-white">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
            />
          ) : (
            <View className="flex-1 justify-center items-center px-8">
              <View
                className="justify-center items-center mb-6 w-28 h-28 rounded-full"
                style={{
                  backgroundColor: "rgba(0, 122, 255, 0.1)",
                  shadowColor: "#007AFF",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.1,
                  shadowRadius: 16,
                  elevation: 4,
                }}
              >
                <MessageCircle size={40} color="#007AFF" />
              </View>
              <Text className="mb-3 text-2xl font-bold text-center text-gray-900">
                Find people to chat with
              </Text>
              <Text className="mb-8 leading-6 text-center text-gray-500">
                Search for people by their username to start messaging with
                them. Connect with pet lovers, sellers, and adopters in your
                community.
              </Text>
              <View className="p-4 w-full bg-white rounded-2xl">
                <Text className="mb-2 text-sm font-semibold text-gray-700">
                  💡 Search Tips:
                </Text>
                <Text className="text-sm leading-5 text-gray-600">
                  • Use @ symbol (e.g., @username){"\n"}• Try partial names
                  {"\n"}• Check verified and business accounts
                </Text>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
