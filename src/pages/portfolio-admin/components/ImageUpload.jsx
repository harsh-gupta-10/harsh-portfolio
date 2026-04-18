import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadMedia } from "../../../lib/supabase";

export default function ImageUpload({ value, onChange, label = "Image", bucket = "portfolio-images" }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadMedia(file, bucket);
      onChange(url);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50";
  const inputStyle = { background: "#0f172a", border: "1px solid #334155" };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</label>
      
      <div className="flex gap-4 items-start">
        {/* Preview */}
        <div 
          className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 relative group" 
          style={{ background: "#0f172a", border: "1px solid #334155" }}
        >
          {value ? (
            <>
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={removeImage}
                className="absolute top-1 right-1 p-1 bg-red-500 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-1">
              <ImageIcon size={24} />
              <span className="text-[10px]">No Image</span>
            </div>
          )}
          
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 size={24} className="text-blue-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Input & Upload */}
        <div className="flex-1 space-y-2">
          <input 
            className={inputCls} 
            style={inputStyle} 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            placeholder="Image URL or upload below..." 
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 transition-all border border-slate-700 disabled:opacity-50"
          >
            <Upload size={14} />
            {uploading ? "Uploading..." : "Upload from Computer"}
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </div>
    </div>
  );
}
