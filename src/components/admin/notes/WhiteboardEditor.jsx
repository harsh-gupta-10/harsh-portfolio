import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Pen, MousePointer2, Trash2, Square, Circle } from "lucide-react";

export default function WhiteboardEditor({ initialData, onChange }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const canvasInstance = useRef(null); // use ref instead of state for mutable fabric object
  const [activeTool, setActiveTool] = useState("draw");
  const [color, setColor] = useState("#3b82f6");
  const [brushSize, setBrushSize] = useState(3);
  
  // Track if changes are being made from code or user
  const isInitializing = useRef(true);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Initialize Fabric Canvas
    const initCanvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      backgroundColor: "#1e293b", // Slate 800 roughly
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight || 600,
    });

    initCanvas.freeDrawingBrush.color = color;
    initCanvas.freeDrawingBrush.width = brushSize;

    // Load initial data if present
    if (initialData && typeof initialData === "object" && Object.keys(initialData).length > 0) {
      if (!initialData.elements && !Array.isArray(initialData) && initialData.objects) {
        initCanvas.loadFromJSON(initialData, () => {
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

    // Make it responsive
    const handleResize = () => {
      if (containerRef.current) {
        initCanvas.setWidth(containerRef.current.clientWidth);
        initCanvas.setHeight(containerRef.current.clientHeight || 600);
        initCanvas.renderAll();
      }
    };
    window.addEventListener("resize", handleResize);

    // Save changes when user stops drawing or adds/modifies something
    const saveState = () => {
      if (isInitializing.current) return;
      const json = initCanvas.toJSON();
      if (onChange) onChange(json);
    };

    initCanvas.on("path:created", saveState);
    initCanvas.on("object:modified", saveState);
    initCanvas.on("object:added", saveState);
    initCanvas.on("object:removed", saveState);

    return () => {
      window.removeEventListener("resize", handleResize);
      initCanvas.dispose();
    };
  }, []); // Only run once on mount

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
      canvasInstance.current.backgroundColor = "#1e293b"; // Reset dark background
      canvasInstance.current.renderAll();
      if (onChange) onChange(canvasInstance.current.toJSON());
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
    if (onChange) onChange(canvasInstance.current.toJSON());
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
    if (onChange) onChange(canvasInstance.current.toJSON());
  };

  return (
    <div className="w-full h-full relative border border-slate-700/50 rounded-xl overflow-hidden shadow-inner flex flex-col bg-slate-900 z-10" ref={containerRef}>
      
      {/* Custom Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-800/90 backdrop-blur-md border border-slate-700/50 p-2 rounded-2xl shadow-xl z-20">
        <button
          onClick={() => setActiveTool("select")}
          className={`p-3 rounded-xl transition-all ${activeTool === "select" ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}
          title="Select / Move"
        >
          <MousePointer2 size={20} />
        </button>
        <button
          onClick={() => setActiveTool("draw")}
          className={`p-3 rounded-xl transition-all ${activeTool === "draw" ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}
          title="Draw"
        >
          <Pen size={20} />
        </button>
        
        <div className="w-px h-8 bg-slate-700/50 mx-1"></div>
        
        <button
          onClick={addRect}
          className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
          title="Add Rectangle"
        >
          <Square size={20} />
        </button>
        <button
          onClick={addCircle}
          className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
          title="Add Circle"
        >
          <Circle size={20} />
        </button>

        <div className="w-px h-8 bg-slate-700/50 mx-1"></div>

        <div className="relative flex items-center group px-1">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded-full border-2 border-slate-600 cursor-pointer overflow-hidden p-0 bg-transparent"
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

        <div className="w-px h-8 bg-slate-700/50 mx-1"></div>
        
        <button
          onClick={clearCanvas}
          className="p-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Clear Board"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="flex-1 w-full relative" style={{ minHeight: "600px" }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
