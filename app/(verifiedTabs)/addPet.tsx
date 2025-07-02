import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
        <ActivityIndicator size="large" color="#FF7200FF" />
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
          <Text className="mt-1 text-sm text-gray-500">
            {mediaType === "image"
              ? "Images will be compressed for optimal upload"
              : "Videos limited to 60 seconds"}
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
  });
  const [selectedImage, setSelectedImage] = useState<MediaFile | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<MediaFile | null>(null);
  const [loading, setLoading] = useState({ image: false, video: false });
  const [uploading, setUploading] = useState(false);

  // Video player for preview
  const videoPlayer = useVideoPlayer(selectedVideo?.uri || "", (player) => {
    player.loop = true;
    player.play();
  });

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

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      videoMaxDuration: mediaType === "video" ? 60 : undefined,
    });

    if (!result.canceled && result.assets[0]) {
      // Filter based on the desired media type
      const asset = result.assets[0];
      const assetType = asset.type === "video" ? "video" : "image";

      if (assetType === mediaType) {
        await handleMediaSelection(asset, mediaType);
      } else {
        Alert.alert(
          "Wrong Media Type",
          `Please select a ${mediaType} instead.`
        );
      }
    }
  };

  const openLibrary = async (mediaType: "image" | "video") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      videoMaxDuration: mediaType === "video" ? 60 : undefined,
    });

    if (!result.canceled && result.assets[0]) {
      // Filter based on the desired media type
      const asset = result.assets[0];
      const assetType = asset.type === "video" ? "video" : "image";

      if (assetType === mediaType) {
        await handleMediaSelection(asset, mediaType);
      } else {
        Alert.alert(
          "Wrong Media Type",
          `Please select a ${mediaType} instead.`
        );
      }
    }
  };

  const handleMediaSelection = async (
    asset: ImagePicker.ImagePickerAsset,
    mediaType: "image" | "video"
  ) => {
    setLoading((prev) => ({ ...prev, [mediaType]: true }));
    try {
      const finalUri = asset.uri;

      // Check initial file size
      const fileSize = await checkFileSize(asset.uri);
      const fileSizeMB = fileSize / (1024 * 1024);

      console.log(`Selected ${mediaType} size: ${fileSizeMB.toFixed(2)}MB`);

      // Warn user about large files
      if (fileSizeMB > 45) {
        Alert.alert(
          "Large File Warning",
          `This ${mediaType} is ${fileSizeMB.toFixed(1)}MB. It might take longer to upload. ${
            mediaType === "image" ? "We'll compress it to reduce the size." : ""
          }`,
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
      // Compress image if it's an image
      if (mediaType === "image") {
        finalUri = await compressImage(asset.uri);
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
      "photoUrl",
      "videoUrl",
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

    if (isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
      Alert.alert("Invalid Age", "Please enter a valid age.");
      return false;
    }

    if (!selectedImage && !selectedVideo) {
      Alert.alert(
        "Media Required",
        "Please select at least one photo or video for your pet."
      );
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

      // Save pet data to database
      const petData = {
        name: formData.name.trim(),
        breed: formData.breed.trim(),
        age: Number.parseInt(formData.age),
        gender: formData.gender.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
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
          text: "OK",
          onPress: () => router.back(),
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

  return (
    <View className="flex-1 mb-28 bg-gradient-to-b from-orange-50 to-white">
      <Header onBack={() => router.push("./managePets")} />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
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
        </View>

        <SubmitButton onPress={handleSubmit} uploading={uploading} />
      </ScrollView>
    </View>
  );
}
