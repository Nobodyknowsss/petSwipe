import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../app/provider/AuthProvider";
import { supabase } from "../utils/supabase";

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    username: string;
  };
}

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  videoId: string;
}

export const CommentsModal = ({
  visible,
  onClose,
  videoId,
}: CommentsModalProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [newComment, setNewComment] = useState("");

  const fetchComments = async () => {
    if (!videoId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("Comment")
        .select(
          `
          id,
          text,
          createdAt,
          user:User!inner (
            username
          )
        `
        )
        .eq("video_id", videoId)
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Error fetching comments:", error);
        return;
      }

      const commentsData = (data as any[]) || [];
      setComments(commentsData);
      setCommentCount(commentsData.length);
    } catch (error) {
      console.error("Error in fetchComments:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitComment = async () => {
    if (!user || !newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      const { error } = await supabase.from("Comment").insert({
        user_id: user.id,
        video_id: videoId,
        video_user_id: "", // You might want to get this from the video data
        text: newComment.trim(),
      });

      if (error) {
        console.error("Error submitting comment:", error);
        return;
      }

      setNewComment("");
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error("Error in submitComment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchComments();
    }
  }, [visible, videoId]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const CommentItem = ({ comment }: { comment: Comment }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const maxLength = 100;
    const needsTruncation = comment.text.length > maxLength;

    const getDisplayText = () => {
      if (!needsTruncation) return comment.text;
      if (isExpanded) return comment.text;
      return comment.text.substring(0, maxLength) + "...";
    };

    return (
      <View className="flex-row items-start p-4 border-b border-gray-100">
        {/* User Avatar */}
        <View className="justify-center items-center mr-3 w-10 h-10 bg-gray-300 rounded-full">
          <Text className="text-sm font-bold text-gray-600">
            {comment.user.username.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Comment Content */}
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-sm font-semibold text-gray-900">
              {comment.user.username}
            </Text>
            <Text className="ml-2 text-xs text-gray-500">
              {formatTimeAgo(comment.createdAt)}
            </Text>
          </View>

          <Text className="text-sm leading-5 text-gray-800">
            {getDisplayText()}
          </Text>

          {needsTruncation && (
            <Pressable
              onPress={() => setIsExpanded(!isExpanded)}
              className="mt-1"
            >
              <Text className="text-xs font-medium text-blue-600">
                {isExpanded ? "Show less" : "Show more"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 bg-black/50">
          {/* Touchable overlay to close modal */}
          <Pressable className="flex-1" onPress={onClose} />

          {/* Modal content - 70% of screen height */}
          <View className="bg-white rounded-t-3xl" style={{ height: "70%" }}>
            {/* Header */}
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-900">
                Comments ({commentCount})
              </Text>
              <Pressable onPress={onClose}>
                <AntDesign name="close" size={24} color="#666" />
              </Pressable>
            </View>

            {/* Comments List */}
            <View className="flex-1">
              {loading ? (
                <View className="flex-1 justify-center items-center">
                  <ActivityIndicator size="large" color="#FF2D55" />
                  <Text className="mt-2 text-gray-500">
                    Loading comments...
                  </Text>
                </View>
              ) : comments.length > 0 ? (
                <FlatList
                  data={comments}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <CommentItem comment={item} />}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View className="flex-1 justify-center items-center">
                  <FontAwesome name="comment-o" size={48} color="#ccc" />
                  <Text className="mt-4 text-lg font-semibold text-gray-500">
                    No comments yet
                  </Text>
                  <Text className="mt-1 text-gray-400">
                    Be the first to comment!
                  </Text>
                </View>
              )}
            </View>

            {/* Comment Input - Only show if user is logged in */}
            {user && (
              <View className="bg-white border-t border-gray-200">
                <View
                  className="flex-row items-center p-5"
                  style={{
                    minHeight: 70,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 5,
                  }}
                >
                  <View className="justify-center items-center mr-4 w-12 h-12 bg-blue-100 rounded-full">
                    <Text className="text-base font-bold text-blue-600">
                      {user.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View className="flex-1 mr-4">
                    <TextInput
                      className="px-5 py-4 text-base bg-gray-100 rounded-full"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChangeText={setNewComment}
                      multiline
                      maxLength={120}
                      style={{
                        minHeight: 48,
                        maxHeight: 100,
                      }}
                    />
                    <Text className="mt-2 ml-5 text-xs text-gray-400">
                      {newComment.length}/120
                    </Text>
                  </View>

                  <Pressable
                    onPress={submitComment}
                    disabled={!newComment.trim() || submitting}
                    className="justify-center items-center w-12 h-12 rounded-full"
                    style={{
                      backgroundColor:
                        newComment.trim() && !submitting
                          ? "#FF2D55"
                          : "#E5E7EB",
                    }}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <AntDesign name="arrowup" size={20} color="white" />
                    )}
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Export function to get comment count for external use
export const getCommentCount = async (videoId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from("Comment")
      .select("*", { count: "exact", head: true })
      .eq("video_id", videoId);

    if (error) {
      console.error("Error getting comment count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in getCommentCount:", error);
    return 0;
  }
};
