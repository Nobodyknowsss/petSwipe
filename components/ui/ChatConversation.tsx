"use client";

import { ArrowLeft, Info, Phone, Send, Video } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
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
import TypingIndicator from "./TypingIndicator";

interface Message {
  id: string;
  text: string;
  createdAt: string;
  isFromCurrentUser: boolean;
  status?: "sending" | "sent" | "delivered" | "read";
  tempId?: string;
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
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const textInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (user && otherUserId) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [user, otherUserId]);

  const fetchMessages = async () => {
    if (!user || !otherUserId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("Chat")
        .select("*")
        .or(
          `and(user_id.eq.${user.id},chat_user_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},chat_user_id.eq.${user.id})`
        )
        .order("createdAt", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      const formattedMessages: Message[] =
        data?.map((msg) => ({
          id: msg.id,
          text: msg.text,
          createdAt: msg.createdAt,
          isFromCurrentUser: msg.user_id === user.id,
          status: "sent",
        })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (!user || !otherUserId) return;

    const channel = supabase
      .channel("chat_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Chat",
        },
        (payload) => {
          const newMessage = payload.new as any;
          // Only add messages that are part of this conversation
          if (
            (newMessage.user_id === user.id &&
              newMessage.chat_user_id === otherUserId) ||
            (newMessage.user_id === otherUserId &&
              newMessage.chat_user_id === user.id)
          ) {
            const formattedMessage: Message = {
              id: newMessage.id,
              text: newMessage.text,
              createdAt: newMessage.createdAt,
              isFromCurrentUser: newMessage.user_id === user.id,
              status: "sent",
            };

            setMessages((prev) => {
              // Remove any temporary message with the same text
              const filteredPrev = prev.filter(
                (msg) => msg.tempId !== newMessage.tempId
              );
              return [...filteredPrev, formattedMessage];
            });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !user || !otherUserId) return;

    const messageText = inputText.trim();
    const tempId = `temp_${Date.now()}`;
    setInputText("");

    // Dismiss keyboard and blur input
    Keyboard.dismiss();
    textInputRef.current?.blur();

    // Add optimistic message
    const optimisticMessage: Message = {
      id: tempId,
      text: messageText,
      createdAt: new Date().toISOString(),
      isFromCurrentUser: true,
      status: "sending",
      tempId,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // Scroll to bottom after adding message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Create users_keys for the conversation
      const usersKeys = [user.id, otherUserId].sort().join("-");

      const { error } = await supabase.from("Chat").insert({
        user_id: user.id,
        chat_user_id: otherUserId,
        users_keys: usersKeys,
        text: messageText,
      });

      if (error) {
        console.error("Error sending message:", error);
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));
        Alert.alert("Error", "Failed to send message");
      } else {
        // Update optimistic message status
        setMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === tempId ? { ...msg, status: "sent" } : msg
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));
      Alert.alert("Error", "Failed to send message");
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Manila",
    });
  };

  const shouldShowTime = (currentMessage: Message, prevMessage?: Message) => {
    if (!prevMessage) return true;
    if (currentMessage.isFromCurrentUser !== prevMessage.isFromCurrentUser)
      return true;

    const timeDiff =
      new Date(currentMessage.createdAt).getTime() -
      new Date(prevMessage.createdAt).getTime();
    return timeDiff > 5 * 60 * 1000; // 5 minutes
  };

  const shouldGroupWithNext = (
    currentMessage: Message,
    nextMessage?: Message
  ) => {
    if (!nextMessage) return false;
    if (currentMessage.isFromCurrentUser !== nextMessage.isFromCurrentUser)
      return false;

    const timeDiff =
      new Date(nextMessage.createdAt).getTime() -
      new Date(currentMessage.createdAt).getTime();
    return timeDiff < 60 * 1000; // 1 minute
  };

  const renderMessage = ({
    item: message,
    index,
  }: {
    item: Message;
    index: number;
  }) => {
    const prevMessage = index > 0 ? messages[index - 1] : undefined;
    const nextMessage =
      index < messages.length - 1 ? messages[index + 1] : undefined;
    const showTime = shouldShowTime(message, prevMessage);
    const groupWithNext = shouldGroupWithNext(message, nextMessage);

    return (
      <View className="px-4 mb-1">
        {showTime && (
          <View className="items-center my-4">
            <Text className="px-3 py-1 text-xs text-gray-500 bg-gray-800 rounded-full">
              {formatTime(message.createdAt)}
            </Text>
          </View>
        )}
        <View
          className={`max-w-[280px] px-4 py-3 ${
            message.isFromCurrentUser
              ? "bg-blue-500 self-end rounded-2xl"
              : "bg-gray-700 self-start rounded-2xl"
          } ${groupWithNext ? "mb-1" : "mb-2"}`}
        >
          <Text
            className={`text-base leading-5 ${
              message.isFromCurrentUser ? "text-white" : "text-white"
            }`}
          >
            {message.text}
          </Text>

          {message.isFromCurrentUser && (
            <View className="flex-row justify-end items-center mt-1">
              <Text className="text-xs text-blue-100 opacity-70">
                {message.status === "sending" ? "Sending..." : "Sent"}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <KeyboardAvoidingView
        className="flex-1 bg-gray-900"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View className="px-4 py-3 bg-gray-800 border-b border-gray-700 shadow-sm">
          <View className="flex-row justify-between items-center">
            <View className="flex-row flex-1 items-center">
              <TouchableOpacity
                onPress={onBack}
                className="p-2 mr-3 bg-gray-700 rounded-full"
              >
                <ArrowLeft size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <View className="flex-row flex-1 items-center">
                <View className="justify-center items-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                  <Text className="font-bold text-white">
                    {otherUsername.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-lg font-semibold text-white">
                    {otherUsername}
                  </Text>
                  <Text className="text-sm text-green-400">Active now</Text>
                </View>
              </View>
            </View>

            <View className="flex-row gap-4 items-center">
              <TouchableOpacity className="p-2 bg-gray-700 rounded-full">
                <Phone size={20} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity className="p-2 bg-gray-700 rounded-full">
                <Video size={20} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity className="p-2 bg-gray-700 rounded-full">
                <Info size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Messages */}
        <View className="flex-1 bg-gray-900">
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            onLayout={() => flatListRef.current?.scrollToEnd()}
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: 16,
              flexGrow: 1,
            }}
            ListEmptyComponent={
              loading ? (
                <View className="flex-1 justify-center items-center py-32">
                  <Text className="text-center text-gray-500">
                    Loading messages...
                  </Text>
                </View>
              ) : (
                <View className="flex-1 justify-center items-center py-32">
                  <View className="justify-center items-center mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                    <Text className="text-xl font-bold text-white">
                      {otherUsername.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text className="mb-2 text-xl font-semibold text-white">
                    Say hello to {otherUsername}!
                  </Text>
                  <Text className="px-8 text-center text-gray-400">
                    This is the beginning of your conversation
                  </Text>
                </View>
              )
            }
          />
          {otherUserTyping && (
            <View className="px-4 py-2">
              <TypingIndicator
                username={otherUsername}
                isVisible={otherUserTyping}
              />
            </View>
          )}
        </View>

        <View
          className="px-4 py-3 bg-gray-800 border-t border-gray-700"
          style={{ marginBottom: 85 }}
        >
          <View className="flex-row items-center px-4 py-2 bg-gray-700 rounded-full">
            <TextInput
              ref={textInputRef}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 mx-2 text-base text-white"
              multiline
              maxLength={1000}
              onFocus={() => setIsTyping(true)}
              onBlur={() => setIsTyping(false)}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!inputText.trim()}
              className={`p-2 rounded-full ${
                inputText.trim() ? "bg-blue-500" : "bg-gray-600"
              }`}
            >
              <Send size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
