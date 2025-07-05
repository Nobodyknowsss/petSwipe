"use client";

import { useFocusEffect } from "@react-navigation/native";
import { VideoView, useVideoPlayer } from "expo-video";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../app/provider/AuthProvider";
import { supabase } from "../../utils/supabase";

// Types
interface LikedVideo {
  id: string;
  video_id: string;
  createdAt: string;
  video: {
    id: string;
    uri: string;
    signedUrl?: string;
    description: string;
    user_id: string;
    User: {
      username: string;
    };
  };
}

interface LikedVideosProps {
  isActive: boolean;
  onRefresh: () => void;
  refreshing: boolean;
}

// Video Player Modal Component
const VideoPlayerModal = ({
  visible,
  onClose,
  video,
}: {
  visible: boolean;
  onClose: () => void;
  video: LikedVideo["video"] | null;
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoPlayerRef = useRef<any>(null);

  // Only create video player if we have a valid video URL
  const videoPlayer = useVideoPlayer(
    video?.signedUrl && video.signedUrl !== "" ? video.signedUrl : null,
    (player) => {
      if (player) {
        videoPlayerRef.current = player;
        player.loop = true;
      }
    }
  );

  // Update ref when videoPlayer changes
  useEffect(() => {
    videoPlayerRef.current = videoPlayer;
  }, [videoPlayer]);

  // Reset states when video changes
  useEffect(() => {
    if (visible && video) {
      setLoading(true);
      setError(null);
      setIsPlaying(false);

      // Validate video URL
      if (!video.signedUrl || video.signedUrl === "") {
        setError("Video URL not available");
        setLoading(false);
        return;
      }

      // Auto-play when modal opens
      const playTimeout = setTimeout(() => {
        try {
          const player = videoPlayerRef.current;
          if (player && typeof player.play === "function") {
            player.play();
            setIsPlaying(true);
            setLoading(false);
          } else {
            setLoading(false);
          }
        } catch (err) {
          console.error("Error playing video:", err);
          setError("Failed to play video");
          setLoading(false);
        }
      }, 1000);

      return () => clearTimeout(playTimeout);
    }
  }, [visible, video]);

  // Stop video when modal closes
  useEffect(() => {
    if (!visible) {
      const player = videoPlayerRef.current;
      if (player && typeof player.pause === "function") {
        try {
          player.pause();
          setIsPlaying(false);
        } catch (err) {
          console.log("Video player already cleaned up");
        }
      }
    }
  }, [visible]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      const player = videoPlayerRef.current;
      if (player && typeof player.pause === "function") {
        try {
          player.pause();
        } catch (err) {
          console.log("Video player cleanup completed");
        }
      }
      videoPlayerRef.current = null;
    };
  }, []);

  const handlePlayPause = () => {
    const player = videoPlayerRef.current;
    if (!player) return;

    try {
      if (isPlaying && typeof player.pause === "function") {
        player.pause();
        setIsPlaying(false);
      } else if (!isPlaying && typeof player.play === "function") {
        player.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Error toggling playback:", err);
      setError("Failed to control video playback");
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => {
      try {
        const player = videoPlayerRef.current;
        if (player && video?.signedUrl && typeof player.play === "function") {
          player.play();
          setIsPlaying(true);
          setLoading(false);
        } else {
          setError("Video player not available");
          setLoading(false);
        }
      } catch (err) {
        console.error("Retry error:", err);
        setError("Still unable to play video");
        setLoading(false);
      }
    }, 500);
  };

  if (!video) return null;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        {/* Close Button */}
        <View className="absolute right-4 top-12 z-10">
          <TouchableOpacity
            onPress={onClose}
            className="justify-center items-center w-10 h-10 rounded-full bg-black/50"
          >
            <Text className="text-xl text-white">✕</Text>
          </TouchableOpacity>
        </View>

        {/* Loading State */}
        {loading && (
          <View className="absolute inset-0 justify-center items-center z-5">
            <ActivityIndicator size="large" color="#FF2D55" />
            <Text className="mt-4 text-white">Loading video...</Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View className="absolute inset-0 justify-center items-center z-5">
            <Text className="mb-4 text-6xl">⚠️</Text>
            <Text className="mb-2 text-xl font-semibold text-white">
              Cannot play video
            </Text>
            <Text className="mb-4 text-center text-gray-300">{error}</Text>
            <TouchableOpacity
              onPress={handleRetry}
              className="px-6 py-3 bg-red-500 rounded-full"
            >
              <Text className="font-medium text-white">Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Video Player */}
        {!error && video.signedUrl && (
          <>
            <VideoView
              style={{ width: "100%", height: "100%" }}
              player={videoPlayer}
              allowsFullscreen={false}
              allowsPictureInPicture={false}
              showsTimecodes={false}
              requiresLinearPlayback={false}
              contentFit="contain"
              nativeControls={false}
            />

            {/* Play/Pause Overlay */}
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 100,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 2,
              }}
              onPress={handlePlayPause}
            >
              {!isPlaying && !loading && (
                <View className="justify-center items-center w-20 h-20 rounded-full bg-white/20">
                  <Text className="text-4xl text-white">▶️</Text>
                </View>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* Video Info Overlay */}
        <View className="absolute right-0 bottom-0 left-0 p-6 bg-gradient-to-t to-transparent from-black/80">
          <Text className="mb-2 text-lg font-semibold text-white">
            @{video.User.username}
          </Text>
          <Text className="text-base text-white">{video.description}</Text>
        </View>
      </View>
    </Modal>
  );
};

// Video Thumbnail Component
const VideoThumbnail = ({ video }: { video: LikedVideo["video"] }) => {
  const [hasError, setHasError] = useState(false);
  const thumbnailPlayerRef = useRef<any>(null);

  const videoPlayer = useVideoPlayer(
    video.signedUrl && video.signedUrl !== "" ? video.signedUrl : null,
    (player) => {
      if (player) {
        thumbnailPlayerRef.current = player;
        player.loop = false;
        player.muted = true;
      }
    }
  );

  useEffect(() => {
    thumbnailPlayerRef.current = videoPlayer;
  }, [videoPlayer]);

  useEffect(() => {
    if (!video.signedUrl || video.signedUrl === "") {
      setHasError(true);
    } else {
      setHasError(false);
    }
  }, [video]);

  useEffect(() => {
    return () => {
      const player = thumbnailPlayerRef.current;
      if (player && typeof player.pause === "function") {
        try {
          player.pause();
        } catch (err) {}
      }
      thumbnailPlayerRef.current = null;
    };
  }, []);

  if (hasError) {
    return (
      <View className="overflow-hidden absolute inset-0 bg-gray-800 rounded-lg">
        <View className="absolute inset-0 justify-center items-center">
          <Text className="text-4xl">🎥</Text>
          <Text className="mt-2 text-xs text-white">Video unavailable</Text>
        </View>
        <View className="absolute inset-0 bg-black/20" />
      </View>
    );
  }

  try {
    return (
      <View className="overflow-hidden absolute inset-0 rounded-lg">
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
        <View className="absolute inset-0 bg-black/20" />
      </View>
    );
  } catch (error) {
    console.error("VideoThumbnail render error:", error);
    return (
      <View className="overflow-hidden absolute inset-0 bg-gray-800 rounded-lg">
        <View className="absolute inset-0 justify-center items-center">
          <Text className="text-4xl">⚠️</Text>
          <Text className="mt-2 text-xs text-white">Thumbnail error</Text>
        </View>
        <View className="absolute inset-0 bg-black/20" />
      </View>
    );
  }
};

// Main LikedVideos Component
export default function LikedVideos({
  isActive,
  onRefresh,
  refreshing,
}: LikedVideosProps) {
  const { user } = useAuth();
  const [likedVideos, setLikedVideos] = useState<LikedVideo[]>([]);
  const [loadingLikedVideos, setLoadingLikedVideos] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<
    LikedVideo["video"] | null
  >(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreVideos, setHasMoreVideos] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const videosPerPage = 4;

  // Stop video when tab changes or component loses focus
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (showVideoPlayer) {
          setShowVideoPlayer(false);
          setSelectedVideo(null);
        }
      };
    }, [showVideoPlayer])
  );

  // Stop video when switching tabs
  useEffect(() => {
    if (!isActive && showVideoPlayer) {
      setShowVideoPlayer(false);
    }
  }, [isActive]);

  // Fetch liked videos when component mounts or user changes
  useEffect(() => {
    if (user && isActive) {
      fetchLikedVideos(true);
    }
  }, [user, isActive]);

  const fetchLikedVideos = async (resetPagination: boolean = false) => {
    if (!user) return;

    const isFirstLoad = resetPagination;
    const pageToLoad = isFirstLoad ? 0 : currentPage;

    try {
      if (isFirstLoad) {
        setLoadingLikedVideos(true);
        setLikedVideos([]);
        setCurrentPage(0);
        setHasMoreVideos(true);
      } else {
        setLoadingMore(true);
      }

      const { data, error } = await supabase
        .from("Like")
        .select(
          `
          id,
          video_id,
          createdAt,
          video:Video!inner (
            id,
            uri,
            description,
            user_id,
            User!inner (
              username
            )
          )
        `
        )
        .eq("user_id", user.id)
        .order("createdAt", { ascending: false })
        .range(
          pageToLoad * videosPerPage,
          (pageToLoad + 1) * videosPerPage - 1
        );

      if (error) {
        console.error("Error fetching liked videos:", error);
        return;
      }

      const likedVideosData = (data as any[]) || [];

      setHasMoreVideos(likedVideosData.length === videosPerPage);

      if (likedVideosData.length > 0) {
        const videosWithSignedUrls = await getSignedUrls(likedVideosData);

        if (isFirstLoad) {
          setLikedVideos(videosWithSignedUrls);
        } else {
          setLikedVideos((prev) => [...prev, ...videosWithSignedUrls]);
        }

        if (!isFirstLoad) {
          setCurrentPage((prev) => prev + 1);
        }
      } else {
        if (isFirstLoad) {
          setLikedVideos([]);
        }
        setHasMoreVideos(false);
      }
    } catch (error) {
      console.error("Error in fetchLikedVideos:", error);
    } finally {
      setLoadingLikedVideos(false);
      setLoadingMore(false);
    }
  };

  const getSignedUrls = async (
    videoData: LikedVideo[]
  ): Promise<LikedVideo[]> => {
    try {
      const filePaths = videoData
        .map((likedVideo) => {
          const uri = likedVideo.video.uri;

          if (uri.includes("/storage/v1/object/public/pet-media/")) {
            const path = uri.split("/storage/v1/object/public/pet-media/")[1];
            return {
              videoId: likedVideo.video.id,
              originalUri: uri,
              path: path,
            };
          }
          return { videoId: likedVideo.video.id, originalUri: uri, path: uri };
        })
        .filter((item) => item.path);

      if (filePaths.length === 0) {
        return videoData;
      }

      const { data: signedUrlData, error } = await supabase.storage
        .from("pet-media")
        .createSignedUrls(
          filePaths.map((item) => item.path),
          60 * 60 * 24 * 7
        );

      if (error) {
        console.error("Error creating signed URLs:", error);
        return videoData;
      }

      const videosWithSignedUrls = videoData.map((likedVideo) => {
        const pathInfo = filePaths.find(
          (fp) => fp.videoId === likedVideo.video.id
        );
        if (pathInfo) {
          const signedUrlInfo = signedUrlData?.find(
            (su) => su.path === pathInfo.path
          );
          if (signedUrlInfo && signedUrlInfo.signedUrl) {
            return {
              ...likedVideo,
              video: {
                ...likedVideo.video,
                signedUrl: signedUrlInfo.signedUrl,
              },
            };
          }
        }

        return {
          ...likedVideo,
          video: {
            ...likedVideo.video,
            signedUrl: likedVideo.video.uri,
          },
        };
      });

      return videosWithSignedUrls;
    } catch (error) {
      console.error("Error in getSignedUrls:", error);
      return videoData;
    }
  };

  const handleVideoPress = (video: LikedVideo["video"]) => {
    if (!video.signedUrl || video.signedUrl === "") {
      alert(
        "Sorry, this video cannot be played right now. Please try refreshing."
      );
      return;
    }

    setSelectedVideo(video);
    setShowVideoPlayer(true);
  };

  const handleCloseVideoPlayer = () => {
    setShowVideoPlayer(false);
    setSelectedVideo(null);
  };

  const loadMoreVideos = async () => {
    if (!loadingMore && hasMoreVideos && user && isActive) {
      await fetchLikedVideos(false);
    }
  };

  useEffect(() => {
    if (refreshing && user && isActive) {
      fetchLikedVideos(true);
    }
  }, [refreshing, user, isActive]);

  if (loadingLikedVideos) {
    return (
      <View className="flex-1 justify-center items-center py-12">
        <ActivityIndicator size="large" color="#FF2D55" />
        <Text className="mt-4 text-gray-500">Loading liked videos...</Text>
      </View>
    );
  }

  if (likedVideos.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-12">
        <Text className="mb-4 text-6xl">💔</Text>
        <Text className="mb-2 text-xl font-semibold text-gray-900">
          No liked videos yet
        </Text>
        <Text className="text-center text-gray-500">
          Videos you like will appear here
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 mb-6">
      <Text className="mb-4 text-sm text-gray-600">
        {likedVideos.length} liked video{likedVideos.length !== 1 ? "s" : ""}
        {hasMoreVideos && " (showing recent videos)"}
      </Text>
      <View className="flex-row flex-wrap">
        {likedVideos.map((likedVideo) => (
          <Pressable
            key={likedVideo.id}
            className="p-1"
            style={{ width: `${100 / 2}%` }}
            onPress={() => handleVideoPress(likedVideo.video)}
          >
            <View
              className="relative justify-center items-center bg-gray-900 rounded-lg"
              style={{ aspectRatio: 9 / 16 }}
            >
              <VideoThumbnail video={likedVideo.video} />

              <View className="absolute right-0 bottom-0 left-0 p-2 rounded-b-lg bg-black/50">
                <Text
                  className="text-xs font-medium text-white"
                  numberOfLines={2}
                >
                  {likedVideo.video.description}
                </Text>
                <Text className="mt-1 text-xs text-gray-300">
                  @{likedVideo.video.User.username}
                </Text>
              </View>

              <View className="absolute top-2 right-2">
                <Text className="text-sm text-red-500">❤️</Text>
              </View>

              <View className="absolute inset-0 justify-center items-center">
                <View className="justify-center items-center w-12 h-12 rounded-full bg-white/20">
                  <Text className="text-lg text-white">▶️</Text>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      {hasMoreVideos && (
        <View className="items-center mt-4">
          <TouchableOpacity
            onPress={loadMoreVideos}
            disabled={loadingMore}
            className="px-6 py-3 bg-gray-100 rounded-full"
          >
            {loadingMore ? (
              <ActivityIndicator size="small" color="#FF2D55" />
            ) : (
              <Text className="font-medium text-gray-700">
                Load More Videos
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <VideoPlayerModal
        visible={showVideoPlayer}
        onClose={handleCloseVideoPlayer}
        video={selectedVideo}
      />
    </View>
  );
}
