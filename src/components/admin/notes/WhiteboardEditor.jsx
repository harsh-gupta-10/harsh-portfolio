import { useState, useRef, useEffect } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import { Eraser, Pen, Undo, RotateCcw, Trash2 } from "lucide-react";

const COLORS = ["#ffffff", "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

export default function WhiteboardEditor({ initialData, onChange, setThumbnailBlob }) {
  const canvasRef = useRef(null);
  const [isEraser, setIsEraser] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const isInitialLoad = useRef(true);

  // Load initial data
  useEffect(() => {
    if (initialData && Array.isArray(initialData) && canvasRef.current && isInitialLoad.current) {
      canvasRef.current.loadPaths(initialData);
      isInitialLoad.current = false;
    }
  }, [initialData]);

  const handleChange = async () => {
    if (!canvasRef.current || isInitialLoad.current) return;
    try {
      const paths = await canvasRef.current.exportPaths();
      onChange(paths);
    } catch (e) {}
  };

  const setEraserMode = (mode) => {
    setIsEraser(mode);
    canvasRef.current?.eraseMode(mode);
  };

  return (
    <div className="w-full h-full relative border border-slate-700/50 rounded-xl overflow-hidden shadow-inner flex flex-col bg-[#121212]">
      {/* Custom Toolbar */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setEraserMode(false)}
            className={`p-2 rounded-lg transition-colors ${!isEraser ? "bg-blue-500/20 text-blue-400" : "text-slate-400 hover:bg-slate-800"}`}
            title="Pen"
          >
            <Pen size={18} />
          </button>
          <button 
            onClick={() => setEraserMode(true)}
            className={`p-2 rounded-lg transition-colors ${isEraser ? "bg-blue-500/20 text-blue-400" : "text-slate-400 hover:bg-slate-800"}`}
            title="Eraser"
          >
            <Eraser size={18} />
          </button>
          
          <div className="w-px h-6 bg-slate-700 mx-2" />
          
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => { setColor(c); setEraserMode(false); }}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c && !isEraser ? "border-white scale-110" : "border-transparent"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => canvasRef.current?.undo()} className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg" title="Undo">
            <Undo size={18} />
          </button>
          <button onClick={() => canvasRef.current?.redo()} className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg" title="Redo">
            <RotateCcw size={18} />
          </button>
          <div className="w-px h-6 bg-slate-700 mx-1" />
          <button onClick={() => { canvasRef.current?.clearCanvas(); handleChange(); }} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg" title="Clear Canvas">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 w-full relative" style={{ minHeight: "600px", zIndex: 1 }}>
        <ReactSketchCanvas
          ref={canvasRef}
          strokeWidth={4}
          eraserWidth={16}
          strokeColor={color}
          canvasColor="transparent"
          onChange={handleChange}
          style={{ border: "none" }}
        />
      </div>
    </div>
  );
}
