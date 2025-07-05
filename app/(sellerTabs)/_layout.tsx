import TabBar from "@/components/sellerTabBar";
import { Tabs } from "expo-router";
import React from "react";

export default function layout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
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
  )
}