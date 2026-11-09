import { useState, useEffect, useCallback } from "react";

export const DATA_FILES = {
  projects: "allProjects.json",
  certificates: "certificates.json",
  experience: "experience.json",
  skills: "skills.json",
  about: "about.json",
};

export const FILE_TO_SECTION = {
  "allProjects.json": "projects",
  "projects.json": "projects",
  "experience.json": "experience",
  "skills.json": "skills",
  "about.json": "about",
  "certificates.json": "certificates",
};

/**
 * Fetches portfolio section data from the database API (/api/portfolio/:section).
 * @param {string} section - e.g. "projects", "experience", "skills", "about", "certificates"
 */
export async function fetchPortfolioData(section) {
  const norm = FILE_TO_SECTION[section] || section;
  const res = await fetch(`/api/portfolio/${norm}`);
  if (!res.ok) {
    throw new Error(`Failed to load ${norm} data (status ${res.status})`);
  }
  return await res.json();
}

/**
 * Saves portfolio section data to the database API (/api/portfolio/:section).
 * Includes the portfolio unlock PIN session token in headers.
 * @param {string} section - e.g. "projects", "experience", etc.
 * @param {any} content - JSON-serializable data
 */
export async function savePortfolioData(section, content) {
  const norm = FILE_TO_SECTION[section] || section;
  const token = (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("pa_unlocked") : "") || "";

  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["x-portfolio-token"] = token;
  }

  const res = await fetch(`/api/portfolio/${norm}`, {
    method: "POST",
    headers,
    body: JSON.stringify(content),
  });

  if (!res.ok) {
    // If not ok, try write-file fallback
    try {
      const filePath = `src/data/${DATA_FILES[norm] || `${norm}.json`}`;
      const fallbackRes = await fetch("/api/write-file", {
        method: "POST",
        headers,
        body: JSON.stringify({ filePath, content }),
      });
      if (fallbackRes.ok) return await fallbackRes.json();
    } catch {}

    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || err.message || "Failed to save portfolio data");
  }

  return await res.json();
}

/**
 * Backward compatibility wrapper for existing portfolio admin components.
 * Saves data to the database (and file if in dev mode).
 */
export async function saveDataFile(filename, content) {
  const section = FILE_TO_SECTION[filename] || filename.replace(/\.json$/, "");
  return savePortfolioData(section, content);
}

/**
 * React hook to fetch portfolio data from DB with instant fallback to bundled JSON.
 */
export function usePortfolioData(section, initialFallback) {
  const [data, setData] = useState(initialFallback);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const live = await fetchPortfolioData(section);
      if (live && (Array.isArray(live) ? live.length > 0 : Object.keys(live).length > 0)) {
        setData(live);
      }
    } catch (e) {
      // Keep initialFallback
    } finally {
      setLoading(false);
    }
  }, [section]);

  useEffect(() => {
    reload();
  }, [reload]);

  return [data, setData, loading, reload];
}
