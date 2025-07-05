import { MessageCircle } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../app/provider/AuthProvider";
import { supabase } from "../../utils/supabase";

interface ChatPreview {
  id: string;
  otherUser: {
    id: string;
    username: string;
  };
  lastMessage: {
    text: string;
    createdAt: string;
    isFromCurrentUser: boolean;
  };
  unreadCount: number;
}

interface ChatListProps {
  onChatSelect: (userId: string, username: string) => void;
}

export default function ChatList({ onChatSelect }: ChatListProps) {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchChats();
      subscribeToNewMessages();
    }
  }, [user]);

  const fetchChats = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get all chats where current user is either sender or receiver
      const { data: chatData, error } = await supabase
        .from("Chat")
        .select("id, user_id, chat_user_id, text, createdAt")
        .or(`user_id.eq.${user.id},chat_user_id.eq.${user.id}`)
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Error fetching chats:", error);
        return;
      }

      // Group chats by conversation (unique user pairs)
      const chatMap = new Map<string, ChatPreview>();
      const userIds = new Set<string>();

      chatData?.forEach((chat: any) => {
        const isFromCurrentUser = chat.user_id === user.id;
        const otherUserId = isFromCurrentUser
          ? chat.chat_user_id
          : chat.user_id;

        userIds.add(otherUserId);

        // Create a unique key for this conversation
        const conversationKey = [user.id, otherUserId].sort().join("-");

        if (!chatMap.has(conversationKey)) {
          chatMap.set(conversationKey, {
            id: conversationKey,
            otherUser: {
              id: otherUserId,
              username: "Loading...",
            },
            lastMessage: {
              text: chat.text,
              createdAt: chat.createdAt,
              isFromCurrentUser,
            },
            unreadCount: 0,
          });
        } else {
          // Update if this message is newer
          const existing = chatMap.get(conversationKey)!;
          if (
            new Date(chat.createdAt) > new Date(existing.lastMessage.createdAt)
          ) {
            existing.lastMessage = {
              text: chat.text,
              createdAt: chat.createdAt,
              isFromCurrentUser,
            };
          }
        }
      });

      // Fetch user details for all unique user IDs
      if (userIds.size > 0) {
        const { data: userData, error: userError } = await supabase
          .from("User")
          .select("id, username")
          .in("id", Array.from(userIds));

        if (userError) {
          console.error("Error fetching user data:", userError);
        } else {
          // Update chat previews with user information
          chatMap.forEach((chat, key) => {
            const userInfo = userData?.find((u) => u.id === chat.otherUser.id);
            if (userInfo) {
              chat.otherUser.username = userInfo.username;
            }
          });
        }
      }

      setChats(Array.from(chatMap.values()));
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const subscribeToNewMessages = () => {
    if (!user) return;

    const channel = supabase
      .channel("chat_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Chat",
          filter: `chat_user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("New message received:", payload);
          fetchChats(); // Refresh the chat list
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Chat",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("New message sent:", payload);
          fetchChats(); // Refresh the chat list
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return "now";
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchChats();
  };

  const renderChatItem = ({ item }: { item: ChatPreview }) => (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3 bg-white active:bg-gray-50"
      onPress={() => onChatSelect(item.otherUser.id, item.otherUser.username)}
    >
      {/* Avatar */}
      <View className="relative">
        <View className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 items-center justify-center shadow-sm">
          <Text className="text-white font-bold text-lg">
            {item.otherUser.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        {/* Online indicator */}
        <View className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
      </View>

      {/* Chat content */}
      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="font-semibold text-gray-900 text-base">
            {item.otherUser.username}
          </Text>
          <Text className="text-xs text-gray-500">
            {formatTime(item.lastMessage.createdAt)}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Text
            className={`flex-1 text-sm ${
              item.unreadCount > 0
                ? "text-gray-900 font-medium"
                : "text-gray-600"
            }`}
            numberOfLines={1}
          >
            {item.lastMessage.isFromCurrentUser && (
              <Text className="text-gray-500">You: </Text>
            )}
            {item.lastMessage.text}
          </Text>

          {item.unreadCount > 0 && (
            <View className="ml-2 w-5 h-5 bg-blue-500 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {item.unreadCount > 9 ? "9+" : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#0084FF" />
        <Text className="mt-3 text-gray-600 font-medium">Loading chats...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View className="mx-4 h-px bg-gray-100" />
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-32">
            <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
              <MessageCircle size={32} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-semibold text-gray-900 mb-2">
              No messages yet
            </Text>
            <Text className="text-gray-500 text-center px-8 leading-5">
              Start a conversation by tapping the compose button
            </Text>
          </View>
        }
      />
    </View>
  );
}
