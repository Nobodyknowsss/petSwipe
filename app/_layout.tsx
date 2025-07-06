import { Stack } from "expo-router";
import React from "react";
import "../global.css";
import { AuthProvider } from "./provider/AuthProvider";

export default function layout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(userTabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(verifiedTabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="(adoptionProfile)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(sellerTabs)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
