import TabBar from "@/components/verefiedTabBar";
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
        name="managePets"
        options={{
          title: "Manage",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="addPet"
        options={{
          title: "Add Pet",
          headerShown: false,
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="petsList"
        options={{
          title: "Pets List",
          headerShown: false,
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="adopters"
        options={{
          title: "Adopters",
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
