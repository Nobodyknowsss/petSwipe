"use client"

import { useRouter } from "expo-router";
import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Modal, Pressable, Alert } from "react-native"
import { ChevronLeft, Calendar } from "lucide-react-native"
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AdoptionApplication() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    email: "",
    birthDate: "",
    occupation: "",
    companyName: "",
    instagramHandle: "",
    igNetworkLink: "",
    status: "",
    pronouns: "",
    adoptedBefore: "",
    altFirstName: "",
    altLastName: "",
    relationship: "",
    altPhone: "",
    altEmail: "",
    adoptionType: "",
    specificAnimal: "",
    petDescription: "",
  })
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showPronounsPicker, setShowPronounsPicker] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("adoptionFormData");
      if (saved) setFormData(JSON.parse(saved));
    })();
  }, []);

  const saveFormData = async (data) => {
    await AsyncStorage.setItem("adoptionFormData", JSON.stringify(data));
  }

  const updateField = (field: string, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    saveFormData(updated);
  }

  const handleSubmit = async () => {
    try {
      // Replace with backend endpoint
      // const response = await fetch("https://your-backend-url.com/api/adoption-application", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });
      // if (!response.ok) throw new Error("Failed to submit");

      await AsyncStorage.setItem("adoptionProfileForm", JSON.stringify(formData));
      Alert.alert("Success", "Your application has been saved!");
      // router.push("/(userTabs)/profile");
    } catch (error) {
      Alert.alert("Error", "Could not save application. Please try again later.");
    }
  };

  const statusOptions = ["Single", "Married", "Divorced", "Widowed"];
  const pronounsOptions = ["He/Him", "She/Her", "They/Them", "Other"];

  const RadioButton = ({
    options,
    selectedValue,
    onSelect,
    containerClass = "flex-row flex-wrap gap-3",
  }: {
    options: string[]
    selectedValue: string
    onSelect: (value: string) => void
    containerClass?: string
  }) => (
    <View className={containerClass}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => onSelect(option)}
          className={`px-4 py-2 rounded-lg border ${
            selectedValue === option ? "bg-blue-50 border-blue-500" : "bg-white border-gray-300"
          }`}
        >
          <Text className={`text-sm ${selectedValue === option ? "text-blue-700" : "text-gray-700"}`}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity className="mr-3"
          onPress={() => router.push("/(userTabs)/profile")}
        >
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Adoption Application</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Applicant's Information */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-4">Applicant&apos;s Information</Text>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-sm text-gray-600 mb-2">First Name<Text style={{ color: "#FF0000" }}> *</Text></Text>
              <TextInput
                value={formData.firstName}
                onChangeText={(text) => updateField("firstName", text)}
                className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
                placeholder="First Name"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-gray-600 mb-2">Last Name<Text style={{ color: "#FF0000" }}> *</Text></Text>
              <TextInput
                value={formData.lastName}
                onChangeText={(text) => updateField("lastName", text)}
                className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
                placeholder="Last Name"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Address<Text style={{ color: "#FF0000" }}> *</Text></Text>
            <TextInput
              value={formData.address}
              onChangeText={(text) => updateField("address", text)}
              className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
              placeholder="Address"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Phone<Text style={{ color: "#FF0000" }}> *</Text></Text>
            <TextInput
              value={formData.phone}
              onChangeText={(text) => updateField("phone", text)}
              className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
              placeholder="Phone"
              keyboardType="phone-pad"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Email<Text style={{ color: "#FF0000" }}> *</Text></Text>
            <TextInput
              value={formData.email}
              onChangeText={(text) => updateField("email", text)}
              className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Birth Date<Text style={{ color: "#FF0000" }}> *</Text></Text>
            <TouchableOpacity
              className="border border-gray-300 rounded-lg px-3 py-3 bg-white flex-row items-center"
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Calendar size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
              <Text className={formData.birthDate ? "text-gray-800" : "text-gray-500"}>
                {formData.birthDate
                  ? new Date(formData.birthDate).toLocaleDateString()
                  : "Pick a date"}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.birthDate ? new Date(formData.birthDate) : new Date()}
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={(_, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    updateField("birthDate", selectedDate.toISOString());
                  }
                }}
              />
            )}
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Occupation</Text>
            <TextInput
              value={formData.occupation}
              onChangeText={(text) => updateField("occupation", text)}
              className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
              placeholder="Occupation"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Company/Business Name<Text style={{ color: "#FF0000" }}> *</Text></Text>
            <TextInput
              value={formData.companyName}
              onChangeText={(text) => updateField("companyName", text)}
              className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
              placeholder="Company/Business Name"
            />
            <Text className="text-xs text-gray-400 mt-1">Please type N/A if unemployed</Text>
          </View>

          <View className="mb-6">
            <Text className="text-sm text-gray-600 mb-2">Instagram Handle</Text>
            <TextInput
              value={formData.instagramHandle}
              onChangeText={(text) => updateField("instagramHandle", text)}
              className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
              placeholder="Instagram Handle"
            />
          </View>
        </View>

        {/* Social Media Profile */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-4">Social Media Profile</Text>
          <Text className="text-xs text-gray-400 mb-4">Please type N/A if unemployed</Text>

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Instagram Handle</Text>
            <TextInput
              value={formData.instagramHandle}
              onChangeText={(text) => updateField("instagramHandle", text)}
              className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
              placeholder="Instagram Handle"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">
              Status<Text style={{ color: "#FF0000" }}> *</Text>
            </Text>
            <TouchableOpacity
              className="border border-gray-300 rounded-lg px-3 py-3 bg-white flex-row items-center justify-between"
              onPress={() => setShowStatusPicker(true)}
            >
              <Text className={formData.status ? "text-gray-800" : "text-gray-500"}>
                {formData.status || "Select status"}
              </Text>
              <Text className="text-gray-400">▼</Text>
            </TouchableOpacity>
            {/* Status Picker Modal */}
            <Modal
              visible={showStatusPicker}
              transparent
              animationType="fade"
              onRequestClose={() => setShowStatusPicker(false)}
            >
              <Pressable
                style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)" }}
                onPress={() => setShowStatusPicker(false)}
              >
                <View style={{
                  backgroundColor: "#fff",
                  margin: 40,
                  borderRadius: 10,
                  padding: 20,
                  elevation: 5,
                  justifyContent: "center"
                }}>
                  {statusOptions.map(option => (
                    <TouchableOpacity
                      key={option}
                      className="py-3"
                      onPress={() => {
                        updateField("status", option);
                        setShowStatusPicker(false);
                      }}
                    >
                      <Text className="text-base">{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Pressable>
            </Modal>
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">
              Pronouns<Text style={{ color: "#FF0000" }}> *</Text>
            </Text>
            <TouchableOpacity
              className="border border-gray-300 rounded-lg px-3 py-3 bg-white flex-row items-center justify-between"
              onPress={() => setShowPronounsPicker(true)}
            >
              <Text className={formData.pronouns ? "text-gray-800" : "text-gray-500"}>
                {formData.pronouns || "Select pronouns"}
              </Text>
              <Text className="text-gray-400">▼</Text>
            </TouchableOpacity>
            {/* Pronouns Picker Modal */}
            <Modal
              visible={showPronounsPicker}
              transparent
              animationType="fade"
              onRequestClose={() => setShowPronounsPicker(false)}
            >
              <Pressable
                style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)" }}
                onPress={() => setShowPronounsPicker(false)}
              >
                <View style={{
                  backgroundColor: "#fff",
                  margin: 40,
                  borderRadius: 10,
                  padding: 20,
                  elevation: 5,
                  justifyContent: "center"
                }}>
                  {pronounsOptions.map(option => (
                    <TouchableOpacity
                      key={option}
                      className="py-3"
                      onPress={() => {
                        updateField("pronouns", option);
                        setShowPronounsPicker(false);
                      }}
                    >
                      <Text className="text-base">{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Pressable>
            </Modal>
          </View>

          <View className="mb-6">
            <Text className="text-sm text-gray-600 mb-3">Have you adopted before?<Text style={{ color: "#FF0000" }}> *</Text></Text>
            <RadioButton
              options={["Yes", "No"]}
              selectedValue={formData.adoptedBefore}
              onSelect={(value) => updateField("adoptedBefore", value)}
            />
          </View>
        </View>

        {/* Alternate Contact */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-2">Alternate Contact</Text>
          <Text className="text-xs text-gray-400 mb-4">
            Adult: If the applicant is a minor, a parent or guardian must fill the alternate contact and we sign the
            adoption contract.
          </Text>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-sm text-gray-600 mb-2">First Name</Text>
              <TextInput
                value={formData.altFirstName}
                onChangeText={(text) => updateField("altFirstName", text)}
                className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
                placeholder="Jane"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-gray-600 mb-2">Last Name</Text>
              <TextInput
                value={formData.altLastName}
                onChangeText={(text) => updateField("altLastName", text)}
                className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
                placeholder="Doe"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Relationship</Text>
            <TextInput
              value={formData.relationship}
              onChangeText={(text) => updateField("relationship", text)}
              className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
              placeholder="Mother"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Phone</Text>
            <TextInput
              value={formData.altPhone}
              onChangeText={(text) => updateField("altPhone", text)}
              className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
              placeholder="(987) 654-3210"
              keyboardType="phone-pad"
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm text-gray-600 mb-2">Email</Text>
            <TextInput
              value={formData.altEmail}
              onChangeText={(text) => updateField("altEmail", text)}
              className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
              placeholder="jane.doe@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Questionnaire */}
        <View className="mb-8">
          <Text className="text-lg font-semibold mb-4">Questionnaire</Text>

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-3">What are you looking to adopt?<Text style={{ color: "#FF0000" }}> *</Text></Text>
            <RadioButton
              options={["Cat", "Dog", "Both", "Not decided"]}
              selectedValue={formData.adoptionType}
              onSelect={(value) => updateField("adoptionType", value)}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-3">Are you applying to adopt a specific shelter animal?<Text style={{ color: "#FF0000" }}> *</Text></Text>
            <RadioButton
              options={["Yes", "No"]}
              selectedValue={formData.specificAnimal}
              onSelect={(value) => updateField("specificAnimal", value)}
            />
          </View>

          <View className="mb-8">
            <Text className="text-sm text-gray-600 mb-2">Describe your ideal pet, including its sex, age, etc.</Text>
            <TextInput
              value={formData.petDescription}
              onChangeText={(text) => updateField("petDescription", text)}
              className="border border-gray-300 rounded-lg px-3 py-3 bg-white min-h-[100px]"
              placeholder="e.g., A playful male puppy, around 6 months old, good with kids."
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 mb-8">
          <TouchableOpacity 
            className="flex-1 bg-blue-600 rounded-lg py-4"
            onPress={handleSubmit}
          >
            <Text className="text-white text-center font-semibold text-base">Submit Application</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 border border-gray-300 rounded-lg py-4">
            <Text className="text-gray-700 text-center font-semibold text-base">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
