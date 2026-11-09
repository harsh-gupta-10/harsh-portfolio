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

      // Verify portfolio admin PIN in dev mode
      server.middlewares.use("/api/auth/verify-portfolio-pin", (req, res) => {
        if (req.method === "OPTIONS") {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          res.end();
          return;
        }
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
          try {
            const { pin } = JSON.parse(body);
            let expectedPin = process.env.PORTFOLIO_ADMIN_PIN;
            if (!expectedPin) {
              try {
                const devVars = fs.readFileSync(path.resolve(process.cwd(), ".dev.vars"), "utf-8");
                const m = devVars.match(/PORTFOLIO_ADMIN_PIN=(.*)/);
                if (m && m[1]) expectedPin = m[1].trim();
              } catch (e) {}
            }
            if (!expectedPin) {
              try {
                const envFile = fs.readFileSync(path.resolve(process.cwd(), ".env"), "utf-8");
                const m = envFile.match(/PORTFOLIO_ADMIN_PIN=(.*)/);
                if (m && m[1]) expectedPin = m[1].trim();
              } catch (e) {}
            }
            expectedPin = expectedPin || "5678";

            res.setHeader("Content-Type", "application/json");
            res.setHeader("Access-Control-Allow-Origin", "*");
            if (pin && String(pin).trim() === String(expectedPin).trim()) {
              res.end(JSON.stringify({ success: true, token: "dev-session-" + Date.now() }));
            } else {
              res.statusCode = 401;
              res.end(JSON.stringify({ success: false, error: "Invalid PIN" }));
            }
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });

      // Portfolio data endpoints in dev mode
      server.middlewares.use("/api/portfolio", async (req, res) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-portfolio-token");

        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.end();
          return;
        }

        const url = new URL(req.url, "http://localhost");
        const cleanPath = url.pathname.replace(/^\//, "");
        const rawSection = cleanPath.split("/")[0];

        const sectionMap = {
          projects: "allProjects.json",
          allprojects: "allProjects.json",
          experience: "experience.json",
          skills: "skills.json",
          about: "about.json",
          certificates: "certificates.json",
        };

        if (req.method === "GET") {
          res.setHeader("Content-Type", "application/json");
          if (!rawSection) {
            const all = {};
            for (const [sec, filename] of Object.entries(sectionMap)) {
              if (sec === "allprojects") continue;
              try {
                const content = fs.readFileSync(path.resolve(process.cwd(), "src/data", filename), "utf-8");
                all[sec] = JSON.parse(content);
              } catch (e) {
                all[sec] = null;
              }
            }
            res.end(JSON.stringify(all));
            return;
          }

          const filename = sectionMap[rawSection.toLowerCase()];
          if (!filename) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: "Section not found" }));
            return;
          }

          try {
            const content = fs.readFileSync(path.resolve(process.cwd(), "src/data", filename), "utf-8");
            res.end(content);
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
          return;
        }

        if (req.method === "POST" || req.method === "PUT") {
          const filename = sectionMap[rawSection.toLowerCase()];
          if (!filename) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Invalid section" }));
            return;
          }

          let body = "";
          req.on("data", (chunk) => (body += chunk));
          req.on("end", () => {
            try {
              const payload = JSON.parse(body);
              const content = (payload && typeof payload === "object" && "content" in payload)
                ? payload.content
                : (payload && typeof payload === "object" && "data" in payload && !Array.isArray(payload))
                  ? payload.data
                  : payload;

              const targetFile = path.resolve(process.cwd(), "src/data", filename);
              fs.writeFileSync(targetFile, JSON.stringify(content, null, 2), "utf-8");
              if (filename === "allProjects.json") {
                const projectsFile = path.resolve(process.cwd(), "src/data", "projects.json");
                fs.writeFileSync(projectsFile, JSON.stringify(content, null, 2), "utf-8");
              }

              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: true, section: rawSection }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end(JSON.stringify({ error: "Method not allowed" }));
      });

      console.log("  ➜  [local-admin] File write API active at POST /api/write-file");
      console.log("  ➜  [local-admin] Portfolio API active at /api/portfolio");
      console.log("  ➜  [local-admin] PIN verify API active at POST /api/auth/verify-portfolio-pin");
    },
  };
}
