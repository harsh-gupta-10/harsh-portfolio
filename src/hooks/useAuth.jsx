import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    // After successful sign-in, verify the user has an active profile
    // Use the session from the sign-in response to ensure auth context is set
    if (data?.user) {
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("id, role, is_active")
        .eq("id", data.user.id)
        .maybeSingle();

      if (!profile) {
        // No profile yet — auto-create for the owner email, otherwise block
        if (email.toLowerCase() === "harshgupta24716@gmail.com") {
          // Owner fallback: create profile if missing
          await supabase.from("profiles").upsert({
            id: data.user.id,
            full_name: "Harsh Gupta",
            email: email,
            role: "owner",
            is_active: true,
          });
        } else {
          await supabase.auth.signOut();
          return { error: "No profile found. Contact the admin for access." };
        }
      } else if (!profile.is_active) {
        await supabase.auth.signOut();
        return { error: "Your account has been deactivated. Contact the admin." };
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
