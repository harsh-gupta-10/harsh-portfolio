import fs from "fs";
import path from "path";

/**
 * Vite plugin: Local Admin File Writer
 * Exposes POST /api/write-file in dev mode only.
 * Allows the Portfolio Admin UI to save edits directly to src/data/*.json files on disk.
 */
export default function vitePluginLocalAdmin() {
  return {
    name: "vite-plugin-local-admin",
    configureServer(server) {
      server.middlewares.use("/api/write-file", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
          try {
            const { filePath, content } = JSON.parse(body);

            // Security: only allow writes within src/data/
            if (!filePath || filePath.includes("..") || !filePath.startsWith("src/data/")) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "Invalid file path. Only src/data/ files allowed." }));
              return;
            }

            const absolutePath = path.resolve(process.cwd(), filePath);
            fs.writeFileSync(absolutePath, JSON.stringify(content, null, 2), "utf-8");

            res.setHeader("Content-Type", "application/json");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.end(JSON.stringify({ success: true, filePath }));
          } catch (err) {
            console.error("[local-admin] write error:", err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });

      // CORS preflight
      server.middlewares.use("/api/write-file", (req, res) => {
        if (req.method === "OPTIONS") {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          res.end();
        }
      });

      console.log("  ➜  [local-admin] File write API active at POST /api/write-file");
    },
  };
}
