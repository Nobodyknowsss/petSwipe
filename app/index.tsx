import { ActivityIndicator, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#FF7200FF" />
    </View>
  );
}
