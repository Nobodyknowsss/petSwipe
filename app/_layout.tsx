import { Stack } from "expo-router";
import React from "react";
import "../global.css";

export default function layout() {
  return (
    <Stack>
      <Stack.Screen
        name="(userTabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(adminTabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
