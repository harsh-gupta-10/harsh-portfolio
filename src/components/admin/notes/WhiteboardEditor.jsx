import React, { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import { 
  Pen, MousePointer2, Trash2, Square, Circle, Triangle as TriangleIcon, Diamond,
  Minus, ArrowUpRight, Type, StickyNote, Image as ImageIcon, 
  Highlighter, Eraser, ZoomIn, ZoomOut, Maximize, Grid3X3, Grid
} from "lucide-react";
import FloatingToolbar from "./FloatingToolbar";
import ContextMenu from "./ContextMenu";
import { useAuth } from "../../../hooks/useAuth";
import { useRealtimeCanvas } from "../../../lib/whiteboard/useRealtimeCanvas";
import RemoteCursor from "./RemoteCursor";
import OnlineUsers from "./OnlineUsers";
import LiveToast from "./LiveToast";

const STICKY_COLORS = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca", "#e9d5ff", "#fed7aa"];
const CHAT_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function WhiteboardEditor({ noteId, initialData, onChange, setThumbnailBlob }) {
  const { user } = useAuth();
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const minimapRef = useRef(null);
  const canvasInstance = useRef(null);
  
  // App State
  const [activeTool, setActiveTool] = useState("select");
  
  // Realtime
  const {
    liveMode, setLiveMode,
    remoteCursors, onlineUsers,
    connectionStatus, broadcastChange,
    broadcastCursor, isSyncing, toasts,
    currentUserId
  } = useRealtimeCanvas({ 
    noteId, 
    user, 
    onRemoteChange: (json) => {
      if (!canvasInstance.current) return;
      const vpt = canvasInstance.current.viewportTransform;
      canvasInstance.current.loadFromJSON(json, () => {
        canvasInstance.current.setViewportTransform(vpt);
        canvasInstance.current.renderAll();
      });
    }
  });
  const [color, setColor] = useState("#3b82f6");
  const [brushSize, setBrushSize] = useState(3);
  const [penOpacity, setPenOpacity] = useState(1);
  const [smoothPen, setSmoothPen] = useState(false);
  
  const [activeObject, setActiveObject] = useState(null);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const clipboardObject = useRef(null);
  const styleClipboard = useRef(null);

  // Undo/Redo State
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const isInitializing = useRef(true);
  const isUndoRedoAction = useRef(false);

  // Drawing State (Line, Shapes, Arrow)
  const isDrawingShape = useRef(false);
  const shapeStartPt = useRef({x: 0, y: 0});
  const currentShape = useRef(null);
  const arrowTriangle = useRef(null);

  // Hidden Image Input
  const fileInputRef = useRef(null);

  // --- Helper Functions (Hoisted) ---
  function hexToRgba(hex, alpha) {
    const [r,g,b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
    return `rgba(${r},${g},${b},${alpha})`;
  }

  const triggerSave = useCallback(() => {
    if (!canvasInstance.current) return;
    const json = canvasInstance.current.toJSON(['id', 'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 'selectable', 'evented']);
    undoStack.current.push(json);
    if (onChange) onChange(json);
  }, [onChange]);

  // --- Undo/Redo Functions (Hoisted) ---
  const handleUndo = useCallback(() => {
    if (undoStack.current.length > 1) {
      isUndoRedoAction.current = true;
      redoStack.current.push(undoStack.current.pop());
      const state = undoStack.current[undoStack.current.length - 1];
      canvasInstance.current.loadFromJSON(state, () => {
        canvasInstance.current.renderAll();
        isUndoRedoAction.current = false;
        if(onChange) onChange(state);
      });
    }
  }, [onChange]);

  const handleRedo = useCallback(() => {
    if (redoStack.current.length > 0) {
      isUndoRedoAction.current = true;
      const state = redoStack.current.pop();
      undoStack.current.push(state);
      canvasInstance.current.loadFromJSON(state, () => {
        canvasInstance.current.renderAll();
        isUndoRedoAction.current = false;
        if(onChange) onChange(state);
      });
    }
  }, [onChange]);

  // --- Action Functions (Hoisted) ---
  const copyObj = useCallback(() => {
    const act = canvasInstance.current?.getActiveObject();
    if (act) act.clone(cloned => { clipboardObject.current = cloned; });
  }, []);

  const pasteObj = useCallback(() => {
    const canvas = canvasInstance.current;
    if (!clipboardObject.current || !canvas) return;
    clipboardObject.current.clone(cloned => {
      canvas.discardActiveObject();
      cloned.set({ left: cloned.left + 15, top: cloned.top + 15, evented: true, selectable: true });
      if (cloned.type === 'activeSelection') {
        cloned.canvas = canvas;
        cloned.forEachObject(obj => canvas.add(obj));
        cloned.setCoords();
      } else {
        canvas.add(cloned);
      }
      clipboardObject.current.top += 15;
      clipboardObject.current.left += 15;
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
      triggerSave();
    });
  }, [triggerSave]);

  const duplicateObj = useCallback(() => { copyObj(); pasteObj(); }, [copyObj, pasteObj]);
  
  const deleteActive = useCallback(() => {
    const canvas = canvasInstance.current;
    if (!canvas) return;
    const act = canvas.getActiveObjects();
    if (act.length) {
      act.forEach(o => canvas.remove(o));
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      triggerSave();
    }
  }, [triggerSave]);

  // --- Toolbar Interaction Logic (Hoisted via standard functions) ---
  const handleMouseDown = useCallback((o) => {
    const canvas = canvasInstance.current;
    if (!canvas) return;
    const pointer = canvas.getPointer(o.e);

    if (activeTool === "eraser") {
      const target = canvas.findTarget(o.e);
      if (target && target.id !== 'gridline') {
        canvas.remove(target);
        triggerSave();
      }
      return;
    }

    if (activeTool === "text") {
      const text = new fabric.IText('Text', {
        left: pointer.x, top: pointer.y, fontFamily: 'Inter', fill: color, fontSize: 18,
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      text.enterEditing();
      text.selectAll();
      setActiveTool("select");
      triggerSave();
      return;
    }

    if (activeTool === "sticky") {
      const randColor = STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)];
      const rect = new fabric.Rect({
        left: pointer.x, top: pointer.y, width: 160, height: 120, fill: randColor,
        rx: 4, ry: 4, shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.2)', blur: 5, offsetX: 2, offsetY: 2 })
      });
      const text = new fabric.IText('Note', {
        left: pointer.x + 10, top: pointer.y + 10, fontFamily: 'Inter', fontSize: 16, fill: '#1e293b',
        width: 140, splitByGrapheme: true
      });
      
      const group = new fabric.Group([rect, text], { left: pointer.x, top: pointer.y });
      group.on('mousedblclick', () => {
         const items = group.getObjects();
         group.destroy();
         canvas.remove(group);
         canvas.add(...items);
         canvas.setActiveObject(items[1]);
         items[1].enterEditing();
         items[1].selectAll();
      });
      
      canvas.add(group);
      canvas.setActiveObject(group);
      setActiveTool("select");
      triggerSave();
      return;
    }

    if (["line", "arrow", "rect", "circle", "diamond", "triangle"].includes(activeTool)) {
      isDrawingShape.current = true;
      shapeStartPt.current = pointer;

      const opts = { stroke: color, strokeWidth: brushSize, fill: 'transparent', cornerColor: color };

      if (activeTool === "line" || activeTool === "arrow") {
        currentShape.current = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], opts);
        canvas.add(currentShape.current);
        
        if (activeTool === "arrow") {
          arrowTriangle.current = new fabric.Triangle({
            ...opts, fill: color, width: brushSize * 4, height: brushSize * 4,
            left: pointer.x, top: pointer.y, originX: 'center', originY: 'center', angle: 90
          });
          canvas.add(arrowTriangle.current);
        }
      } else if (activeTool === "rect") {
        currentShape.current = new fabric.Rect({ ...opts, left: pointer.x, top: pointer.y, width: 0, height: 0 });
        canvas.add(currentShape.current);
      } else if (activeTool === "circle") {
        currentShape.current = new fabric.Circle({ ...opts, left: pointer.x, top: pointer.y, radius: 0 });
        canvas.add(currentShape.current);
      } else if (activeTool === "triangle") {
        currentShape.current = new fabric.Triangle({ ...opts, left: pointer.x, top: pointer.y, width: 0, height: 0 });
        canvas.add(currentShape.current);
      } else if (activeTool === "diamond") {
        currentShape.current = new fabric.Polygon([
          { x: pointer.x, y: pointer.y }, { x: pointer.x, y: pointer.y },
          { x: pointer.x, y: pointer.y }, { x: pointer.x, y: pointer.y }
        ], { ...opts, left: pointer.x, top: pointer.y });
        canvas.add(currentShape.current);
      }
    }
  }, [activeTool, color, brushSize, triggerSave]);

  const handleMouseMove = useCallback((o) => {
    if (!isDrawingShape.current || !currentShape.current) return;
    const canvas = canvasInstance.current;
    if (!canvas) return;
    const pointer = canvas.getPointer(o.e);
    const start = shapeStartPt.current;

    if (activeTool === "line" || activeTool === "arrow") {
      currentShape.current.set({ x2: pointer.x, y2: pointer.y });
      if (activeTool === "arrow" && arrowTriangle.current) {
        const dx = pointer.x - start.x;
        const dy = pointer.y - start.y;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        arrowTriangle.current.set({ left: pointer.x, top: pointer.y, angle: angle + 90 });
      }
    } else if (activeTool === "rect" || activeTool === "triangle") {
      currentShape.current.set({
        width: Math.abs(pointer.x - start.x),
        height: Math.abs(pointer.y - start.y),
        left: Math.min(start.x, pointer.x),
        top: Math.min(start.y, pointer.y)
      });
    } else if (activeTool === "circle") {
      const radius = Math.max(Math.abs(pointer.x - start.x), Math.abs(pointer.y - start.y)) / 2;
      currentShape.current.set({
        radius, left: Math.min(start.x, pointer.x), top: Math.min(start.y, pointer.y)
      });
    } else if (activeTool === "diamond") {
      const w = Math.abs(pointer.x - start.x);
      const h = Math.abs(pointer.y - start.y);
      currentShape.current.set({
        points: [ {x: w/2, y: 0}, {x: w, y: h/2}, {x: w/2, y: h}, {x: 0, y: h/2} ],
        left: Math.min(start.x, pointer.x), top: Math.min(start.y, pointer.y), width: w, height: h
      });
    }
    canvas.renderAll();
  }, [activeTool]);

  const handleMouseUp = useCallback(() => {
    if (isDrawingShape.current) {
      isDrawingShape.current = false;
      const canvas = canvasInstance.current;
      if(!canvas) return;

      if (activeTool === "arrow" && currentShape.current && arrowTriangle.current) {
        const group = new fabric.Group([currentShape.current, arrowTriangle.current]);
        canvas.remove(currentShape.current, arrowTriangle.current);
        canvas.add(group);
        canvas.setActiveObject(group);
      } else if (currentShape.current) {
        canvas.setActiveObject(currentShape.current);
      }
      
      currentShape.current = null;
      arrowTriangle.current = null;
      setActiveTool("select");
      triggerSave();
    }
  }, [activeTool, triggerSave]);

  // --- Setup + Lifecycles ---
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const initCanvas = new fabric.Canvas(canvasRef.current, {
      selection: true,
      preserveObjectStacking: true,
      backgroundColor: "#1e293b",
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight || 600,
      fireRightClick: true,
      stopContextMenu: true,
    });
    canvasInstance.current = initCanvas;

    if (initialData && typeof initialData === "object" && Object.keys(initialData).length > 0) {
      if (!initialData.elements && !Array.isArray(initialData) && initialData.objects) {
        initCanvas.loadFromJSON(initialData, () => {
          initCanvas.renderAll();
          undoStack.current.push(initCanvas.toJSON(['id']));
          isInitializing.current = false;
        });
      } else {
        isInitializing.current = false;
        undoStack.current.push(initCanvas.toJSON(['id']));
      }
    } else {
      isInitializing.current = false;
      undoStack.current.push(initCanvas.toJSON(['id']));
    }

    const handleResize = () => {
      if (containerRef.current && canvasInstance.current) {
        canvasInstance.current.setWidth(containerRef.current.clientWidth);
        canvasInstance.current.setHeight(containerRef.current.clientHeight || 600);
        canvasInstance.current.renderAll();
      }
    };
    window.addEventListener("resize", handleResize);

    const saveState = () => {
      if (isInitializing.current || isUndoRedoAction.current) return;
      const json = initCanvas.toJSON(['id', 'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 'selectable', 'evented']);
      undoStack.current.push(json);
      redoStack.current = []; // Clear redo stack on new action
      if (onChange) onChange(json);
    };

    initCanvas.on("path:created", (e) => {
      // Ensure path has ID for sync
      e.path.id = `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      saveState();
    });
    initCanvas.on("object:modified", saveState);
    initCanvas.on("object:added", (e) => {
      if (!isDrawingShape.current && e.target && e.target.type !== "line" && e.target.type !== "triangle" && e.target.id !== "gridline") saveState();
    });
    initCanvas.on("object:removed", saveState);

    initCanvas.on("mouse:move", (opt) => {
      if (!liveMode) return;
      const pointer = initCanvas.getPointer(opt.e);
      broadcastCursor(pointer.x, pointer.y);
    });

    initCanvas.on("selection:created", (e) => setActiveObject(e.selected[0]));
    initCanvas.on("selection:updated", (e) => setActiveObject(e.selected[0]));
    initCanvas.on("selection:cleared", () => setActiveObject(null));

    // Right Click
    initCanvas.on("mouse:down", (opt) => {
      if (opt.button === 3) {
        setContextMenu({ visible: true, x: opt.e.clientX, y: opt.e.clientY, target: opt.target });
        if (opt.target && !initCanvas.getActiveObject()) {
           initCanvas.setActiveObject(opt.target);
        }
      } else {
        setContextMenu({ visible: false, x: 0, y: 0 });
      }
    });

    // Drawing Mechanics
    initCanvas.on('mouse:down', handleMouseDown);
    initCanvas.on('mouse:move', handleMouseMove);
    initCanvas.on('mouse:up', handleMouseUp);
    
    // Zooming
    initCanvas.on('mouse:wheel', (opt) => {
      if (opt.e.ctrlKey) {
        opt.e.preventDefault();
        opt.e.stopPropagation();
        let zoom = initCanvas.getZoom();
        zoom *= 0.999 ** opt.e.deltaY;
        if (zoom > 5) zoom = 5;
        if (zoom < 0.1) zoom = 0.1;
        initCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        setZoomLevel(Math.round(zoom * 100));
      }
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      initCanvas.dispose();
    };
  }, []);

  // Broadcast changes
  useEffect(() => {
    if (!liveMode || isSyncing.current) return;
    const handleBroadcast = () => {
       const json = canvasInstance.current.toJSON(['id', 'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 'selectable', 'evented']);
       broadcastChange(json);
    };
    
    if (canvasInstance.current) {
        canvasInstance.current.on("object:modified", handleBroadcast);
        canvasInstance.current.on("object:added", handleBroadcast);
        canvasInstance.current.on("object:removed", handleBroadcast);
        canvasInstance.current.on("path:created", handleBroadcast);
    }
    
    return () => {
      if (canvasInstance.current) {
        canvasInstance.current.off("object:modified", handleBroadcast);
        canvasInstance.current.off("object:added", handleBroadcast);
        canvasInstance.current.off("object:removed", handleBroadcast);
        canvasInstance.current.off("path:created", handleBroadcast);
      }
    };
  }, [liveMode, broadcastChange]);

  // Sync latest bound values into canvas events
  useEffect(() => {
    if (!canvasInstance.current) return;
    const canvas = canvasInstance.current;
    
    // Snapping - safe to overwrite entirely
    canvas.off('object:moving');
    canvas.on('object:moving', (e) => {
      if (snapToGrid) {
        const p = e.target;
        p.set({ left: Math.round(p.left / 20) * 20, top: Math.round(p.top / 20) * 20 });
      }
    });

    // Swap drawing mechanics to use latest scope closures safely
    canvas.off('mouse:down'); canvas.on('mouse:down', handleMouseDown);
    canvas.off('mouse:move'); canvas.on('mouse:move', handleMouseMove);
    canvas.off('mouse:up'); canvas.on('mouse:up', handleMouseUp);

    // Context menu click off via left click
    canvas.on("mouse:down", (opt) => {
      if (opt.button === 3) {
        setContextMenu({ visible: true, x: opt.e.clientX, y: opt.e.clientY, target: opt.target });
        if (opt.target && !canvas.getActiveObject()) canvas.setActiveObject(opt.target);
      } else {
        setContextMenu({ visible: false, x: 0, y: 0 });
      }
    });
  }, [snapToGrid, handleMouseDown, handleMouseMove, handleMouseUp]);

  // Minimap logic
  useEffect(() => {
     const mmInterval = setInterval(() => {
      if (minimapRef.current && canvasInstance.current) {
        const ctx = minimapRef.current.getContext('2d');
        const mainW = canvasInstance.current.width;
        const mainH = canvasInstance.current.height;
        const mmW = minimapRef.current.width;
        const mmH = minimapRef.current.height;
        ctx.clearRect(0, 0, mmW, mmH);
        
        const scale = Math.min(mmW/mainW, mmH/mainH);
        
        ctx.save();
        ctx.scale(scale, scale);
        try { ctx.drawImage(canvasInstance.current.lowerCanvasEl, 0, 0); } catch(e){/* ignore empty */}
        ctx.restore();

        // Draw viewbox
        let zoom = canvasInstance.current.getZoom();
        let vpt = canvasInstance.current.viewportTransform;
        let x = (-vpt[4] / zoom) * scale;
        let y = (-vpt[5] / zoom) * scale;
        let w = (mainW / zoom) * scale;
        let h = (mainH / zoom) * scale;
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
      }
    }, 3000);
    return () => clearInterval(mmInterval);
  }, []);

  // Keyboard Shortcuts (Depends on scoped handlers)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (canvasInstance.current?.getActiveObject()?.isEditing || e.target.tagName === 'INPUT') return;
      const actObj = canvasInstance.current?.getActiveObject();

      if (e.ctrlKey && e.key.toLowerCase() === 'z') { e.preventDefault(); handleUndo(); } 
      else if (e.ctrlKey && e.key.toLowerCase() === 'y') { e.preventDefault(); handleRedo(); } 
      else if (e.ctrlKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        canvasInstance.current.discardActiveObject();
        const sel = new fabric.ActiveSelection(canvasInstance.current.getObjects().filter(o => o.id !== 'gridline'), { canvas: canvasInstance.current });
        canvasInstance.current.setActiveObject(sel);
        canvasInstance.current.requestRenderAll();
      }
      else if (e.ctrlKey && e.key.toLowerCase() === 'c') { if (actObj) copyObj(); } 
      else if (e.ctrlKey && e.key.toLowerCase() === 'v') { pasteObj(); } 
      else if (e.ctrlKey && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicateObj(); }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && actObj) { e.preventDefault(); deleteActive(); }
      else if (e.key === 'Escape') setActiveTool("select");
      else if (e.key.toLowerCase() === 'r') setActiveTool("rect");
      else if (e.key.toLowerCase() === 'c') setActiveTool("circle");
      else if (e.key.toLowerCase() === 'l') setActiveTool("line");
      else if (e.key.toLowerCase() === 'a') setActiveTool("arrow");
      else if (e.key.toLowerCase() === 't') setActiveTool("text");
      else if (e.key.toLowerCase() === 'p') setActiveTool("draw");
      else if (e.key.toLowerCase() === 'e') setActiveTool("eraser");
      else if (e.key === ']') setBrushSize(b => Math.min(b + 1, 50));
      else if (e.key === '[') setBrushSize(b => Math.max(b - 1, 1));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, copyObj, pasteObj, duplicateObj, deleteActive]);

  // Grid Engine
  useEffect(() => {
    if (!canvasInstance.current) return;
    const canvas = canvasInstance.current;
    canvas.getObjects().forEach(o => { if(o.id === 'gridline') canvas.remove(o) });
    if (gridEnabled) {
      const w = canvas.width;
      const h = canvas.height;
      const lines = [];
      const gridOpt = { stroke: '#334155', strokeWidth: 1, selectable: false, evented: false, id: 'gridline' };
      for (let i = 0; i < (w / 20); i++) lines.push(new fabric.Line([i * 20, 0, i * 20, h], gridOpt));
      for (let i = 0; i < (h / 20); i++) lines.push(new fabric.Line([0, i * 20, w, i * 20], gridOpt));
      lines.forEach(l => { canvas.add(l); canvas.sendToBack(l); });
    }
    canvas.renderAll();
  }, [gridEnabled]);

  // Effect Appliers (Brush, Colors, Cursor)
  useEffect(() => {
    if (!canvasInstance.current) return;
    const canvas = canvasInstance.current;
    
    canvas.isDrawingMode = (activeTool === "draw" || activeTool === "highlighter");
    canvas.selection = (activeTool === "select");

    canvas.defaultCursor = 'default';
    canvas.hoverCursor = 'move';
    canvas.getObjects().forEach(o => o.set('selectable', activeTool === 'select' && o.id !== 'gridline'));

    if (activeTool === "eraser") {
      canvas.defaultCursor = 'crosshair';
      canvas.hoverCursor = 'crosshair';
    } else if (activeTool === "text" || activeTool === "sticky") {
      canvas.defaultCursor = 'text';
    } else if (["rect", "circle", "line", "arrow", "diamond", "triangle"].includes(activeTool)) {
      canvas.defaultCursor = 'crosshair';
      canvas.getObjects().forEach(o => o.set('selectable', false));
    }
    
    canvas.freeDrawingBrush.color = activeTool === "highlighter" ? hexToRgba(color, 0.4) : hexToRgba(color, penOpacity);
    canvas.freeDrawingBrush.width = activeTool === "highlighter" ? 20 : brushSize;
    canvas.freeDrawingBrush.decimate = smoothPen ? 5 : 0;
    
    canvas.requestRenderAll();
  }, [activeTool, color, brushSize, penOpacity, smoothPen]);

  // --- Handlers ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (f) => {
        fabric.Image.fromURL(f.target.result, (img) => {
          img.scaleToWidth(Math.min(300, img.width));
          img.set({ left: 100, top: 100 });
          canvasInstance.current.add(img);
          canvasInstance.current.setActiveObject(img);
          triggerSave();
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContextMenuAction = (action) => {
    const act = canvasInstance.current.getActiveObject();
    switch (action) {
      case "copy": copyObj(); break;
      case "paste": pasteObj(); break;
      case "duplicate": duplicateObj(); break;
      case "delete": deleteActive(); break;
      case "toggle_lock":
        if (act) {
          const l = !act.lockMovementX;
          act.set({ selectable: !l, evented: !l, lockMovementX: l, lockMovementY: l, lockRotation: l, lockScalingX: l, lockScalingY: l });
          canvasInstance.current.discardActiveObject();
          canvasInstance.current.renderAll();
          triggerSave();
        }
        break;
      case "bring_forward": if(act) canvasInstance.current.bringForward(act); triggerSave(); break;
      case "send_backward": if(act) canvasInstance.current.sendBackward(act); triggerSave(); break;
      case "copy_style":
        if (act) styleClipboard.current = { fill: act.fill, stroke: act.stroke, strokeWidth: act.strokeWidth, opacity: act.opacity, fontFamily: act.fontFamily, fontSize: act.fontSize };
        break;
      case "paste_style":
        if (act && styleClipboard.current) { act.set(styleClipboard.current); canvasInstance.current.renderAll(); triggerSave(); }
        break;
      case "select_all": {
        const sel = new fabric.ActiveSelection(canvasInstance.current.getObjects().filter(x=>x.id!=='gridline'), {canvas: canvasInstance.current});
        canvasInstance.current.setActiveObject(sel); canvasInstance.current.requestRenderAll(); 
        break;
      }
      case "clear_all":
        if (confirm("Clear Whiteboard?")) { canvasInstance.current.clear(); canvasInstance.current.backgroundColor="#1e293b"; triggerSave(); }
        break;
      default: break;
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  const ToolBtn = ({ id, icon: Icon, title }) => {
    return (
      <button
        onClick={() => setActiveTool(id)}
        className={`p-2.5 rounded-lg transition-all ${activeTool === id ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.5)]" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}
        title={title}
      >
        <Icon size={18} />
      </button>
    );
  };

  return (
    <div className="w-full h-full relative border border-slate-700/50 rounded-xl overflow-hidden shadow-inner flex flex-col bg-slate-900 z-10" ref={containerRef}>
      
      {/* Floating Toolbar Context */}
      <FloatingToolbar object={activeObject} canvas={canvasInstance.current} onUpdate={triggerSave} />

      {/* Single-Row Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-1 bg-slate-900/95 backdrop-blur-md border border-slate-700/50 px-2 py-1.5 rounded-2xl shadow-2xl">

          {/* Live Toggle */}
          <button
            onClick={() => setLiveMode(!liveMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all border mr-1 ${
              liveMode
              ? 'bg-red-500/10 border-red-500/50 text-red-400'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle Live Collaboration"
          >
            <div className={`w-2 h-2 rounded-full shrink-0 ${liveMode ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-[10px] font-bold tracking-widest">LIVE</span>
          </button>

          <div className="w-px h-6 bg-slate-700/60 mx-1" />

          {/* Drawing */}
          <ToolBtn id="select" icon={MousePointer2} title="Select (Esc)" />
          <ToolBtn id="draw" icon={Pen} title="Pen (P)" />
          <ToolBtn id="highlighter" icon={Highlighter} title="Highlighter" />
          <ToolBtn id="eraser" icon={Eraser} title="Eraser (E)" />

          <div className="w-px h-6 bg-slate-700/60 mx-1" />

          {/* Shapes */}
          <ToolBtn id="rect" icon={Square} title="Rectangle (R)" />
          <ToolBtn id="circle" icon={Circle} title="Circle (C)" />
          <ToolBtn id="triangle" icon={TriangleIcon} title="Triangle" />
          <ToolBtn id="diamond" icon={Diamond} title="Diamond" />
          <ToolBtn id="line" icon={Minus} title="Line (L)" />
          <ToolBtn id="arrow" icon={ArrowUpRight} title="Arrow (A)" />

          <div className="w-px h-6 bg-slate-700/60 mx-1" />

          {/* Insert */}
          <ToolBtn id="text" icon={Type} title="Text (T)" />
          <ToolBtn id="sticky" icon={StickyNote} title="Sticky Note" />
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all" title="Insert Image">
            <ImageIcon size={18} />
          </button>

          <div className="w-px h-6 bg-slate-700/60 mx-1" />

          {/* Color & Size */}
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-7 h-7 rounded-full border-2 border-slate-600 cursor-pointer overflow-hidden p-0 bg-transparent" title="Color" />
          <input type="range" min="1" max="30" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-16 accent-blue-500 ml-1" title="Brush Size" />

          {activeTool === "draw" && (
            <React.Fragment>
              <div className="w-px h-6 bg-slate-700/60 mx-1" />
              <input type="range" min="0.1" max="1" step="0.1" value={penOpacity} onChange={(e) => setPenOpacity(parseFloat(e.target.value))} className="w-14 accent-purple-500" title="Pen Opacity" />
              <label className="flex items-center gap-1 text-xs text-slate-400 ml-1 select-none cursor-pointer whitespace-nowrap">
                <input type="checkbox" checked={smoothPen} onChange={(e) => setSmoothPen(e.target.checked)} className="rounded bg-slate-700" />
                Smooth
              </label>
            </React.Fragment>
          )}
        </div>
      </div>

      {/* View Controls (Top Right) */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        <div className="flex flex-col items-center gap-1 bg-slate-800/90 backdrop-blur-md border border-slate-700/50 p-1.5 rounded-xl shadow-xl text-slate-400">
          <button onClick={() => { setZoomLevel(100); canvasInstance.current.setZoom(1); }} className="hover:text-white p-1" title="100% Zoom"><Maximize size={16} /></button>
          <div className="text-[10px] font-bold py-1">{zoomLevel}%</div>
          <button onClick={() => { const z = Math.min(5, canvasInstance.current.getZoom() + 0.2); canvasInstance.current.zoomToPoint({x:canvasInstance.current.width/2,y:canvasInstance.current.height/2}, z); setZoomLevel(Math.round(z*100)); }} className="hover:text-white p-1 rounded hover:bg-slate-700/50"><ZoomIn size={16} /></button>
          <button onClick={() => { const z = Math.max(0.1, canvasInstance.current.getZoom() - 0.2); canvasInstance.current.zoomToPoint({x:canvasInstance.current.width/2,y:canvasInstance.current.height/2}, z); setZoomLevel(Math.round(z*100)); }} className="hover:text-white p-1 rounded hover:bg-slate-700/50"><ZoomOut size={16} /></button>
        </div>
        <div className="flex flex-col items-center gap-1 bg-slate-800/90 backdrop-blur-md border border-slate-700/50 p-1.5 rounded-xl shadow-xl text-slate-400">
           <button onClick={() => setGridEnabled(!gridEnabled)} className={`p-2 rounded-lg ${gridEnabled ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-slate-700 hover:text-white'}`} title="Show Grid"><Grid size={16} /></button>
           <button onClick={() => setSnapToGrid(!snapToGrid)} className={`p-2 rounded-lg ${snapToGrid ? 'bg-amber-500/20 text-amber-500' : 'hover:bg-slate-700 hover:text-white'}`} title="Snap to Grid"><Grid3X3 size={16} /></button>
        </div>

        {liveMode && (
          <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/50 p-1.5 rounded-xl shadow-xl">
            <OnlineUsers users={onlineUsers} currentUserId={currentUserId} />
          </div>
        )}
      </div>

      {/* Realtime Layers */}
      {liveMode && Object.entries(remoteCursors).map(([id, cursor]) => (
        <RemoteCursor key={id} cursor={cursor} canvas={canvasInstance.current} />
      ))}
      {liveMode && <LiveToast toasts={toasts} />}

      {/* Minimap (Bottom Right) */}
      <div className="absolute bottom-6 right-6 w-32 h-24 bg-slate-800/90 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-20 pointer-events-none opacity-80">
         <canvas ref={minimapRef} width={128} height={96} className="w-full h-full object-contain" />
      </div>

      <ContextMenu 
        {...contextMenu} 
        hasSelection={!!activeObject} 
        hasClipboardObject={!!clipboardObject.current}
        hasStyleClipboard={!!styleClipboard.current}
        onAction={handleContextMenuAction}
        onClose={() => setContextMenu({...contextMenu, visible: false})}
      />

      <div className="flex-1 w-full relative" style={{ minHeight: "600px" }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
