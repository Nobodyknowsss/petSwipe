"use client";

import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CommentsModal, getCommentCount } from "../../components/comments";
import VideoSearch from "../../components/VideoSearch";
import { supabase } from "../../utils/supabase";
import { useAuth } from "../provider/AuthProvider";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 50;
const VIDEO_HEIGHT = screenHeight - TAB_BAR_HEIGHT;

interface VideoItem {
  id: string;
  uri: string;
  signedUrl?: string;
  description: string;
  user_id: string;
  User: {
    username: string;
  };
  createdAt: string;
  commentCount?: number;
  likeCount?: number;
  isLikedByUser?: boolean;
}

// TikTok-style Video Component
const VideoItemComponent = ({
  item,
  isVisible,
  isScreenFocused,
}: {
  item: VideoItem;
  isVisible: boolean;
  isScreenFocused: boolean;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(item.isLikedByUser || false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [commentCount, setCommentCount] = useState(item.commentCount || 0);
  const [likeCount, setLikeCount] = useState(item.likeCount || 0);
  const [likePending, setLikePending] = useState(false);
  const { user } = useAuth();

  const videoPlayer = useVideoPlayer(item.signedUrl || "", (player) => {
    player.loop = true;
  });

  // Check if description needs truncation
  const maxLength = 50;
  const needsTruncation = item.description.length > maxLength;

  useEffect(() => {
    if (isVisible && isScreenFocused) {
      videoPlayer.play();
      setIsPlaying(true);
    } else {
      videoPlayer.pause();
      setIsPlaying(false);
    }
  }, [isVisible, isScreenFocused, videoPlayer]);

  // Fetch comment count when component mounts
  useEffect(() => {
    const fetchCommentCount = async () => {
      const count = await getCommentCount(item.id);
      setCommentCount(count);
    };

    fetchCommentCount();
  }, [item.id]);

  // Fetch like data when component mounts
  useEffect(() => {
    const fetchLikeData = async () => {
      if (!item.id) return;

      try {
        // Get like count
        const { count, error: countError } = await supabase
          .from("Like")
          .select("*", { count: "exact", head: true })
          .eq("video_id", item.id);

        if (countError) {
          console.error("Error fetching like count:", countError);
        } else {
          setLikeCount(count || 0);
        }

        // Check if current user liked this video
        if (user) {
          const { data: userLike, error: userLikeError } = await supabase
            .from("Like")
            .select("id")
            .eq("video_id", item.id)
            .eq("user_id", user.id)
            .single();

          if (userLikeError && userLikeError.code !== "PGRST116") {
            console.error("Error checking user like:", userLikeError);
          } else {
            setIsLiked(!!userLike);
          }
        }
      } catch (error) {
        console.error("Error fetching like data:", error);
      }
    };

    fetchLikeData();
  }, [item.id, user]);

  const handleVideoPress = () => {
    if (!isScreenFocused) return;

    if (isPlaying) {
      videoPlayer.pause();
      setIsPlaying(false);
    } else {
      videoPlayer.play();
      setIsPlaying(true);
    }
  };

  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  const getDisplayText = () => {
    if (!needsTruncation) return item.description;
    if (isExpanded) return item.description;
    return item.description.substring(0, maxLength) + "...";
  };

  // Button handlers
  const handleProfilePress = () => {
    console.log("Profile pressed for user:", item.User.username);
  };

  const handleFollowPress = () => {
    setIsFollowing(!isFollowing);
    console.log(
      "Follow pressed for user:",
      item.User.username,
      "Following:",
      !isFollowing
    );
  };

  const handleLikePress = async () => {
    if (!user || likePending) return;

    try {
      setLikePending(true);

      if (isLiked) {
        // Unlike the video
        const { error } = await supabase
          .from("Like")
          .delete()
          .eq("video_id", item.id)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error unliking video:", error);
          return;
        }

        setIsLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        // Like the video
        const { error } = await supabase.from("Like").insert({
          user_id: user.id,
          video_id: item.id,
          video_user_id: item.user_id,
        });

        if (error) {
          console.error("Error liking video:", error);
          return;
        }

        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error in handleLikePress:", error);
    } finally {
      setLikePending(false);
    }
  };

  const handleCommentPress = () => {
    setShowCommentsModal(true);
  };

  const handleCommentsModalClose = () => {
    setShowCommentsModal(false);
    // Refresh comment count when modal closes
    getCommentCount(item.id).then(setCommentCount);
  };

  const handleAdaptPress = () => {
    if (!item.user_id) {
      alert("No pet information available");
      return;
    }

    // Navigate to show the specific pet from this video creator
    // Pass video creation time to help match the correct pet
    router.push(
      `./petDetails?userId=${item.user_id}&showFirst=true&fromVideo=true&videoDate=${item.createdAt}`
    );
  };

  const handleSharePress = () => {
    console.log("Share pressed for video:", item.id);
  };

  if (!item.signedUrl) {
    return (
      <View
        className="flex-1 justify-center items-center bg-black"
        style={{ height: VIDEO_HEIGHT }}
      >
        <ActivityIndicator size="large" color="#FF7200FF" />
        <Text className="mt-4 text-white">Loading video...</Text>
      </View>
    );
  }

  return (
    <View className="bg-black" style={{ height: VIDEO_HEIGHT }}>
      {/* Video Player Container */}
      <View className="flex-1 bg-black">
        <VideoView
          style={{ width: "100%", height: "100%" }}
          player={videoPlayer}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
          showsTimecodes={false}
          requiresLinearPlayback={false}
          contentFit="cover"
          nativeControls={false}
        />

        {/* Play/Pause touch area - covers entire video except right side buttons */}
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 40, // Leave space for side buttons
            bottom: 0,
            zIndex: 1,
          }}
          onPress={handleVideoPress}
        />

        {/* Play Button Overlay - Centered on entire screen */}
        {!isPlaying && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 2,
              pointerEvents: "none", // Allow touches to pass through to the Pressable below
            }}
          >
            <View
              className="justify-center items-center w-20 h-20 rounded-full"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <AntDesign name="caretright" size={24} color="black" />
            </View>
          </View>
        )}

        {/* Right Side Button Overlay */}
        <View
          className="absolute right-4 justify-center items-center"
          style={{
            top: screenHeight / 2 - 30,
            zIndex: 3,
          }}
        >
          {/* User Profile Button */}
          <Pressable
            onPress={handleProfilePress}
            className="relative mb-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <View className="justify-center items-center w-12 h-12 bg-gray-300 rounded-full border-2 border-white">
              <FontAwesome name="user" size={20} color="gray" />
            </View>

            {/* Follow Button */}
            <Pressable
              onPress={handleFollowPress}
              className="absolute -bottom-2 left-1/2 justify-center items-center w-6 h-6 rounded-full border-2 border-white transform -translate-x-1/2"
              style={{
                backgroundColor: isFollowing ? "#gray" : "#FF7200FF",
                marginLeft: -12,
              }}
            >
              <AntDesign
                name={isFollowing ? "check" : "plus"}
                size={12}
                color="white"
              />
            </Pressable>
          </Pressable>

          {/* Like Button - Always filled heart */}
          <Pressable
            onPress={handleLikePress}
            className="justify-center items-center mb-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
              opacity: likePending ? 0.6 : 1,
            }}
            disabled={likePending}
          >
            <AntDesign
              name="heart"
              size={30}
              color={isLiked ? "#FF0000" : "white"}
            />
            <Text className="mt-1 text-xs text-white">{likeCount}</Text>
          </Pressable>

          {/* Comment Button - Filled */}
          <Pressable
            onPress={handleCommentPress}
            className="justify-center items-center mb-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <FontAwesome name="comment" size={28} color="white" />
            <Text className="mt-1 text-xs text-white">{commentCount}</Text>
          </Pressable>

          {/* Adapt Button - Custom Circle with A */}
          <Pressable
            onPress={handleAdaptPress}
            className="justify-center items-center mb-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <View
              className="justify-center items-center w-8 h-8 rounded-full border-2 border-white"
              style={{ backgroundColor: "white" }}
            >
              <Text className="text-lg font-bold text-black">A</Text>
            </View>
            <Text className="mt-1 text-xs text-white">Adopt</Text>
          </Pressable>

          {/* Share Button */}
          <Pressable
            onPress={handleSharePress}
            className="justify-center items-center mb-6"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Entypo name="share" size={26} color="white" />
            <Text className="mt-1 text-xs text-white">Share</Text>
          </Pressable>
        </View>

        {/* Description Overlay */}
        <View
          className="absolute left-0 right-20 p-6"
          style={{
            bottom: 20,
            zIndex: 2,
          }}
        >
          <Text className="mb-2 text-2xl font-bold text-gray-300">
            @{item.User.username}
          </Text>

          <View>
            <Text className="text-base font-medium leading-6 text-white drop-shadow-lg">
              {getDisplayText()}
            </Text>

            {needsTruncation && (
              <Pressable onPress={toggleDescription} className="mt-2">
                <Text
                  className="text-lg font-semibold drop-shadow-lg"
                  style={{ color: "#FF7200FF" }}
                >
                  {isExpanded ? "See less" : "See more"}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* Comments Modal */}
      <CommentsModal
        visible={showCommentsModal}
        onClose={handleCommentsModalClose}
        videoId={item.id}
      />

      {/* Black background for tab bar area */}
      <View className="bg-black" style={{ height: TAB_BAR_HEIGHT }} />
    </View>
  );
};

