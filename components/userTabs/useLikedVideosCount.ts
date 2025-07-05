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
        const { count: likedCount, error } = await supabase
          .from("Like")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching liked videos count:", error);
        } else {
          setCount(likedCount || 0);
        }
      } catch (error) {
        console.error("Error in fetchCount:", error);
      }
    };

    fetchCount();
  }, [user]);

  return count;
};
