import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../supabase";

const USER_COLORS = [
  "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#3b82f6", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f43f5e",
  "#06b6d4",
];

function getUserColor(userId) {
  if (!userId) return USER_COLORS[0];
  const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return USER_COLORS[hash % USER_COLORS.length];
}

// Generate a stable guest identity once per session
function getGuestIdentity() {
  const key = "whiteboard-guest-identity";
  const existing = sessionStorage.getItem(key);
  if (existing) return JSON.parse(existing);
  const id = `guest_${Math.random().toString(36).substr(2, 9)}`;
  const name = `Guest ${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  const identity = { id, name };
  sessionStorage.setItem(key, JSON.stringify(identity));
  return identity;
}

export function useRealtimeCanvas({ noteId, user, onRemoteChange }) {
  const [liveMode, setLiveMode] = useState(() => {
    if (!noteId) return false;
    const saved = localStorage.getItem(`whiteboard-live-${noteId}`);
    return saved === "true";
  });

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [toasts, setToasts] = useState([]);

  const channelRef = useRef(null);
  const isSyncing = useRef(false);
  const cursorThrottleRef = useRef(null);
  const pendingUpdate = useRef(null);
  // Store callback in ref to avoid re-triggering effect
  const onRemoteChangeRef = useRef(onRemoteChange);
  useEffect(() => { onRemoteChangeRef.current = onRemoteChange; }, [onRemoteChange]);

  const addToast = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // Stable identity — computed once and stored in a ref
  const identityRef = useRef(null);
  if (!identityRef.current) {
    if (user?.id) {
      identityRef.current = {
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin",
      };
    } else {
      identityRef.current = getGuestIdentity();
    }
  }
  // Update name if user logs in after mount
  useEffect(() => {
    if (user?.id) {
      identityRef.current = {
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin",
      };
    }
  }, [user]);

  useEffect(() => {
    if (!noteId) return;
    localStorage.setItem(`whiteboard-live-${noteId}`, liveMode);

    if (!liveMode) {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setConnectionStatus("disconnected");
      setOnlineUsers([]);
      setRemoteCursors({});
      return;
    }

    setConnectionStatus("connecting");

    const { id: userId, name: userName } = identityRef.current;
    const userColor = getUserColor(userId);

    const channel = supabase.channel(`whiteboard:${noteId}`, {
      config: {
        presence: { key: userId },
        broadcast: { self: false },
      }
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat();
        setOnlineUsers(users);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        newPresences.forEach(p => addToast(`👋 ${p.userName} joined`, "join"));
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        leftPresences.forEach(p => addToast(`${p.userName} left`, "leave"));
      })
      .on("broadcast", { event: "cursor-move" }, ({ payload }) => {
        setRemoteCursors(prev => ({
          ...prev,
          [payload.userId]: { ...payload, lastActive: Date.now() }
        }));
      })
      .on("broadcast", { event: "canvas-change" }, ({ payload }) => {
        if (payload.userId === userId) return;

        // Conflict resolution: Last write wins
        if (pendingUpdate.current) {
          if (payload.timestamp > pendingUpdate.current.timestamp) {
            pendingUpdate.current = payload;
          }
        } else {
          pendingUpdate.current = payload;
          setTimeout(() => {
            if (pendingUpdate.current && onRemoteChangeRef.current) {
              isSyncing.current = true;
              onRemoteChangeRef.current(pendingUpdate.current.canvasJSON);
              isSyncing.current = false;
              pendingUpdate.current = null;
            }
          }, 100);
        }
      })
      .subscribe(async (status) => {
        setConnectionStatus(status === "SUBSCRIBED" ? "connected" : "connecting");
        if (status === "SUBSCRIBED") {
          await channel.track({
            userId,
            userName,
            color: userColor,
            joinedAt: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        channelRef.current.untrack();
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  // Only re-run when liveMode or noteId changes — NOT on user/callback changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveMode, noteId]);

  // Broadcasting current user canvas changes
  const broadcastChange = useCallback((canvasJSON) => {
    if (!channelRef.current || isSyncing.current || !liveMode) return;
    channelRef.current.send({
      type: "broadcast",
      event: "canvas-change",
      payload: {
        userId: identityRef.current.id,
        canvasJSON,
        timestamp: Date.now(),
      }
    });
  }, [liveMode]);

  const broadcastCursor = useCallback((x, y) => {
    if (!channelRef.current || !liveMode || cursorThrottleRef.current) return;
    cursorThrottleRef.current = setTimeout(() => {
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "cursor-move",
          payload: {
            userId: identityRef.current.id,
            userName: identityRef.current.name,
            color: getUserColor(identityRef.current.id),
            x,
            y
          }
        });
      }
      cursorThrottleRef.current = null;
    }, 50);
  }, [liveMode]);

  // Auto-cleanup idle cursors
  useEffect(() => {
    const interval = setInterval(() => {
      setRemoteCursors(prev => {
        const now = Date.now();
        const next = { ...prev };
        let changed = false;
        Object.entries(next).forEach(([id, c]) => {
          if (now - c.lastActive > 5000) {
            delete next[id];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    liveMode,
    setLiveMode,
    remoteCursors,
    onlineUsers,
    connectionStatus,
    broadcastChange,
    broadcastCursor,
    isSyncing,
    toasts,
    currentUserId: identityRef.current?.id,
  };
}
