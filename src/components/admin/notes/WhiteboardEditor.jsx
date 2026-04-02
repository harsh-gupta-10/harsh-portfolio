import { useState, useRef, useEffect } from "react";
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";
import { Loader2 } from "lucide-react";

export default function WhiteboardEditor({ initialData, onChange, setThumbnailBlob }) {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-generate thumbnail when data changes
  const onChangeThrottled = (elements, state) => {
    // Only fire onChange if we aren't loading initially
    if (!loading) {
      const data = { elements, appState: state };
      onChange(data);

      // Generating thumbnail on every change is heavy,
      // but we will do it every few elements or debounce in parent.
      // Easiest is to generate blob directly
      if (elements && elements.length > 0 && setThumbnailBlob) {
        exportToBlob({
          elements,
          mimeType: "image/png",
          appState: { ...state, exportWithDarkMode: true }
        }).then(blob => setThumbnailBlob(blob)).catch(console.error);
      }
    }
  };

  return (
    <div className="w-full h-full relative border border-slate-700/50 rounded-xl overflow-hidden shadow-inner">
      {loading && (
        <div className="absolute inset-0 z-10 bg-slate-900 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      )}
      
      <div className="excalidraw-wrapper w-full h-full">
        {/* We need to ensure dynamic rendering for Excalidraw in some environments, but Vite is fine */}
        <Excalidraw
          initialData={initialData || { elements: [], appState: { viewBackgroundColor: "#0f172a" }, scrollToContent: true }}
          onChange={onChangeThrottled}
          excalidrawAPI={(api) => {
            setExcalidrawAPI(api);
            setTimeout(() => setLoading(false), 500);
          }}
          theme="dark"
        />
      </div>
    </div>
  );
}
