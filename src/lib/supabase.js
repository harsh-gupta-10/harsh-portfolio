const listeners = new Set();

function notify(user) {
  for (const listener of listeners) listener("SIGNED_IN", user ? { user } : null);
}

async function execute(state) {
  const headers = { "content-type": "application/json" };
  const paToken = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("pa_unlocked") : null;
  if (paToken) {
    headers["Authorization"] = `Bearer ${paToken}`;
    headers["x-portfolio-token"] = paToken;
  }
  const response = await fetch("/api/query", {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(state),
  });
  const payload = await response.json().catch(() => ({ data: null, error: { message: "Request failed" } }));
  if (!response.ok && !payload.error) {
    return { data: null, error: { message: payload.message || "Request failed" } };
  }
  return payload;
}

function query(table) {
  const state = {
    op: "select",
    table,
    columns: "*",
    filters: [],
    orders: [],
    limit: null,
    mode: null,
    values: null,
    onConflict: null,
    returning: false,
  };
  const builder = {
    select(columns) {
      state.columns = columns || "*";
      state.returning = true;
      return builder;
    },
    insert(values) {
      state.op = "insert";
      state.values = values;
      return builder;
    },
    update(values) {
      state.op = "update";
      state.values = values;
      return builder;
    },
    delete() {
      state.op = "delete";
      return builder;
    },
    upsert(values, options) {
      state.op = "upsert";
      state.values = values;
      state.onConflict = options?.onConflict || "id";
      return builder;
    },
    eq(col, val) {
      state.filters.push({ op: "eq", col, val });
      return builder;
    },
    order(column, options) {
      state.orders.push({ column, ascending: options?.ascending !== false });
      return builder;
    },
    limit(count) {
      state.limit = count;
      return builder;
    },
    single() {
      state.mode = "single";
      return builder;
    },
    maybeSingle() {
      state.mode = "maybeSingle";
      return builder;
    },
    then(resolve, reject) {
      return execute(state).then(resolve, reject);
    },
  };
  return builder;
}

function channel(name) {
  const handlers = { sync: [], join: [], leave: [], broadcast: {} };
  let socket = null;
  let presence = {};
  let known = new Map();
  let seen = false;
  const api = {
    on(type, filter, callback) {
      if (type === "presence" && filter?.event === "sync") handlers.sync.push(callback);
      if (type === "presence" && filter?.event === "join") handlers.join.push(callback);
      if (type === "presence" && filter?.event === "leave") handlers.leave.push(callback);
      if (type === "broadcast" && filter?.event) {
        handlers.broadcast[filter.event] = handlers.broadcast[filter.event] || [];
        handlers.broadcast[filter.event].push(callback);
      }
      return api;
    },
    subscribe(callback) {
      const protocol = location.protocol === "https:" ? "wss:" : "ws:";
      socket = new WebSocket(`${protocol}//${location.host}/api/realtime?room=${encodeURIComponent(name)}`);
      socket.onopen = () => callback?.("SUBSCRIBED");
      socket.onclose = () => callback?.("CLOSED");
      socket.onerror = () => callback?.("CHANNEL_ERROR");
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "presence") applyPresence(data.users || []);
        if (data.type === "broadcast") {
          for (const fn of handlers.broadcast[data.event] || []) fn({ payload: data.payload });
        }
      };
      return api;
    },
    track(presenceData) {
      const send = () => socket?.readyState === WebSocket.OPEN && socket.send(JSON.stringify({ type: "track", presence: presenceData }));
      if (socket?.readyState === WebSocket.OPEN) send();
      else socket?.addEventListener("open", send, { once: true });
      return Promise.resolve();
    },
    send(message) {
      if (socket?.readyState !== WebSocket.OPEN) return;
      socket.send(JSON.stringify({ type: "broadcast", event: message.event, payload: message.payload }));
    },
    presenceState() {
      return presence;
    },
    untrack() {
      return Promise.resolve();
    },
    unsubscribe() {
      socket?.close();
      socket = null;
      return Promise.resolve();
    },
  };

  function applyPresence(users) {
    const next = new Map(users.filter((user) => user?.userId).map((user) => [user.userId, user]));
    if (seen) {
      const joined = [...next.values()].filter((user) => !known.has(user.userId));
      const left = [...known.values()].filter((user) => !next.has(user.userId));
      if (joined.length) for (const fn of handlers.join) fn({ newPresences: joined });
      if (left.length) for (const fn of handlers.leave) fn({ leftPresences: left });
    }
    seen = true;
    known = next;
    presence = {};
    for (const [id, user] of next) presence[id] = [user];
    for (const fn of handlers.sync) fn();
  }

  return api;
}

export const supabase = {
  from: query,
  channel,
  removeChannel(active) {
    return active?.unsubscribe();
  },
  auth: {
    async getSession() {
      const response = await fetch("/api/auth/session", { credentials: "include" });
      const payload = await response.json().catch(() => ({ user: null }));
      const session = payload.user ? { user: payload.user } : null;
      return { data: { session } };
    },
    onAuthStateChange(callback) {
      listeners.add(callback);
      this.getSession().then(({ data }) => callback("INITIAL_SESSION", data.session));
      return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
    },
    async signInWithPassword({ email, password }) {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json().catch(() => ({ message: "Login failed" }));
      if (!response.ok) return { data: { user: null }, error: { message: payload.message || "Invalid login credentials" } };
      notify(payload.user);
      return { data: { user: payload.user }, error: null };
    },
    async signUp({ email, password, options }) {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          invite_token: options?.data?.invite_token,
          full_name: options?.data?.full_name,
        }),
      });
      const payload = await response.json().catch(() => ({ message: "Signup failed" }));
      if (!response.ok) return { data: { user: null }, error: { message: payload.message || "Signup failed" } };
      notify(payload.user);
      return { data: { user: payload.user }, error: null };
    },
    async signOut() {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      notify(null);
    },
    async getUser() {
      const { data } = await this.getSession();
      return { data: { user: data.session?.user || null } };
    },
  },
  storage: {
    from(bucket) {
      return {
        async upload(path, file) {
          const response = await fetch(`/api/media?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(path)}`, {
            method: "POST",
            credentials: "include",
            headers: { "content-type": file.type || "application/octet-stream" },
            body: file,
          });
          if (!response.ok) {
            const payload = await response.json().catch(() => ({ message: "Upload failed" }));
            return { data: null, error: { message: payload.message || "Upload failed" } };
          }
          return { data: { path }, error: null };
        },
        getPublicUrl(path) {
          const publicUrl = `${location.origin}/api/media?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(path)}`;
          return { data: { publicUrl } };
        },
        async remove(paths) {
          for (const path of paths) {
            await fetch(`/api/media?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(path)}`, {
              method: "DELETE",
              credentials: "include",
            });
          }
          return { data: null, error: null };
        },
      };
    },
  },
};

export async function uploadMedia(file, bucket = "portfolio-images") {
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const { error } = await supabase.storage.from(bucket).upload(fileName, file);
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(fileName).data.publicUrl;
}
