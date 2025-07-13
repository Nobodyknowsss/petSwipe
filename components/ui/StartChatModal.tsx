"use client";

import { X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
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
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setSearchQuery("");
      setUsers([]);
    }
  }, [visible]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery.trim());
      } else {
        setUsers([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const searchUsers = async (query: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("User")
        .select("id, username, verified, is_seller")
        .ilike("username", `%${query}%`)
        .neq("id", user.id)
        .limit(10);

      if (error) {
        console.error("Error searching users:", error);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (selectedUser: SearchUser) => {
    onUserSelect(selectedUser.id, selectedUser.username);
    onClose();
  };

  const getUserBadge = (searchUser: SearchUser) => {
    if (searchUser.verified) return "✓ Verified";
    if (searchUser.is_seller) return "🏪 Store";
    return "";
  };

  const renderUser = ({ item }: { item: SearchUser }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 bg-white border-b border-gray-200 active:bg-gray-100"
      onPress={() => handleUserSelect(item)}
    >
      <View className="justify-center items-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
        <Text className="text-lg font-bold text-white">
          {item.username.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-lg font-semibold text-gray-900">
          {item.username}
        </Text>
        <Text className="text-sm text-gray-600">{getUserBadge(item)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="px-6 py-4 bg-white border-b border-gray-300">
          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-bold text-gray-900">Find People</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Input */}
        <View className="px-6 py-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center px-4 py-3 bg-gray-100 rounded-full">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search usernames..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-lg text-gray-900"
              autoFocus
            />
          </View>
        </View>

        {/* User List */}
        <View className="flex-1 bg-white">
          {loading ? (
            <View className="justify-center items-center py-12">
              <Text className="text-lg text-gray-600">Searching...</Text>
            </View>
          ) : (
            <FlatList
              data={users}
              renderItem={renderUser}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View className="justify-center items-center py-20">
                  <Text className="text-lg text-center text-gray-600">
                    {searchQuery
                      ? "No users found"
                      : "Start typing to search for people"}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
