import { AntDesign } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";

interface VideoItem {
  id: string;
  uri: string;
  signedUrl?: string;
  description: string;
  user_id: string;
  pet_id?: string;
  User: {
    username: string;
  };
  createdAt: string;
  commentCount?: number;
  likeCount?: number;
  isLikedByUser?: boolean;
}

interface VideoSearchProps {
  videos: VideoItem[];
  onVideoSelect: (video: VideoItem, index: number) => void;
  onClose: () => void;
  visible: boolean;
}

const VideoSearch: React.FC<VideoSearchProps> = ({
  videos,
  onVideoSelect,
  onClose,
  visible,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVideos, setFilteredVideos] = useState<VideoItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);

    if (query.trim() === "") {
      setFilteredVideos([]);
      setIsSearching(false);
      return;
    }

    // Filter videos based on description and username
    const filtered = videos.filter((video) => {
      const descriptionMatch = video.description
        .toLowerCase()
        .includes(query.toLowerCase());
      const usernameMatch = video.User.username
        .toLowerCase()
        .includes(query.toLowerCase());
      return descriptionMatch || usernameMatch;
    });

    setFilteredVideos(filtered);
    setIsSearching(false);
  };

  const handleVideoPress = (video: VideoItem) => {
    const originalIndex = videos.findIndex((v) => v.id === video.id);
    onVideoSelect(video, originalIndex);
    onClose();
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredVideos([]);
  };

  const renderVideoItem = ({ item }: { item: VideoItem }) => (
    <Pressable
      onPress={() => handleVideoPress(item)}
      className="flex-row items-center p-4 border-b border-gray-800"
    >
      <View className="flex-1">
        <Text className="text-lg font-bold text-white mb-1">
          @{item.User.username}
        </Text>
        <Text className="text-gray-300 text-sm" numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <AntDesign name="right" size={16} color="#FF7200FF" />
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
    >
      <SafeAreaView className="flex-1 bg-black">
        {/* Header */}
        <View className="flex-row items-center p-4 border-b border-gray-800">
          <Pressable onPress={onClose} className="mr-4">
            <AntDesign name="left" size={24} color="white" />
          </Pressable>
          <Text className="text-xl font-bold text-white">Search Videos</Text>
        </View>

        {/* Search Bar */}
        <View className="p-4">
          <View className="flex-row items-center bg-gray-800 rounded-full px-4 py-3">
            <AntDesign name="search1" size={20} color="#FF7200FF" />
            <TextInput
              placeholder="Search by description or username..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={handleSearch}
              className="flex-1 ml-3 text-white text-base"
              autoFocus={true}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={clearSearch} className="ml-2">
                <AntDesign name="close" size={20} color="#9CA3AF" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Search Results */}
        <View className="flex-1">
          {isSearching ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#FF7200FF" />
              <Text className="mt-2 text-white">Searching...</Text>
            </View>
          ) : searchQuery.trim() === "" ? (
            <View className="flex-1 justify-center items-center">
              <AntDesign name="search1" size={48} color="#4B5563" />
              <Text className="mt-4 text-gray-400 text-center">
                Start typing to search videos by{"\n"}description or username
              </Text>
            </View>
          ) : filteredVideos.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <AntDesign name="frowno" size={48} color="#4B5563" />
              <Text className="mt-4 text-gray-400 text-center">
                No videos found for &quot;{searchQuery}&quot;
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredVideos}
              renderItem={renderVideoItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              className="flex-1"
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default VideoSearch;
