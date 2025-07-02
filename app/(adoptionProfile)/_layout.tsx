import { Stack } from "expo-router"

export default function layout() {
  return (
    <Stack>
      <Stack.Screen name="page" options={{ headerShown: false }} />
    </Stack>
  )
}
