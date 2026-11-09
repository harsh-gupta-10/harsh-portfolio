import { DurableObject } from "cloudflare:workers";

export class WhiteboardRoom extends DurableObject {
  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, message) {
    let data;
    try {
      data = JSON.parse(message);
    } catch {
      return;
    }
    if (data.type === "track" && data.presence) {
      ws.serializeAttachment(data.presence);
      this.#pushPresence();
      return;
    }
    if (data.type === "broadcast") {
      const raw = JSON.stringify({ type: "broadcast", event: data.event, payload: data.payload });
      for (const peer of this.ctx.getWebSockets()) {
        if (peer === ws) continue;
        try { peer.send(raw); } catch { /* closed socket */ }
      }
    }
  }

  async webSocketClose() {
    this.#pushPresence();
  }

  #pushPresence() {
    const users = this.ctx.getWebSockets()
      .map((sock) => sock.deserializeAttachment())
      .filter(Boolean);
    const raw = JSON.stringify({ type: "presence", users });
    for (const sock of this.ctx.getWebSockets()) {
      try { sock.send(raw); } catch { /* closed socket */ }
    }
  }
}
