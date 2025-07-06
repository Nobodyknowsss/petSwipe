import { useEffect, useState } from "react";
import { useAuth } from "../../app/provider/AuthProvider";
import { supabase } from "../../utils/supabase";

export const useLikedVideosCount = () => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      if (!user) return;

      try {
        // Count likes on videos that the current user posted (not videos they liked)
        const { count: receivedLikes, error } = await supabase
          .from("Like")
          .select("*", { count: "exact", head: true })
          .eq("video_user_id", user.id); // Changed from user_id to video_user_id

        if (error) {
          console.error("Error fetching received likes count:", error);
        } else {
          setCount(receivedLikes || 0);
        }
      } catch (error) {
        console.error("Error in fetchCount:", error);
      }
    };

    fetchCount();
  }, [user]);

  return count;
};
