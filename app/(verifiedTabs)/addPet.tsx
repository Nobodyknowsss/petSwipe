"use client";

import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MediaFile, PetFormData } from "../../types/pet";
import { checkFileSize, compressImage } from "../../utils/fileUtils";
import { supabase } from "../../utils/supabase";
import { uploadMediaToSupabase } from "../../utils/uploadUtils";

const FormInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  required = false,
  multiline = false,
  keyboardType = "default",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  required?: boolean;
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
}) => (
  <View>
    <Text className="mb-3 text-base font-semibold text-gray-700">
      {label} {required && "*"}
    </Text>
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      className="px-5 py-4 text-base text-gray-800 bg-white rounded-2xl border-2 border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      textAlignVertical={multiline ? "top" : "center"}
      keyboardType={keyboardType}
    />
  </View>
);

// Gender Selector Component
const GenderSelector = ({
  selectedGender,
  onGenderSelect,
}: {
  selectedGender: string;
  onGenderSelect: (gender: string) => void;
}) => (
  <View className="flex-1">
    <Text className="mb-3 text-base font-semibold text-gray-700">Gender *</Text>
    <View className="flex-row space-x-2">
      {["Male", "Female"].map((gender) => (
        <TouchableOpacity
          key={gender}
          onPress={() => onGenderSelect(gender)}
          className={`flex-1 py-4 rounded-2xl border-2 ${
            selectedGender === gender ? "border-2" : "border-2 border-gray-100"
          }`}
          style={{
            backgroundColor:
              selectedGender === gender ? "rgba(255, 114, 0, 0.1)" : "white",
            borderColor: selectedGender === gender ? "#FF7200FF" : "#F3F4F6",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Text
            className={`text-center font-semibold ${
              selectedGender === gender ? "text-gray-800" : "text-gray-600"
            }`}
            style={{
              color: selectedGender === gender ? "#FF7200FF" : "#6B7280",
            }}
          >
            {gender}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// Type Selector Component
const TypeSelector = ({
  selectedType,
  onTypeSelect,
  customType,
  onCustomTypeChange,
}: {
  selectedType: string;
  onTypeSelect: (type: string) => void;
  customType: string;
  onCustomTypeChange: (text: string) => void;
}) => (
  <View>
    <Text className="mb-3 text-base font-semibold text-gray-700">
      Pet Type *
    </Text>
    <View className="flex-row mb-3 space-x-2">
      {["Dog", "Cat", "Other"].map((type) => (
        <TouchableOpacity
          key={type}
          onPress={() => onTypeSelect(type)}
          className={`flex-1 py-4 rounded-2xl border-2 ${
            selectedType === type ? "border-2" : "border-2 border-gray-100"
          }`}
          style={{
            backgroundColor:
              selectedType === type ? "rgba(255, 114, 0, 0.1)" : "white",
            borderColor: selectedType === type ? "#FF7200FF" : "#F3F4F6",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Text
            className={`text-center font-semibold ${
              selectedType === type ? "text-gray-800" : "text-gray-600"
            }`}
            style={{
              color: selectedType === type ? "#FF7200FF" : "#6B7280",
            }}
          >
            {type}
          </Text>
        </TouchableOpacity>
      ))}
    </View>

    {/* Custom Type Input - Only show when "Other" is selected */}
    {selectedType === "Other" && (
      <TextInput
        placeholder="Enter pet type (e.g., Rabbit, Bird, etc.)"
        placeholderTextColor="#9CA3AF"
        className="px-5 py-4 text-base text-gray-800 bg-white rounded-2xl border-2 border-gray-100"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
        value={customType}
        onChangeText={onCustomTypeChange}
        autoCapitalize="words"
      />
    )}
  </View>
);

// Submit Button Component
const SubmitButton = ({
  onPress,
  uploading,
}: {
  onPress: () => void;
  uploading: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={uploading}
    className={`mt-8 mb-32 py-5 rounded-2xl shadow-lg ${uploading ? "opacity-70" : ""}`}
    style={{
      backgroundColor: uploading ? "#D1D5DB" : "#FF7200FF",
      shadowColor: "#FF7200FF",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: uploading ? 0.1 : 0.3,
      shadowRadius: 12,
      elevation: 6,
    }}
  >
    {uploading ? (
      <View className="flex-row justify-center items-center">
        <ActivityIndicator size="small" color="white" />
        <Text className="ml-3 text-lg font-bold text-white">Adding Pet...</Text>
      </View>
    ) : (
      <Text className="text-lg font-bold text-center text-white">Add Pet</Text>
    )}
  </TouchableOpacity>
);

// Media Upload Section Component
const MediaUploadSection = ({
  mediaType,
  selectedMedia,
  onPress,
  loading,
  videoPlayer,
}: {
  mediaType: "image" | "video";
  selectedMedia: MediaFile | null;
  onPress: () => void;
  loading: boolean;
  videoPlayer?: any;
}) => (
  <View className="mb-6">
    <Text className="mb-3 text-lg font-bold text-gray-800">
      Pet {mediaType === "image" ? "Photo" : "Video"}{" "}
      {mediaType === "image" ? "*" : ""}
    </Text>
    <TouchableOpacity
      onPress={onPress}
      className="justify-center items-center h-48 rounded-2xl border-2 border-dashed"
      style={{
        backgroundColor: "rgba(255, 114, 0, 0.05)",
        borderColor: "rgba(255, 114, 0, 0.3)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {loading ? (
        <View className="items-center">
          <ActivityIndicator size="large" color="#FF7200FF" />
          <Text className="mt-2 text-sm text-gray-600">
            {mediaType === "video" ? "Processing video..." : "Loading..."}
          </Text>
        </View>
      ) : selectedMedia ? (
        <View className="overflow-hidden w-full h-full rounded-2xl">
          {mediaType === "image" ? (
            <Image
              source={{ uri: selectedMedia.uri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <VideoView
              style={{ width: "100%", height: "100%" }}
              player={videoPlayer}
              allowsFullscreen
              allowsPictureInPicture
            />
          )}
          <TouchableOpacity
            onPress={onPress}
            className="absolute top-2 right-2 p-2 rounded-full"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
          >
            <Text className="text-xs font-semibold text-white">Change</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="items-center">
          <Text className="mb-2 text-4xl">
            {mediaType === "image" ? "📷" : "🎥"}
          </Text>
          <Text className="font-semibold text-gray-700">
            Tap to add {mediaType === "image" ? "photo" : "video"}
          </Text>
          <Text className="mt-1 text-sm text-center text-gray-500">
            {mediaType === "image"
              ? "Images will be compressed for optimal upload"
              : "Videos limited to 60 seconds and under 50MB\nFor best results, use 1080p or lower resolution"}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  </View>
);

// Header Component
const Header = ({ onBack }: { onBack: () => void }) => (
  <View className="px-6 pt-12 pb-6">
    <View className="flex-row items-center mb-6">
      <TouchableOpacity onPress={onBack} className="mr-4">
        <Text className="text-2xl font-bold text-gray-800">←</Text>
      </TouchableOpacity>
      <Text className="text-2xl font-bold text-gray-800">Add New Pet</Text>
    </View>
  </View>
);

export default function AddPet() {
  const [formData, setFormData] = useState<PetFormData>({
    name: "",
    breed: "",
    age: "",
    gender: "",
    location: "",
    description: "",
    type: "",
  });
  const [selectedImage, setSelectedImage] = useState<MediaFile | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<MediaFile | null>(null);
  const [loading, setLoading] = useState({ image: false, video: false });
  const [uploading, setUploading] = useState(false);
  const [customType, setCustomType] = useState("");

  // Video player for preview
  const videoPlayer = useVideoPlayer(selectedVideo?.uri || "", (player) => {
    player.loop = true;
    player.play();
  });

  // Cleanup video player when component unmounts or video changes
  useEffect(() => {
    return () => {
      try {
        if (videoPlayer && selectedVideo) {
          videoPlayer.pause();
        }
      } catch (error) {
        console.log("Video player cleanup error:", error);
      }
    };
  }, [videoPlayer, selectedVideo]);

  // Stop video when navigating away
  useEffect(() => {
    const handleRouteChange = () => {
      try {
        if (videoPlayer && selectedVideo) {
          videoPlayer.pause();
        }
      } catch (error) {
        console.log("Video player route change error:", error);
      }
    };

    return handleRouteChange;
  }, [videoPlayer, selectedVideo]);

  // Pause video when tab loses focus (user switches tabs)
  useFocusEffect(
    useCallback(() => {
      // Screen is focused - video can play if user wants
      return () => {
        // Screen is losing focus - pause the video
        try {
          if (videoPlayer && selectedVideo) {
            videoPlayer.pause();
          }
        } catch (error) {
          console.log("Video player focus error:", error);
        }
      };
    }, [videoPlayer, selectedVideo])
  );

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to upload photos and videos."
      );
      return false;
    }
    return true;
  };

  const pickMedia = async (mediaType: "image" | "video") => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const title = mediaType === "image" ? "Select Photo" : "Select Video";
    const message = `Choose a ${mediaType} for your pet`;

    Alert.alert(title, message, [
      {
        text: "Camera",
        onPress: () => openCamera(mediaType),
      },
      {
        text: `${mediaType === "image" ? "Photo" : "Video"} Library`,
        onPress: () => openLibrary(mediaType),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const openCamera = async (mediaType: "image" | "video") => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera permission is needed.");
      return;
    }

    // For videos, use aggressive compression settings
    if (mediaType === "video") {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1, // Very low quality to force smaller file sizes
        videoMaxDuration: 60,
        videoExportPreset: ImagePicker.VideoExportPreset.H264_1920x1080,
      });

      if (!result.canceled && result.assets[0]) {
        await handleMediaSelection(result.assets[0], mediaType);
      }
    } else {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handleMediaSelection(result.assets[0], mediaType);
      }
    }
  };

  const openLibrary = async (mediaType: "image" | "video") => {
    // For videos, use aggressive compression settings
    if (mediaType === "video") {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1, // Very low quality to force smaller file sizes
        videoMaxDuration: 60,
        videoExportPreset: ImagePicker.VideoExportPreset.H264_960x540,
      });

      if (!result.canceled && result.assets[0]) {
        await handleMediaSelection(result.assets[0], mediaType);
      }
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handleMediaSelection(result.assets[0], mediaType);
      }
    }
  };

  const handleMediaSelection = async (
    asset: ImagePicker.ImagePickerAsset,
    mediaType: "image" | "video"
  ) => {
    setLoading((prev) => ({ ...prev, [mediaType]: true }));
    try {
      let finalUri = asset.uri;

      // Check initial file size
      const fileSize = await checkFileSize(asset.uri);
      const fileSizeMB = fileSize / (1024 * 1024);

      console.log(`Selected ${mediaType} size: ${fileSizeMB.toFixed(2)}MB`);

      // Different handling for videos vs images
      if (mediaType === "video") {
        if (fileSizeMB > 50) {
          Alert.alert(
            "Video Too Large",
            `This video is ${fileSizeMB.toFixed(1)}MB. Videos must be under 50MB. The video may be 4K resolution. Please try:\n\n• Select a shorter video\n• Use a lower resolution setting on your camera\n• Choose a different video`,
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => {
                  setLoading((prev) => ({ ...prev, [mediaType]: false }));
                  return;
                },
              },
              {
                text: "Try Anyway",
                style: "destructive",
                onPress: async () => {
                  await processMedia(asset, mediaType, finalUri);
                },
              },
            ]
          );
        } else if (fileSizeMB > 25) {
          Alert.alert(
            "Large Video File",
            `This video is ${fileSizeMB.toFixed(1)}MB. It may take longer to upload. For best performance, consider using videos under 25MB.`,
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => {
                  setLoading((prev) => ({ ...prev, [mediaType]: false }));
                  return;
                },
              },
              {
                text: "Continue",
                onPress: async () => {
                  await processMedia(asset, mediaType, finalUri);
                },
              },
            ]
          );
        } else {
          await processMedia(asset, mediaType, finalUri);
        }
      } else {
        // Handle images
        if (fileSizeMB > 25) {
          Alert.alert(
            "Large Image File",
            `This image is ${fileSizeMB.toFixed(1)}MB. We'll compress it to reduce the size.`,
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => {
                  setLoading((prev) => ({ ...prev, [mediaType]: false }));
                  return;
                },
              },
              {
                text: "Continue",
                onPress: async () => {
                  await processMedia(asset, mediaType, finalUri);
                },
              },
            ]
          );
        } else {
          await processMedia(asset, mediaType, finalUri);
        }
      }
    } catch (error) {
      console.error("Error processing media:", error);
      Alert.alert("Error", "Failed to process the selected media.");
      setLoading((prev) => ({ ...prev, [mediaType]: false }));
    }
  };

  const processMedia = async (
    asset: ImagePicker.ImagePickerAsset,
    mediaType: "image" | "video",
    finalUri: string
  ) => {
    try {
      // Log original asset info
      console.log(`Processing ${mediaType}:`, {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        duration: asset.duration,
        fileSize: asset.fileSize,
      });

      // Compress image if it's an image
      if (mediaType === "image") {
        finalUri = await compressImage(asset.uri);
      } else {
        // For videos, log the compression results
        const originalSize = await checkFileSize(asset.uri);
        const originalSizeMB = originalSize / (1024 * 1024);
        console.log(
          `Video after picker compression: ${originalSizeMB.toFixed(2)}MB`
        );

        // If video is still too large, warn user
        if (originalSizeMB > 50) {
          console.warn(
            `Video still too large after compression: ${originalSizeMB}MB`
          );
        }
      }

      // Stop current video if selecting a new video
      if (mediaType === "video" && videoPlayer && selectedVideo) {
        try {
          videoPlayer.pause();
        } catch (error) {
          console.log("Video player change error:", error);
        }
      }

      const mediaFile: MediaFile = {
        uri: finalUri,
        type: mediaType,
      };

      if (mediaType === "image") {
        setSelectedImage(mediaFile);
      } else {
        setSelectedVideo(mediaFile);
      }
    } catch (error) {
      console.error("Error processing media:", error);
      Alert.alert("Error", "Failed to process the selected media.");
    } finally {
      setLoading((prev) => ({ ...prev, [mediaType]: false }));
    }
  };

  const validateForm = () => {
    const required = [
      "name",
      "breed",
      "age",
      "gender",
      "location",
      "description",
      "type",
    ];
    const missingFields = required.filter(
      (field) => !formData[field as keyof PetFormData].trim()
    );

    if (missingFields.length > 0) {
      Alert.alert(
        "Missing Information",
        `Please fill in: ${missingFields.join(", ")}`
      );
      return false;
    }

    // Additional validation for custom type
    if (formData.type === "Other" && !customType.trim()) {
      Alert.alert("Missing Information", "Please enter a pet type.");
      return false;
    }

    if (isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
      Alert.alert("Invalid Age", "Please enter a valid age.");
      return false;
    }

    if (!selectedImage) {
      Alert.alert("Photo Required", "Please select a photo for your pet.");
      return false;
    }

    if (!selectedVideo) {
      Alert.alert("Video Required", "Please select a video for your pet.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setUploading(true);
    try {
      // Upload media to Supabase
      let photoUrl = "";
      let videoUrl = "";

      if (selectedImage) {
        photoUrl = await uploadMediaToSupabase(selectedImage.uri, "image");
      }

      if (selectedVideo) {
        videoUrl = await uploadMediaToSupabase(selectedVideo.uri, "video");
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Error", "You must be logged in to add a pet.");
        return;
      }

      // Determine final type value
      const finalType =
        formData.type === "Other" ? customType.trim() : formData.type;

      // Save pet data to database
      const petData = {
        name: formData.name.trim(),
        breed: formData.breed.trim(),
        age: Number.parseInt(formData.age),
        gender: formData.gender.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        type: finalType,
        photoUrl,
        videoUrl,
        ownerId: user.id,
      };

      // Here you would typically use your database client (Prisma) to save the pet
      // For now, I'll use Supabase client as an example
      const { error } = await supabase.from("Pet").insert([petData]);

      if (error) throw error;

      Alert.alert("Success!", "Your pet has been added successfully.", [
        {
          text: "Add Another Pet",
          onPress: () => {
            resetForm();
          },
        },
        {
          text: "Go Back",
          onPress: () => {
            try {
              if (videoPlayer && selectedVideo) {
                videoPlayer.pause();
              }
            } catch (error) {
              console.log("Video player success error:", error);
            }
            resetForm();
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error("Error adding pet:", error);
      Alert.alert("Error", "Failed to add pet. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const updateFormData = (field: keyof PetFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    // Reset form data
    setFormData({
      name: "",
      breed: "",
      age: "",
      gender: "",
      location: "",
      description: "",
      type: "",
    });

    // Clear custom type
    setCustomType("");

    // Clear selected media
    setSelectedImage(null);
    setSelectedVideo(null);

    // Reset loading states
    setLoading({ image: false, video: false });

    // Pause video player if active
    try {
      if (videoPlayer && selectedVideo) {
        videoPlayer.pause();
      }
    } catch (error) {
      console.log("Video player reset error:", error);
    }
  };

  const handleBack = () => {
    try {
      if (videoPlayer && selectedVideo) {
        videoPlayer.pause();
      }
    } catch (error) {
      console.log("Video player back error:", error);
    }
    router.push("./managePets");
  };

  const handleTypeSelect = (type: string) => {
    updateFormData("type", type);
    // Clear custom type when not selecting "Other"
    if (type !== "Other") {
      setCustomType("");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-orange-50 to-white">
      <View className="flex-1 mb-28 bg-gradient-to-b from-orange-50 to-white">
        <Header onBack={handleBack} />

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Image Upload Section */}
          <MediaUploadSection
            mediaType="image"
            selectedMedia={selectedImage}
            onPress={() => pickMedia("image")}
            loading={loading.image}
          />

          {/* Video Upload Section */}
          <MediaUploadSection
            mediaType="video"
            selectedMedia={selectedVideo}
            onPress={() => pickMedia("video")}
            loading={loading.video}
            videoPlayer={videoPlayer}
          />

          {/* Form Fields */}
          <View className="space-y-5">
            <FormInput
              label="Pet Name"
              placeholder="Enter pet's name"
              value={formData.name}
              onChangeText={(value) => updateFormData("name", value)}
              required
            />

            <FormInput
              label="Breed"
              placeholder="Enter breed"
              value={formData.breed}
              onChangeText={(value) => updateFormData("breed", value)}
              required
            />

            {/* Age and Gender Row */}
            <View className="flex-row space-x-4">
              <View className="flex-1">
                <FormInput
                  label="Age (years)"
                  placeholder="0"
                  value={formData.age}
                  onChangeText={(value) => updateFormData("age", value)}
                  keyboardType="numeric"
                  required
                />
              </View>

              <GenderSelector
                selectedGender={formData.gender}
                onGenderSelect={(gender) => updateFormData("gender", gender)}
              />
            </View>

            <FormInput
              label="Location"
              placeholder="Enter location"
              value={formData.location}
              onChangeText={(value) => updateFormData("location", value)}
              required
            />

            <FormInput
              label="Description"
              placeholder="Tell us about your pet..."
              value={formData.description}
              onChangeText={(value) => updateFormData("description", value)}
              multiline
            />

            {/* Type Selector */}
            <TypeSelector
              selectedType={formData.type}
              onTypeSelect={handleTypeSelect}
              customType={customType}
              onCustomTypeChange={(text) => setCustomType(text)}
            />
          </View>

          <SubmitButton onPress={handleSubmit} uploading={uploading} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
