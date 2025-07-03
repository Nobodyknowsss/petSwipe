import { VideoView, useVideoPlayer } from "expo-video";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { supabase } from "../../utils/supabase";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface VideoItem {
  id: string;
  uri: string;
  signedUrl?: string;
  description: string;
  User: {
    username: string;
  };
  createdAt: string;
}

// Separate component for video items to properly use hooks
const VideoItemComponent = ({
  item,
  isVisible,
}: {
  item: VideoItem;
  isVisible: boolean;
}) => {
  const videoPlayer = useVideoPlayer(item.signedUrl || "", (player) => {
    player.loop = true;
  });

  useEffect(() => {
    if (isVisible) {
      videoPlayer.play();
    } else {
      videoPlayer.pause();
    }
  }, [isVisible, videoPlayer]);

  if (!item.signedUrl) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text className="mt-4 text-white">Loading video...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <VideoView
        style={{ width: "100%", height: "100%" }}
        player={videoPlayer}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
      />

      {/* Only description overlay */}
      <View className="absolute right-0 bottom-0 left-0 p-6">
        <Text className="text-base font-medium leading-6 text-white">
          {item.description}
        </Text>
      </View>
    </View>
  );
};

export default function Home() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    getVideos();
  }, []);

  const getVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("Video")
        .select("*,User(username)")
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Error fetching videos:", error);
        return;
      }

      if (data && data.length > 0) {
        await getSignedUrls(data);
      } else {
        setVideos([]);
      }
    } catch (error) {
      console.error("Error in getVideos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSignedUrls = async (videoData: any[]) => {
    try {
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
        console.log("No valid file paths found");
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
        console.error("Error creating signed URLs:", error);
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

      console.log("Videos with signed URLs:", videosWithSignedUrls);
      setVideos(videosWithSignedUrls);
    } catch (error) {
      console.error("Error in getSignedUrls:", error);
      setVideos(videoData);
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
        <VideoItemComponent item={item} isVisible={isVisible} />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text className="mt-4 text-lg text-white">Loading videos...</Text>
      </SafeAreaView>
    );
  }

  if (videos.length === 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-black">
        <Text className="mb-4 text-xl text-white">No videos found</Text>
        <Text className="px-8 text-center text-gray-400">
          Create some posts with videos to see them here!
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
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
    </View>
  );
}
