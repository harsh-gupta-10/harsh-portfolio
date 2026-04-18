import { useState } from "react";
import { Plus, Trash2, Save, X, Check } from "lucide-react";
import initialData from "../../data/certificates.json";
import { saveDataFile } from "../../lib/localAdmin";

function CertCard({ cert, onDelete, showDelete }) {
  return (
    <div className="relative group rounded-2xl overflow-hidden" style={{ background: "#1e293b", border: "1px solid #334155" }}>
      <div className="aspect-[4/3] overflow-hidden">
        <img src={cert.image} alt={cert.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" onError={(e) => { e.target.style.display = "none"; }} />
      </div>
      <div className="p-3 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-300 truncate">{cert.title}</span>
        {showDelete && (
          <button onClick={onDelete} className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all ml-2 shrink-0">
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

function AddCertForm({ onAdd, onClose }) {
  const [form, setForm] = useState({ title: "", image: "" });

  const handleAdd = () => {
    if (!form.title.trim() || !form.image.trim()) return alert("Title and image path are required");
    onAdd(form);
    onClose();
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50";
  const inputStyle = { background: "#0f172a", border: "1px solid #334155" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-md rounded-3xl" style={{ background: "#1e293b", border: "1px solid #334155" }}>
        <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid #334155" }}>
          <h2 className="text-lg font-bold text-white">Add Certificate</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Certificate Title *</label>
            <input className={inputCls} style={inputStyle} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Techpreneur Award" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Image Path *</label>
            <input className={inputCls} style={inputStyle} value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} placeholder="/imgs/certificates/filename.webp" />
            <p className="text-xs text-slate-500 mt-1">Put the image in /public/imgs/certificates/ first</p>
          </div>
          {form.image && (
            <div className="rounded-xl overflow-hidden aspect-video" style={{ background: "#0f172a" }}>
              <img src={form.image} alt="preview" className="w-full h-full object-cover" onError={(e) => { e.target.src = ""; }} />
            </div>
          )}
        </div>
        <div className="flex gap-3 p-6" style={{ borderTop: "1px solid #334155" }}>
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm text-slate-400 hover:bg-white/5 border border-slate-700 transition-all">Cancel</button>
          <button onClick={handleAdd} className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 transition-all">
            Add Certificate
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PACertificates() {
  const [data, setData] = useState(JSON.parse(JSON.stringify(initialData)));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(null); // "row1" | "row2"

  const persist = async (updated) => {
    setSaving(true);
    try {
      await saveDataFile("certificates.json", updated);
      setData(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { alert("❌ " + e.message); }
    finally { setSaving(false); }
  };

  const deleteCert = async (row, idx) => {
    if (!window.confirm("Remove this certificate?")) return;
    const updated = { ...data, [row]: data[row].filter((_, i) => i !== idx) };
    await persist(updated);
  };

  const addCert = async (row, cert) => {
    const updated = { ...data, [row]: [...data[row], cert] };
    await persist(updated);
  };

  const move = async (row, idx, dir) => {
    const arr = [...data[row]];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= arr.length) return;
    [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
    await persist({ ...data, [row]: arr });
  };

  const renderRow = (row) => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white">
          {row === "row1" ? "Row 1 (Top)" : "Row 2 (Bottom)"}
          <span className="text-slate-500 text-sm font-normal ml-2">· {data[row]?.length || 0} certificates</span>
        </h2>
        <button
          onClick={() => setShowAdd(row)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-400 hover:bg-blue-500/10 transition-all border border-blue-500/20"
        >
          <Plus size={13} /> Add
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {(data[row] || []).map((cert, idx) => (
          <div key={idx} className="relative">
            <CertCard cert={cert} onDelete={() => deleteCert(row, idx)} showDelete />
            <div className="flex justify-center gap-1 mt-1">
              <button onClick={() => move(row, idx, -1)} disabled={idx === 0} className="text-slate-600 hover:text-slate-300 disabled:opacity-20 text-xs px-2">←</button>
              <button onClick={() => move(row, idx, 1)} disabled={idx === (data[row]?.length || 0) - 1} className="text-slate-600 hover:text-slate-300 disabled:opacity-20 text-xs px-2">→</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Certificates</h1>
          <p className="text-sm text-slate-400 mt-1">{(data.row1?.length || 0) + (data.row2?.length || 0)} total certificates in 2 rows</p>
        </div>
        {saved && <span className="flex items-center gap-1.5 text-sm text-emerald-400"><Check size={14} /> Saved to disk</span>}
      </div>

      <div className="space-y-10">
        {renderRow("row1")}
        <div style={{ borderTop: "1px solid #1e293b" }} className="pt-8">
          {renderRow("row2")}
        </div>
      </div>

      {showAdd && (
        <AddCertForm
          onAdd={(cert) => addCert(showAdd, cert)}
          onClose={() => setShowAdd(null)}
        />
      )}
    </div>
  );
}
