import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Logger } from "../utils/Logger";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../supabase/supabase";
import { Profile } from "../../types/models";

interface AuthContextType {
  isLoading: boolean;
  session: Session | null | undefined;
  profile: Profile | null;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null | undefined>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch the session once, and subscribe to auth state changes
  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        Logger.error("Error fetching session:", error);
      }
      setSession(currentSession);
      setIsLoading(false);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch the profile when the session changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) {
          Logger.error("Error fetching profile:", error);
        }
        setProfile(data ? new Profile(data) : null);
      } else {
        setProfile(null);
      }
    };

    fetchProfile();
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        session,
        profile,
        isLoggedIn: !!session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
