"use client"

import { useRouter } from "expo-router";
import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from "react-native"
import { ChevronLeft, Calendar } from "lucide-react-native"

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

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

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
            <TouchableOpacity className="border border-gray-300 rounded-lg px-3 py-3 bg-white flex-row items-center">
              <Calendar size={20} color="#9CA3AF" className="mr-2" />
              <Text className="text-gray-500">Pick a date</Text>
            </TouchableOpacity>
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
            <Text className="text-sm text-gray-600 mb-2">Enter IG Network Link</Text>
            <TextInput
              value={formData.igNetworkLink}
              onChangeText={(text) => updateField("igNetworkLink", text)}
              className="border border-gray-300 rounded-lg px-3 py-3 bg-white"
              placeholder="https://instagram.com/johndoe"
              autoCapitalize="none"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Status<Text style={{ color: "#FF0000" }}> *</Text></Text>
            <TouchableOpacity className="border border-gray-300 rounded-lg px-3 py-3 bg-white flex-row items-center justify-between">
              <Text className="text-gray-500">Select status</Text>
              <Text className="text-gray-400">▼</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-600 mb-2">Pronouns<Text style={{ color: "#FF0000" }}> *</Text></Text>
            <TouchableOpacity className="border border-gray-300 rounded-lg px-3 py-3 bg-white flex-row items-center justify-between">
              <Text className="text-gray-500">Select pronouns</Text>
              <Text className="text-gray-400">▼</Text>
            </TouchableOpacity>
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
          <TouchableOpacity className="flex-1 bg-blue-600 rounded-lg py-4">
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
