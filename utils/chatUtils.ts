import { router } from "expo-router";
import { supabase } from "./supabase";

export interface ChatUser {
  id: string;
  username: string;
}

/**
 * Navigate to a chat with a specific user
 * This function can be called from anywhere in the app to start a chat
 */
export const startChatWithUser = async (userId: string, username: string) => {
  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    if (user.id === userId) {
      throw new Error("Cannot start chat with yourself");
    }

    // Check if user exists in database
    const { data: targetUser, error } = await supabase
      .from("User")
      .select("id, username")
      .eq("id", userId)
      .single();

    if (error || !targetUser) {
      throw new Error("User not found");
    }

    // Navigate to messages screen
    // The message screen will handle showing the conversation
    router.push({
      pathname: "/(userTabs)/message" as any,
      params: {
        startChatWith: userId,
        startChatWithUsername: username,
      },
    });
  } catch (error) {
    console.error("Error starting chat:", error);
    throw error;
  }
};

/**
 * Get or create a chat conversation between two users
 */
export const getOrCreateConversation = async (otherUserId: string) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check if there's already a conversation between these users
    const usersKeys = [user.id, otherUserId].sort().join("-");

    const { data: existingChat, error } = await supabase
      .from("Chat")
      .select("id")
      .eq("users_keys", usersKeys)
      .limit(1);

    if (error) {
      console.error("Error checking existing chat:", error);
    }

    // Return the conversation identifier
    return usersKeys;
  } catch (error) {
    console.error("Error getting/creating conversation:", error);
    throw error;
  }
};

/**
 * Send a message to a user
 */
export const sendMessage = async (otherUserId: string, message: string) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    if (!message.trim()) {
      throw new Error("Message cannot be empty");
    }

    const usersKeys = [user.id, otherUserId].sort().join("-");

    const { error } = await supabase.from("Chat").insert({
      user_id: user.id,
      chat_user_id: otherUserId,
      users_keys: usersKeys,
      text: message.trim(),
    });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

/**
 * Get all messages in a conversation
 */
export const getConversationMessages = async (otherUserId: string) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const usersKeys = [user.id, otherUserId].sort().join("-");

    const { data, error } = await supabase
      .from("Chat")
      .select("*")
      .eq("users_keys", usersKeys)
      .order("createdAt", { ascending: true });

    if (error) {
      throw error;
    }

    return (
      data?.map((msg) => ({
        ...msg,
        isFromCurrentUser: msg.user_id === user.id,
      })) || []
    );
  } catch (error) {
    console.error("Error getting conversation messages:", error);
    throw error;
  }
};
