import { ArrowLeft, Info, Phone, Send, Video } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../app/provider/AuthProvider";
import { supabase } from "../../utils/supabase";

interface Message {
  id: string;
  text: string;
  user_id: string;
  chat_user_id: string;
  createdAt: string;
  isFromCurrentUser: boolean;
}

interface ChatConversationProps {
  otherUserId: string;
  otherUsername: string;
  onBack: () => void;
}

export default function ChatConversation({
  otherUserId,
  otherUsername,
  onBack,
}: ChatConversationProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    console.log("ChatConversation mounted with:", {
      otherUserId,
      otherUsername,
      currentUser: user?.id,
    });

    if (!otherUserId || !otherUsername) {
      console.error("Missing required props:", { otherUserId, otherUsername });
      Alert.alert("Error", "Invalid chat data");
      onBack();
      return;
    }

    if (user) {
      fetchMessages();
      const cleanup = subscribeToMessages();
      return cleanup;
    }
  }, [user, otherUserId]);

  const fetchMessages = async () => {
    if (!user || !otherUserId) {
      console.error("Missing user or otherUserId:", {
        user: user?.id,
        otherUserId,
      });
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching messages for conversation:", {
        userId: user.id,
        otherUserId,
      });

      // Create users_keys for the conversation
      const usersKeys = [user.id, otherUserId].sort().join("-");
      console.log("Using users_keys:", usersKeys);

      const { data, error } = await supabase
        .from("Chat")
        .select("*")
        .eq("users_keys", usersKeys)
        .order("createdAt", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        Alert.alert("Error", "Failed to load messages");
        return;
      }

      console.log("Fetched messages:", data?.length || 0);

      const messagesWithFlag =
        data?.map((msg) => ({
          ...msg,
          isFromCurrentUser: msg.user_id === user.id,
        })) || [];

      setMessages(messagesWithFlag);
    } catch (error) {
      console.error("Error fetching messages:", error);
      Alert.alert("Error", "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (!user || !otherUserId) return () => {};

    const usersKeys = [user.id, otherUserId].sort().join("-");
    console.log("Subscribing to messages for:", usersKeys);

    const channel = supabase
      .channel(`messages-${usersKeys}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Chat",
          filter: `users_keys=eq.${usersKeys}`,
        },
        (payload) => {
          console.log("New message received:", payload.new);
          const newMsg = {
            ...payload.new,
            isFromCurrentUser: payload.new.user_id === user.id,
          } as Message;
          setMessages((prev) => [...prev, newMsg]);

          // Auto scroll to bottom
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      )
      .subscribe();

    return () => {
      console.log("Unsubscribing from messages");
      channel.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!user || !newMessage.trim() || sending || !otherUserId) {
      console.log("Cannot send message:", {
        hasUser: !!user,
        hasMessage: !!newMessage.trim(),
        sending,
        hasOtherUserId: !!otherUserId,
      });
      return;
    }

    try {
      setSending(true);
      console.log("Sending message:", newMessage.trim());

      const usersKeys = [user.id, otherUserId].sort().join("-");
      const messageText = newMessage.trim();

      // Add message optimistically to UI first
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`, // Temporary ID
        text: messageText,
        user_id: user.id,
        chat_user_id: otherUserId,
        createdAt: new Date().toISOString(),
        isFromCurrentUser: true,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setNewMessage("");

      // Scroll to bottom immediately
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Send to database
      const { data, error } = await supabase
        .from("Chat")
        .insert({
          user_id: user.id,
          chat_user_id: otherUserId,
          users_keys: usersKeys,
          text: messageText,
        })
        .select()
        .single();

      if (error) {
        console.error("Error sending message:", error);
        // Remove optimistic message on error
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== optimisticMessage.id)
        );
        Alert.alert("Error", "Failed to send message");
        setNewMessage(messageText); // Restore the message text
        return;
      }

      console.log("Message sent successfully:", data);

      // Replace optimistic message with real message
      if (data) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id
              ? { ...data, isFromCurrentUser: true }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(minutes / 60);

      if (hours > 0) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (minutes > 0) {
        return `${minutes}m ago`;
      } else {
        return "now";
      }
    } catch (error) {
      console.error("Error formatting time:", error);
      return "now";
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isConsecutive =
      index > 0 &&
      messages[index - 1]?.isFromCurrentUser === item.isFromCurrentUser &&
      new Date(item.createdAt).getTime() -
        new Date(messages[index - 1]?.createdAt || 0).getTime() <
        60000; // 1 minute

    return (
      <View
        className={`px-4 ${
          isConsecutive ? "mb-1" : "mb-3"
        } ${item.isFromCurrentUser ? "items-end" : "items-start"}`}
      >
        <View
          className={`max-w-[75%] px-4 py-2 rounded-2xl ${
            item.isFromCurrentUser
              ? "bg-blue-500 rounded-br-md"
              : "bg-gray-200 rounded-bl-md"
          }`}
        >
          <Text
            className={`text-base leading-5 ${
              item.isFromCurrentUser ? "text-white" : "text-gray-900"
            }`}
          >
            {item.text}
          </Text>
        </View>

        {!isConsecutive && (
          <Text
            className={`text-xs text-gray-500 mt-1 ${
              item.isFromCurrentUser ? "text-right" : "text-left"
            }`}
          >
            {formatTime(item.createdAt)}
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0084FF" />
          <Text className="mt-3 text-gray-600 font-medium">
            Loading conversation...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shadow-sm">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={onBack} className="mr-3">
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>

            <View className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 items-center justify-center mr-3">
              <Text className="text-white font-bold text-sm">
                {otherUsername?.charAt(0)?.toUpperCase() || "?"}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="font-semibold text-lg text-gray-900">
                {otherUsername || "Unknown User"}
              </Text>
              <Text className="text-sm text-green-500">Active now</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-4">
            <TouchableOpacity>
              <Phone size={22} color="#0084FF" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Video size={22} color="#0084FF" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Info size={22} color="#0084FF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <KeyboardAvoidingView
          className="flex-1 bg-gray-50"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            className="flex-1 pt-4"
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-20">
                <View className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 items-center justify-center mb-4">
                  <Text className="text-white font-bold text-xl">
                    {otherUsername?.charAt(0)?.toUpperCase() || "?"}
                  </Text>
                </View>
                <Text className="text-lg font-semibold text-gray-900 mb-2">
                  {otherUsername || "Unknown User"}
                </Text>
                <Text className="text-gray-500 text-center px-8 leading-5">
                  You&apos;re now connected! Send a message to start the
                  conversation.
                </Text>
              </View>
            }
          />

          {/* Message Input */}
          <View className="flex-row items-end px-4 py-3 bg-white border-t border-gray-200 mb-20">
            <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2 mr-3">
              <TextInput
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message..."
                className="flex-1 text-base py-1 max-h-20"
                multiline
                textAlignVertical="center"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity
              onPress={sendMessage}
              disabled={!newMessage.trim() || sending}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                newMessage.trim() && !sending ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              {sending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Send size={18} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
