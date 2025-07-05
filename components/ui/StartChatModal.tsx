import { MessageCircle, Search, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
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
    if (searchUser.is_seller) return "Store";
    return null;
  };

  const getUserBadgeColor = (searchUser: SearchUser) => {
    if (searchUser.verified) return "bg-blue-500";
    if (searchUser.is_seller) return "bg-green-500";
    return "bg-gray-500";
  };

  const renderUserItem = ({ item }: { item: SearchUser }) => (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3 active:bg-gray-50"
      onPress={() => handleUserSelect(item)}
    >
      {/* Avatar */}
      <View className="relative">
        <View className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 items-center justify-center shadow-sm">
          <Text className="text-white font-bold text-base">
            {item.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        {/* Badge */}
        {getUserBadge(item) && (
          <View
            className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${getUserBadgeColor(item)} items-center justify-center border-2 border-white`}
          >
            <Text className="text-white text-xs font-bold">
              {getUserBadge(item)}
            </Text>
          </View>
        )}
      </View>

      {/* User info */}
      <View className="flex-1 ml-3">
        <View className="flex-row items-center">
          <Text className="font-semibold text-gray-900 text-base">
            {item.username}
          </Text>
          {item.verified && (
            <Text className="ml-2 text-blue-500 font-medium text-sm">
              Verified
            </Text>
          )}
          {item.is_seller && (
            <Text className="ml-2 text-green-600 font-medium text-sm">
              Business
            </Text>
          )}
        </View>
        <Text className="text-gray-500 text-sm mt-0.5">
          Tap to start conversation
        </Text>
      </View>

      <MessageCircle size={20} color="#0084FF" />
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
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={onClose} className="mr-4">
              <X size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Find People</Text>
          </View>
        </View>

        {/* Search Input */}
        <View className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <View className="flex-row items-center bg-white rounded-full border border-gray-200 px-4 py-2">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search people..."
              className="flex-1 ml-3 text-base"
              returnKeyType="search"
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} className="ml-2">
                <X size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results */}
        <View className="flex-1 bg-white pb-20">
          {loading && searchQuery.length > 0 ? (
            <View className="flex-row items-center justify-center py-8">
              <ActivityIndicator size="small" color="#0084FF" />
              <Text className="ml-2 text-gray-600">Searching...</Text>
            </View>
          ) : hasSearched && searchResults.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20">
              <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                <Search size={24} color="#9CA3AF" />
              </View>
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                No results found
              </Text>
              <Text className="text-gray-500 text-center px-8">
                Try searching for a different username
              </Text>
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => (
                <View className="mx-4 h-px bg-gray-100" />
              )}
            />
          ) : (
            <View className="flex-1 justify-center items-center">
              <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
                <MessageCircle size={32} color="#9CA3AF" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 mb-2">
                Find people to chat with
              </Text>
              <Text className="text-gray-500 text-center px-8 leading-5">
                Search for people to start messaging with them
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