export default function Home() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"For You" | "Dog" | "Cat">(
    "For You"
  );
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Handle screen focus/blur to pause videos when navigating away
  useFocusEffect(
    useCallback(() => {
      // Screen is focused
      setIsScreenFocused(true);

      return () => {
        // Screen is losing focus - pause all videos
        setIsScreenFocused(false);
      };
    }, [])
  );

  useEffect(() => {
    // Only fetch videos on initial mount, not on subsequent tab switches
    if (!hasInitiallyLoaded) {
      getVideos();
      setHasInitiallyLoaded(true);
    }
  }, [hasInitiallyLoaded]);

  const getVideos = async () => {
    try {
      console.log("🔄 Starting getVideos...");
      setLoading(true);

      const { data, error } = await supabase
        .from("Video")
        .select("id,uri,user_id,description,createdAt,User(username)")
        .order("createdAt", { ascending: false });

      console.log("📹 Video query result:", { videoData: data?.length, error });

      if (error) {
        console.error("❌ Error fetching videos:", error);
        setVideos([]);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        console.log("✅ Videos found:", data.length);
        await getSignedUrls(data);
      } else {
        console.log("📭 No videos found");
        setVideos([]);
      }
    } catch (error) {
      console.error("💥 Error in getVideos:", error);
      setVideos([]);
    } finally {
      console.log("🏁 getVideos completed, setting loading to false");
      setLoading(false);
    }
  };

  const getSignedUrls = async (videoData: any[]) => {
    try {
      console.log("🔗 Starting getSignedUrls for", videoData.length, "videos");

      // Extract file paths from full URLs
      const filePaths = videoData
        .map((video) => {
          const uri = video.uri;
          if (uri.includes("/storage/v1/object/public/pet-media/")) {
            // Extract the file path from the full URL
            const path = uri.split("/storage/v1/object/public/pet-media/")[1];
            return { originalUri: uri, path: path };
          }
          // If it's already a path, return as is
          return { originalUri: uri, path: uri };
        })
        .filter((item) => item.path); // Remove any empty/undefined paths

      if (filePaths.length === 0) {
        console.log("📋 No valid file paths found, using original URIs");
        setVideos(videoData);
        return;
      }

      // Create signed URLs
      const { data: signedUrlData, error } = await supabase.storage
        .from("pet-media")
        .createSignedUrls(
          filePaths.map((item) => item.path),
          60 * 60 * 24 * 7 // 7 days
        );

      if (error) {
        console.error("❌ Error creating signed URLs:", error);
        setVideos(videoData);
        return;
      }

      // Map signed URLs back to videos
      const videosWithSignedUrls = videoData.map((video) => {
        const pathInfo = filePaths.find((fp) => fp.originalUri === video.uri);
        if (pathInfo) {
          const signedUrlInfo = signedUrlData?.find(
            (su) => su.path === pathInfo.path
          );
          if (signedUrlInfo && signedUrlInfo.signedUrl) {
            return {
              ...video,
              signedUrl: signedUrlInfo.signedUrl,
            };
          }
        }
        // Fallback to original URL if signed URL creation failed
        return {
          ...video,
          signedUrl: video.uri,
        };
      });

      console.log("✅ Videos with signed URLs:", videosWithSignedUrls.length);
      setVideos(videosWithSignedUrls);
      console.log("🏁 getSignedUrls completed");
    } catch (error) {
      console.error("💥 Error in getSignedUrls:", error);
      // Fallback: use original URIs
      const videosWithFallback = videoData.map((video) => ({
        ...video,
        signedUrl: video.uri,
      }));
      setVideos(videosWithFallback);
    }
  };

  const handleRefresh = async () => {
    console.log("🔄 Refresh started");
    setRefreshing(true);
    try {
      await getVideos();
    } catch (error) {
      console.error("❌ Error refreshing videos:", error);
    } finally {
      console.log("🏁 Refresh completed");
      setRefreshing(false);
    }
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  const renderVideoItem = ({
    item,
    index,
  }: {
    item: VideoItem;
    index: number;
  }) => {
    const isVisible = index === currentIndex;

    return (
      <View style={{ width: screenWidth, height: screenHeight }}>
        <VideoItemComponent
          item={item}
          isVisible={isVisible}
          isScreenFocused={isScreenFocused}
        />
      </View>
    );
  };

  const handleVideoSelect = (video: VideoItem, index: number) => {
    setCurrentIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleSearchPress = () => {
    setShowSearchModal(true);
  };

  const handleSearchClose = () => {
    setShowSearchModal(false);
  };

  const handleFilterPress = (filter: "For You" | "Dog" | "Cat") => {
    console.log(`🎛️ ${filter} filter pressed - no filtering applied`);
    setActiveFilter(filter);
  };

  return (
    <View className="flex-1 bg-black">
      {/* Top Bar */}
      <View className="absolute right-0 left-0 top-12 z-20 flex-row justify-between items-center px-6 py-3">
        {/* Left Side - Filter Buttons */}
        <View className="flex-row gap-2 space-x-2">
          {(["Dog", "Cat", "For You"] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => handleFilterPress(filter)}
              className={`px-4 py-2 rounded-full ${
                activeFilter === filter
                  ? "bg-white"
                  : "bg-black/50 border border-white/30"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  activeFilter === filter ? "text-black" : "text-white"
                }`}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Right Side Buttons */}
        <View className="flex-row gap-2 items-center space-x-3">
          {/* Refresh Button */}
          <TouchableOpacity
            onPress={handleRefresh}
            disabled={refreshing}
            className="justify-center items-center w-10 h-10 rounded-full border border-gray-600 bg-black/70"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
              opacity: refreshing ? 0.6 : 1,
            }}
          >
            <AntDesign
              name="reload1"
              size={20}
              color="white"
              style={{
                transform: [{ rotate: refreshing ? "180deg" : "0deg" }],
              }}
            />
          </TouchableOpacity>

          {/* Search Button */}
          <TouchableOpacity
            onPress={handleSearchPress}
            className="justify-center items-center w-28 h-10 rounded-full border border-gray-600 bg-black/70"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <AntDesign name="search1" size={20} color="#FF7200FF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content - same as before */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF7200FF" />
          <Text className="mt-4 text-lg text-white">Loading videos...</Text>
        </View>
      ) : videos.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="mb-4 text-xl text-white">No videos found</Text>
          <Text className="px-8 text-center text-gray-400">
            Create some posts with videos to see them here!
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            className="px-6 py-3 mt-4 bg-orange-500 rounded-full"
          >
            <Text className="font-semibold text-white">Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={videos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={screenHeight}
          snapToAlignment="start"
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(data, index) => ({
            length: screenHeight,
            offset: screenHeight * index,
            index,
          })}
        />
      )}

      {/* Search Modal */}
      <VideoSearch
        visible={showSearchModal}
        onClose={handleSearchClose}
        videos={videos}
        onVideoSelect={handleVideoSelect}
      />
    </View>
  );
}
