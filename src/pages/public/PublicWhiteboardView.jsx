import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { fabric } from "fabric";
import { Loader2, Lock, ArrowRight, AlertTriangle, Pen, MousePointer2, Trash2, Square, Circle } from "lucide-react";

export default function PublicWhiteboardView() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  // Password State
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimeout = useRef(null);

  // Fabric State
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const canvasInstance = useRef(null);
  const [activeTool, setActiveTool] = useState("draw");
  const [color, setColor] = useState("#3b82f6");
  const [brushSize, setBrushSize] = useState(3);
  const isInitializing = useRef(true);

  useEffect(() => {
    fetchWhiteboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchWhiteboard = async (pwd = null) => {
    try {
      if (!pwd) setLoading(true);
      else setVerifying(true);
      setPasswordError("");

      const edgeUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/view-whiteboard?token=${token}`;
      const payload = pwd ? { password: pwd } : {};
      
      const response = await fetch(edgeUrl, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 && result.requiresPassword) {
            setRequiresPassword(true);
            if (pwd) setPasswordError("Incorrect password. Please try again.");
            return;
        }
        throw new Error(result.error || "Failed to load whiteboard");
      }

      setRequiresPassword(false);
      setData(result);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  const saveWhiteboardData = async (snapshot) => {
    try {
      const edgeUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/view-whiteboard?token=${token}`;
      const payload = { action: "SAVE", whiteboard_data: snapshot };
      if (password) payload.password = password; 
      
      const response = await fetch(edgeUrl, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      if (!result.success) throw new Error("Failed to auto-save");
    } catch (err) {
      console.error("Auto-save failed", err);
    } finally {
      setSaving(false);
    }
  };

  // Initialize Fabric once data is loaded
  useEffect(() => {
    if (!data || !canvasRef.current || !containerRef.current || canvasInstance.current) return;

    const initCanvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      backgroundColor: "#121212", 
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight || 800,
    });

    initCanvas.freeDrawingBrush.color = color;
    initCanvas.freeDrawingBrush.width = brushSize;

    if (data.whiteboard && typeof data.whiteboard === 'object' && Object.keys(data.whiteboard).length > 0) {
      if (!data.whiteboard.elements && !Array.isArray(data.whiteboard) && data.whiteboard.objects) {
        initCanvas.loadFromJSON(data.whiteboard, () => {
          initCanvas.renderAll();
          isInitializing.current = false;
        });
      } else {
        isInitializing.current = false;
      }
    } else {
      isInitializing.current = false;
    }

    canvasInstance.current = initCanvas;

    const handleResize = () => {
      if (containerRef.current && initCanvas) {
        initCanvas.setWidth(containerRef.current.clientWidth);
        initCanvas.setHeight(containerRef.current.clientHeight);
        initCanvas.renderAll();
      }
    };
    window.addEventListener("resize", handleResize);

    const handleCanvasChange = () => {
      if (isInitializing.current) return;
      const snapshot = initCanvas.toJSON();
      
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      setSaving(true);
      saveTimeout.current = setTimeout(() => {
         saveWhiteboardData(snapshot);
      }, 2000);
    };

    initCanvas.on("path:created", handleCanvasChange);
    initCanvas.on("object:modified", handleCanvasChange);
    initCanvas.on("object:added", handleCanvasChange);
    initCanvas.on("object:removed", handleCanvasChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      initCanvas.dispose();
    };
  }, [data]);

  // Tool effects
  useEffect(() => {
    if (!canvasInstance.current) return;
    if (activeTool === "draw") {
      canvasInstance.current.isDrawingMode = true;
    } else {
      canvasInstance.current.isDrawingMode = false;
    }
  }, [activeTool]);

  // Color & brush size effects
  useEffect(() => {
    if (!canvasInstance.current) return;
    canvasInstance.current.freeDrawingBrush.color = color;
    canvasInstance.current.freeDrawingBrush.width = brushSize;
  }, [color, brushSize]);

  const clearCanvas = () => {
    if (!canvasInstance.current) return;
    if (confirm("Are you sure you want to clear the whiteboard?")) {
      canvasInstance.current.clear();
      canvasInstance.current.backgroundColor = "#121212"; 
      canvasInstance.current.renderAll();
      const snapshot = canvasInstance.current.toJSON();
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      setSaving(true);
      saveWhiteboardData(snapshot);
    }
  };
  
  const addRect = () => {
    if (!canvasInstance.current) return;
    setActiveTool("select");
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: "transparent",
      stroke: color,
      strokeWidth: brushSize,
      width: 100,
      height: 100,
      cornerColor: "#3b82f6",
      transparentCorners: false,
    });
    canvasInstance.current.add(rect);
    canvasInstance.current.setActiveObject(rect);
    canvasInstance.current.renderAll();
  };
  
  const addCircle = () => {
    if (!canvasInstance.current) return;
    setActiveTool("select");
    const circle = new fabric.Circle({
      left: 150,
      top: 150,
      fill: "transparent",
      stroke: color,
      strokeWidth: brushSize,
      radius: 50,
      cornerColor: "#3b82f6",
      transparentCorners: false,
    });
    canvasInstance.current.add(circle);
    canvasInstance.current.setActiveObject(circle);
    canvasInstance.current.renderAll();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-blue-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-2">Password Protected</h2>
          <p className="text-slate-400 text-sm text-center mb-8">
            This whiteboard requires a password to view.
          </p>
          
          <form onSubmit={(e) => { e.preventDefault(); fetchWhiteboard(password); }} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                autoFocus
              />
              {passwordError && <p className="text-red-400 text-xs mt-2 text-center">{passwordError}</p>}
            </div>
            <button
              disabled={!password || verifying}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {verifying ? <Loader2 size={18} className="animate-spin" /> : "Access Whiteboard"}
              {!verifying && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { title, author, updated_at } = data;

  return (
    <div className="fixed inset-0 flex flex-col bg-[#121212] font-sans">
      <div className="h-14 bg-[#1a1a1a] border-b border-[#333] px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-white font-bold text-sm truncate max-w-[300px]">{title}</h1>
          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 uppercase tracking-widest text-[10px] font-bold rounded flex items-center gap-2">
            Public Session
            {saving && <Loader2 size={10} className="animate-spin" />}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-gray-400">
          {author && (
            <div className="flex items-center gap-2 border-r border-[#333] pr-4">
               <span>Created by</span>
               <span className="text-white font-medium">{author.full_name || 'Admin'}</span>
            </div>
          )}
          {updated_at && (
             <span>Live Sync</span>
          )}
        </div>
      </div>

      <div className="flex-1 relative w-full h-full" ref={containerRef}>
        
        {/* Custom Toolbar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#1a1a1a]/90 backdrop-blur-md border border-[#333] p-2 rounded-2xl shadow-2xl z-20">
          <button
            onClick={() => setActiveTool("select")}
            className={`p-3 rounded-xl transition-all ${activeTool === "select" ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "text-gray-400 hover:text-white hover:bg-[#333]"}`}
            title="Select / Move"
          >
            <MousePointer2 size={20} />
          </button>
          <button
            onClick={() => setActiveTool("draw")}
            className={`p-3 rounded-xl transition-all ${activeTool === "draw" ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "text-gray-400 hover:text-white hover:bg-[#333]"}`}
            title="Draw"
          >
            <Pen size={20} />
          </button>
          
          <div className="w-px h-8 bg-[#333] mx-1"></div>
          
          <button
            onClick={addRect}
            className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-[#333] transition-all"
            title="Add Rectangle"
          >
            <Square size={20} />
          </button>
          <button
            onClick={addCircle}
            className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-[#333] transition-all"
            title="Add Circle"
          >
            <Circle size={20} />
          </button>

          <div className="w-px h-8 bg-[#333] mx-1"></div>

          <div className="relative flex items-center group px-1">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded-full border-2 border-gray-600 cursor-pointer overflow-hidden p-0 bg-transparent"
              title="Stroke Color"
            />
          </div>

          <div className="flex items-center px-2 w-24">
            <input
              type="range"
              min="1"
              max="30"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-full accent-blue-500"
              title="Brush Size"
            />
          </div>

          <div className="w-px h-8 bg-[#333] mx-1"></div>
          
          <button
            onClick={clearCanvas}
            className="p-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Clear Board"
          >
            <Trash2 size={20} />
          </button>
        </div>

        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
