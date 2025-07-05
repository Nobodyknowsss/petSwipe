import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import React from "react";
import { Alert } from "react-native";

interface User {
  id: string;
  email: string;
  username: string;
  verified: boolean;
  is_seller: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  SignIn: (email: string, password: string) => Promise<boolean>;
  SignUp: (
    email: string,
    password: string,
    username: string
  ) => Promise<boolean>;
  SignOut: () => Promise<void>;
  showToast: (message: string, type?: "success" | "error") => void;
  setUserState: (user: User | null) => void;
}

export const AuthContext = React.createContext<AuthContextType>({
  user: null,
  loading: false,
  SignIn: async () => false,
  SignUp: async () => false,
  SignOut: async () => {},
  showToast: () => {},
  setUserState: () => {},
});

export const useAuth = () => React.useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    Alert.alert(
      type === "success" ? "Success" : "Error",
      message,
      [{ text: "OK" }],
      { cancelable: true }
    );
  };

  const getUser = async (id: string) => {
    const { data, error } = await supabase
      .from("User")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching user data:", error.message);
      showToast("Failed to fetch user data", "error");
      return;
    }

    setUser(data);
    if (data.verified) {
      router.replace("/(verifiedTabs)/home");
    } else if (data.is_seller === true) {
      router.replace("/(sellerTabs)/products");
    }else {
      router.replace("/(userTabs)/home");
    }
  };

  const SignIn = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Error logging in:", error.message);
        showToast(error.message, "error");
        return false;
      }

      await getUser(data.user.id);
      showToast("Welcome back!", "success");
      return true;
    } catch (error) {
      showToast("Login failed. Please try again.", "error");
      console.log(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const SignUp = async (
    email: string,
    password: string,
    username: string
  ): Promise<boolean> => {
    if (!email || !email.includes("@") || !password || !username) {
      showToast("Please fill in all fields correctly.", "error");
      return false;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Error signing up:", error.message);
        showToast(error.message, "error");
        return false;
      }

      const { error: insertError } = await supabase.from("User").insert({
        id: data.user?.id,
        email: email,
        username: username,
      });

      if (insertError) {
        console.error("Error saving user data:", insertError.message);
        showToast("Failed to save user data", "error");
        return false;
      }

      if (data.user?.id) {
        await getUser(data.user.id);
        showToast(
          "Account created successfully! please check your email",
          "success"
        );
        return true;
      }
      return false;
    } catch (error) {
      showToast("Sign up failed. Please try again.", "error");
      console.log(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const SignOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error.message);
        showToast("Failed to sign out", "error");
      } else {
        showToast("Signed out successfully", "success");
        router.replace("/(auth)/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const setUserState = (user: User | null) => {
    setUser(user);
  };

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        getUser(session.user.id);
      } else {
        router.replace("/(auth)/login");
      }
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        SignIn,
        SignOut,
        SignUp,
        showToast,
        setUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
