/**
 * Saves a data object to a local file in src/data/ via the Vite dev server middleware.
 * Only works in development mode (npm run dev).
 * @param {string} filename - e.g. "allProjects.json"
 * @param {any} content - JSON-serializable data
 */
export async function saveDataFile(filename, content) {
  const filePath = `src/data/${filename}`;
  const res = await fetch("/api/write-file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filePath, content }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || "Failed to save file");
  }

  return await res.json();
}

export const DATA_FILES = {
  projects: "allProjects.json",
  certificates: "certificates.json",
  experience: "experience.json",
  skills: "skills.json",
  about: "about.json",
};
