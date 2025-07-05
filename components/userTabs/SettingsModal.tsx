"use client";

import { Modal, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../app/provider/AuthProvider";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsModal({
  visible,
  onClose,
}: SettingsModalProps) {
  const { user, SignOut, loading } = useAuth();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="p-6 bg-white rounded-t-3xl max-h-2/3">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">Settings</Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-2xl text-gray-500">✕</Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-4">
            <TouchableOpacity className="py-4 border-b border-gray-200">
              <Text className="font-medium text-gray-700">Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-4 border-b border-gray-200">
              <Text className="font-medium text-gray-700">Privacy</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-4 border-b border-gray-200">
              <Text className="font-medium text-gray-700">Help & Support</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-4 border-b border-gray-200">
              <Text className="font-medium text-gray-700">About</Text>
            </TouchableOpacity>

            {user && (
              <TouchableOpacity
                className={`w-full py-4 rounded-xl mt-6 ${loading ? "opacity-70" : ""}`}
                style={{ backgroundColor: loading ? "#D1D5DB" : "#FF2D55" }}
                onPress={() => {
                  onClose();
                  SignOut();
                }}
                disabled={loading}
              >
                <Text className="text-lg font-bold text-center text-white">
                  {loading ? "Signing Out..." : "Sign Out"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
