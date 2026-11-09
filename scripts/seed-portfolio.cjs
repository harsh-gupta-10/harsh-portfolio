const fs = require("fs");
const path = require("path");

const files = {
  projects: path.resolve(__dirname, "../src/data/allProjects.json"),
  experience: path.resolve(__dirname, "../src/data/experience.json"),
  skills: path.resolve(__dirname, "../src/data/skills.json"),
  about: path.resolve(__dirname, "../src/data/about.json"),
  certificates: path.resolve(__dirname, "../src/data/certificates.json")
};

const statements = [];
for (const [id, filePath] of Object.entries(files)) {
  const content = fs.readFileSync(filePath, "utf-8").trim();
  JSON.parse(content); // Validate JSON format
  const escaped = content.replace(/'/g, "''");
  statements.push(`INSERT INTO app_rows (tbl, id, body) VALUES ('portfolio', '${id}', '${escaped}') ON CONFLICT(tbl, id) DO UPDATE SET body = excluded.body;`);
}

const outDir = path.resolve(__dirname, "../d1");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const outFile = path.join(outDir, "seed_portfolio.sql");
fs.writeFileSync(outFile, statements.join("\n\n"), "utf-8");
console.log(`Generated ${outFile} with ${statements.length} seed statements.`);
