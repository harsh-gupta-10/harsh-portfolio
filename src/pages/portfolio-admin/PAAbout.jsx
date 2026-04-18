import { useState } from "react";
import { Plus, Trash2, Save, X, Check, Pencil } from "lucide-react";
import initialData from "../../data/about.json";
import { saveDataFile } from "../../lib/localAdmin";

const ICON_KEYS = [
  "FiMonitor","FiCode","FiCpu","FiLayers","FiBox","FiTool","FiPenTool","FiSmartphone","FiGrid","FiFileText",
];

export default function PAAbout() {
  const [data, setData] = useState(JSON.parse(JSON.stringify(initialData)));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateBio = (i, val) => setData((d) => ({ ...d, bio: d.bio.map((p, j) => j === i ? val : p) }));
  const addBio = () => setData((d) => ({ ...d, bio: [...d.bio, ""] }));
  const removeBio = (i) => setData((d) => ({ ...d, bio: d.bio.filter((_, j) => j !== i) }));

  const updateStat = (i, key, val) => setData((d) => ({ ...d, stats: d.stats.map((s, j) => j === i ? { ...s, [key]: val } : s) }));
  const addStat = () => setData((d) => ({ ...d, stats: [...d.stats, { num: "", label: "" }] }));
  const removeStat = (i) => setData((d) => ({ ...d, stats: d.stats.filter((_, j) => j !== i) }));

  const updateHighlight = (i, key, val) => setData((d) => ({ ...d, highlights: d.highlights.map((h, j) => j === i ? { ...h, [key]: val } : h) }));
  const addHighlight = () => setData((d) => ({ ...d, highlights: [...d.highlights, { iconKey: "FiCode", label: "", desc: "" }] }));
  const removeHighlight = (i) => setData((d) => ({ ...d, highlights: d.highlights.filter((_, j) => j !== i) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveDataFile("about.json", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { alert("❌ " + e.message); }
    finally { setSaving(false); }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50";
  const inputStyle = { background: "#0f172a", border: "1px solid #334155" };
  const cardStyle = { background: "#1e293b", border: "1px solid #334155" };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">About</h1>
          <p className="text-sm text-slate-400 mt-1">Edit your bio, stats, and highlight cards</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="flex items-center gap-1.5 text-sm text-emerald-400"><Check size={14} /> Saved to disk</span>}
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 transition-all disabled:opacity-50">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
            Save All
          </button>
        </div>
      </div>

      {/* Bio Paragraphs */}
      <div className="rounded-2xl p-6 space-y-4" style={cardStyle}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Bio Paragraphs</h2>
          <button onClick={addBio} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus size={13} /> Add paragraph</button>
        </div>
        {data.bio.map((p, i) => (
          <div key={i} className="flex gap-2">
            <textarea
              className={inputCls + " flex-1 resize-none"} style={inputStyle} rows={3}
              value={p} onChange={(e) => updateBio(i, e.target.value)}
              placeholder={`Paragraph ${i + 1}...`}
            />
            {data.bio.length > 1 && (
              <button onClick={() => removeBio(i)} className="p-2 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all self-start mt-1"><Trash2 size={14} /></button>
            )}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="rounded-2xl p-6 space-y-4" style={cardStyle}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Quick Stats</h2>
          <button onClick={addStat} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus size={13} /> Add stat</button>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {data.stats.map((s, i) => (
            <div key={i} className="p-4 rounded-xl space-y-2 relative" style={{ background: "#0f172a", border: "1px solid #334155" }}>
              {data.stats.length > 1 && (
                <button onClick={() => removeStat(i)} className="absolute top-2 right-2 p-1 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all"><X size={12} /></button>
              )}
              <input className={inputCls} style={inputStyle} value={s.num} onChange={(e) => updateStat(i, "num", e.target.value)} placeholder="3+" />
              <input className={inputCls} style={inputStyle} value={s.label} onChange={(e) => updateStat(i, "label", e.target.value)} placeholder="Years Exp." />
            </div>
          ))}
        </div>
      </div>

      {/* Highlights */}
      <div className="rounded-2xl p-6 space-y-4" style={cardStyle}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Highlight Cards</h2>
          <button onClick={addHighlight} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus size={13} /> Add card</button>
        </div>
        <div className="space-y-3">
          {data.highlights.map((h, i) => (
            <div key={i} className="grid grid-cols-3 gap-3 p-4 rounded-xl" style={{ background: "#0f172a", border: "1px solid #334155" }}>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Icon Key</label>
                <select className={inputCls} style={inputStyle} value={h.iconKey} onChange={(e) => updateHighlight(i, "iconKey", e.target.value)}>
                  {ICON_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Label</label>
                <input className={inputCls} style={inputStyle} value={h.label} onChange={(e) => updateHighlight(i, "label", e.target.value)} placeholder="UI/UX Design" />
              </div>
              <div className="relative">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                <input className={inputCls + " pr-8"} style={inputStyle} value={h.desc} onChange={(e) => updateHighlight(i, "desc", e.target.value)} placeholder="Short description" />
                {data.highlights.length > 1 && (
                  <button onClick={() => removeHighlight(i)} className="absolute right-2 top-7 p-1 rounded text-red-400/50 hover:text-red-400 transition-all"><X size={12} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
