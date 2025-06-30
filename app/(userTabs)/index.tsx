import { Text, View } from "react-native";
import "../../global.css";

export default function App() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="p-2 w-full text-xl font-bold text-center text-red-500 bg-blue-500 rounded-lg border">
        Welcome to Nativewind!
      </Text>
    </View>
  );
}
