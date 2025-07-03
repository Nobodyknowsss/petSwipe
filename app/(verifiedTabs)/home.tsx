import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { supabase } from "../../utils/supabase";

export default function Home() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    getVideos();
  }, []);

  const getVideos = async () => {
    const { data, error } = await supabase
      .from("Video")
      .select("*,User(username)")
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Error fetching videos:", error);
    }
    getUrl(data);
  };

  const getUrl = async (videos: any[]) => {
    // Extract file paths from full URLs
    const filePaths = videos
      .map((video) => {
        const uri = video.uri;
        if (uri.includes("/storage/v1/object/public/pet-media/")) {
          // Extract the file path from the full URL
          const path = uri.split("/storage/v1/object/public/pet-media/")[1];
          return path;
        }
        // If it's already a path, return as is
        return uri;
      })
      .filter(Boolean); // Remove any empty/undefined paths

    if (filePaths.length === 0) {
      console.log("No valid file paths found");
      return;
    }

    const { data, error } = await supabase.storage
      .from("pet-media")
      .createSignedUrls(filePaths, 60 * 60 * 24 * 7);

    if (error) {
      console.error("Error fetching url:", error);
    }
    let videoUrls = videos.map((item) => {
      item.signedUrl = data.find(
        (signedUrl) => signedUrl.path === item.uri
      )?.signedUrl;
      return item;
    });

    console.log(videoUrls);
  };

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-3xl font-bold text-black">verefied home</Text>
    </View>
  );
}
