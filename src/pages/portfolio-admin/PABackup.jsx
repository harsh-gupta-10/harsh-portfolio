import { useState } from "react";
import { Download, Upload, Check, AlertTriangle, Package } from "lucide-react";
import { saveDataFile } from "../../lib/localAdmin";

// Dynamic import of all data files
import projectsData from "../../data/allProjects.json";
import experienceData from "../../data/experience.json";
import skillsData from "../../data/skills.json";
import aboutData from "../../data/about.json";
import certData from "../../data/certificates.json";

const ALL_FILES = {
  "allProjects.json": projectsData,
  "experience.json": experienceData,
  "skills.json": skillsData,
  "about.json": aboutData,
  "certificates.json": certData,
};

export default function PABackup() {
  const [restoring, setRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState(null);

  const handleExport = () => {
    const backup = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      data: ALL_FILES,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoring(true);
    setRestoreStatus(null);

    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      if (!backup.data) throw new Error("Invalid backup file format");

      const results = [];
      for (const [filename, content] of Object.entries(backup.data)) {
        if (!Object.keys(ALL_FILES).includes(filename)) {
          results.push({ file: filename, status: "skipped", reason: "unknown file" });
          continue;
        }
        try {
          await saveDataFile(filename, content);
          results.push({ file: filename, status: "ok" });
        } catch (err) {
          results.push({ file: filename, status: "error", reason: err.message });
        }
      }

      setRestoreStatus({ success: true, results, exportedAt: backup.exportedAt });
    } catch (err) {
      setRestoreStatus({ success: false, error: err.message });
    } finally {
      setRestoring(false);
      e.target.value = "";
    }
  };

  const cardStyle = { background: "#1e293b", border: "1px solid #334155" };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Backup & Restore</h1>
        <p className="text-sm text-slate-400 mt-1">Download a full snapshot of all your portfolio data, or restore from a previous backup.</p>
      </div>

      {/* File overview */}
      <div className="rounded-2xl p-6" style={cardStyle}>
        <div className="flex items-center gap-2 mb-4">
          <Package size={18} className="text-blue-400" />
          <h2 className="font-semibold text-white">Current Data Files</h2>
        </div>
        <div className="space-y-2">
          {Object.entries(ALL_FILES).map(([filename, content]) => {
            const count = Array.isArray(content) ? content.length : typeof content === "object" ? Object.keys(content).length : "—";
            return (
              <div key={filename} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "#0f172a" }}>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 text-xs">●</span>
                  <span className="text-sm font-mono text-slate-300">{filename}</span>
                </div>
                <span className="text-xs text-slate-500">{count} {Array.isArray(content) ? "items" : "keys"}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Export */}
        <div className="rounded-2xl p-6 space-y-4" style={cardStyle}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Download size={20} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Export Backup</h3>
              <p className="text-xs text-slate-400">Download all data as a single JSON file</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-300 leading-relaxed">
              Creates a timestamped <code className="text-emerald-400 bg-emerald-400/10 px-1 rounded text-xs">portfolio-backup-YYYY-MM-DD.json</code> file containing all 5 data files.
            </p>
            <p className="text-xs text-slate-500">Store this somewhere safe as a snapshot before making big changes.</p>
          </div>
          <button
            onClick={handleExport}
            className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center justify-center gap-2"
          >
            <Download size={16} /> Export All Data
          </button>
        </div>

        {/* Import */}
        <div className="rounded-2xl p-6 space-y-4" style={cardStyle}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Upload size={20} className="text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Restore Backup</h3>
              <p className="text-xs text-slate-400">Upload a backup to restore your data</p>
            </div>
          </div>
          <div className="rounded-xl p-3" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200/70 leading-relaxed">
                This will <strong>overwrite</strong> your current local files with the backup contents. Make sure you have a fresh export first.
              </p>
            </div>
          </div>
          <label
            className={`w-full py-3 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer ${
              restoring
                ? "bg-amber-600/50 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
            }`}
          >
            {restoring ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Upload size={16} />}
            {restoring ? "Restoring..." : "Upload Backup File"}
            <input type="file" accept=".json" className="hidden" onChange={handleImport} disabled={restoring} />
          </label>
        </div>
      </div>

      {/* Restore results */}
      {restoreStatus && (
        <div
          className="rounded-2xl p-5"
          style={{
            background: restoreStatus.success ? "rgba(16,185,129,0.05)" : "rgba(239,68,68,0.05)",
            border: `1px solid ${restoreStatus.success ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}
        >
          {restoreStatus.success ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Check size={16} className="text-emerald-400" />
                <span className="font-semibold text-emerald-400">Restore Complete</span>
                {restoreStatus.exportedAt && (
                  <span className="text-xs text-slate-500">· Backup from {new Date(restoreStatus.exportedAt).toLocaleString()}</span>
                )}
              </div>
              <div className="space-y-1.5">
                {restoreStatus.results.map((r) => (
                  <div key={r.file} className="flex items-center gap-2 text-sm">
                    <span className={r.status === "ok" ? "text-emerald-400" : r.status === "skipped" ? "text-slate-500" : "text-red-400"}>
                      {r.status === "ok" ? "✓" : r.status === "skipped" ? "–" : "✗"}
                    </span>
                    <span className="font-mono text-slate-300">{r.file}</span>
                    {r.reason && <span className="text-slate-500 text-xs">({r.reason})</span>}
                  </div>
                ))}
              </div>
              <p className="text-xs text-emerald-300/60 mt-3">Reload the browser to see changes in the portfolio.</p>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-400">Restore Failed</p>
                <p className="text-sm text-red-300/70 mt-1">{restoreStatus.error}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
