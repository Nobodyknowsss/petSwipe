import TabBar from "@/components/TabBar";
import { Tabs } from "expo-router";
import React from "react";

export default function layout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="myPets"
        options={{
          title: "My Pets",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: "Message",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
