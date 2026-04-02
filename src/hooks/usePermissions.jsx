import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

const PermissionsContext = createContext(undefined);

export function PermissionsProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (user) fetchUserPermissions();
    else { setProfile(null); setPermissions({}); setLoading(false); setInitialized(true); }
  }, [user]);

  async function fetchUserPermissions() {
    setLoading(true);
    try {
      // Fetch profile
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profErr) {
        console.error("Profile fetch error:", profErr);
      }

      if (prof) {
        setProfile(prof);

        // Fetch permissions
        const { data: perms, error: permErr } = await supabase
          .from("permissions")
          .select("*")
          .eq("profile_id", user.id);

        if (permErr) {
          console.error("Permissions fetch error:", permErr);
        }

        if (perms && perms.length > 0) {
          const permMap = {};
          perms.forEach(p => {
            permMap[p.module] = {
              can_view: p.can_view,
              can_create: p.can_create,
              can_edit: p.can_edit,
              can_delete: p.can_delete,
            };
          });
          setPermissions(permMap);
        }
      } else {
        // No profile found - user might be the owner without a profile row
        console.warn("No profile found for user:", user.id, user.email);
      }
    } catch (err) {
      console.error("Failed to fetch permissions:", err);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }

  /**
   * Check if the current user has a specific permission
   */
  function hasPermission(module, action = "can_view") {
    // If not initialized yet, grant access (prevents blank sidebar flash)
    if (!initialized) return true;
    
    // Owner always has all permissions
    if (profile?.role === "owner") return true;
    
    // If no profile exists, deny
    if (!profile) return false;

    const modulePerm = permissions[module];
    if (!modulePerm) return false;
    return !!modulePerm[action];
  }

  const isOwner = profile?.role === "owner";
  const isAdmin = profile?.role === "admin" || isOwner;

  return (
    <PermissionsContext.Provider value={{ 
      profile, 
      permissions, 
      hasPermission, 
      isOwner, 
      isAdmin, 
      loading,
      initialized,
      refetch: fetchUserPermissions 
    }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
}
