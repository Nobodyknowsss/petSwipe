"use client";

import { Search } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ChatConversation from "./ChatConversation";
import ChatList from "./ChatList";
import StartChatModal from "./StartChatModal";

type ViewState = "list" | "conversation";

interface ConversationData {
  userId: string;
  username: string;
}

export default function MessageScreen() {
  const [viewState, setViewState] = useState<ViewState>("list");
  const [currentConversation, setCurrentConversation] =
    useState<ConversationData | null>(null);
  const [showStartChatModal, setShowStartChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleChatSelect = (userId: string, username: string) => {
    try {
      setCurrentConversation({ userId, username });
      setViewState("conversation");
    } catch (error) {
      console.error("Error selecting chat:", error);
      Alert.alert("Error", "Failed to open chat");
    }
  };

  const handleBackToList = () => {
    try {
      setViewState("list");
      setCurrentConversation(null);
    } catch (error) {
      console.error("Error going back to list:", error);
    }
  };

  const handleStartNewChat = (userId: string, username: string) => {
    try {
      if (!userId || !username) {
        throw new Error("Invalid user data");
      }

      setCurrentConversation({ userId, username });
      setViewState("conversation");
      setShowStartChatModal(false);
    } catch (error) {
      console.error("Error starting new chat:", error);
      Alert.alert("Error", "Failed to start chat. Please try again.");
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  if (viewState === "conversation" && currentConversation) {
    return (
      <ChatConversation
        otherUserId={currentConversation.userId}
        otherUsername={currentConversation.username}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-white" style={{ paddingBottom: 50 }}>
        {/* Header */}
        <View className="px-4 py-3 bg-white border-b border-gray-300 shadow-sm">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Text className="text-2xl font-bold text-gray-900">Chats</Text>
            </View>

            {/* New Chat Button */}
            <TouchableOpacity
              onPress={() => setShowStartChatModal(true)}
              className="justify-center items-center w-10 h-10 bg-blue-500 rounded-full shadow-sm"
            >
              <Search size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat List with Search */}
        <ChatList
          onChatSelect={handleChatSelect}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />

        {/* Start New Chat Modal */}
        <StartChatModal
          visible={showStartChatModal}
          onClose={() => setShowStartChatModal(false)}
          onUserSelect={handleStartNewChat}
        />
      </View>
    </SafeAreaView>
  );
}
