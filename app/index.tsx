import { Redirect } from "expo-router";
import React from "react";

export default function Index() {
  // For now, redirect to userTabs
  return <Redirect href="/(userTabs)/home" />;
}
