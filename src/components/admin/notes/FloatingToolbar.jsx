import React, { useState, useEffect } from "react";
import { Copy, Trash2, ArrowUpToLine, ArrowDownToLine, Lock, Unlock, Bold, Italic, Underline, AlignLeft, AlignCenterHorizontal, AlignRight, AlignStartVertical, AlignCenterVertical, AlignEndVertical } from "lucide-react";

export default function FloatingToolbar({ object, canvas, onUpdate }) {
  const [opacity, setOpacity] = useState(1);
  const [locked, setLocked] = useState(false);
  
  // Text specific
  const [isText, setIsText] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState("Inter");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  useEffect(() => {
    if (!object) return;
    
     
    setOpacity(object.opacity || 1);
    setLocked(!object.selectable);

    if (object.type === "i-text" || object.type === "text") {
      setIsText(true);
      setFontSize(object.fontSize || 18);
      setFontFamily(object.fontFamily || "Inter");
      setIsBold(object.fontWeight === "bold");
      setIsItalic(object.fontStyle === "italic");
      setIsUnderline(object.underline || false);
    } else {
      setIsText(false);
    }
  }, [object]);

  if (!object || !canvas) return null;

  // Calculate position (fixed relative to canvas parent)
  // Fabric object.oCoords provides corner coordinates
  const oCoords = object.oCoords;
  const top = oCoords?.tl?.y ? oCoords.tl.y - 60 : 0;
  const left = oCoords?.tl?.x ? oCoords.tl.x : 0;

  const style = {
    top: Math.max(10, top),
    left: Math.max(10, left),
  };

  const updateProp = (key, value) => {
    object.set(key, value);
    canvas.renderAll();
    onUpdate();
  };

  const handleOpacity = (val) => {
    const o = parseFloat(val);
    setOpacity(o);
    updateProp("opacity", o);
  };

  const toggleLock = () => {
    const nextLocked = !locked;
    object.set({
      selectable: !nextLocked,
      evented: !nextLocked,
      lockMovementX: nextLocked,
      lockMovementY: nextLocked,
      lockRotation: nextLocked,
      lockScalingX: nextLocked,
      lockScalingY: nextLocked
    });
    setLocked(nextLocked);
    canvas.discardActiveObject(); // Deselect to apply lock
    canvas.renderAll();
    onUpdate();
  };

  const handleAlign = (type) => {
    const bounds = object.getBoundingRect();
    const canvasW = canvas.width;
    const canvasH = canvas.height;
    
    switch (type) {
      case "left": object.set("left", 0); break;
      case "center-h": object.set("left", (canvasW / 2) - (bounds.width / 2)); break;
      case "right": object.set("left", canvasW - bounds.width); break;
      case "top": object.set("top", 0); break;
      case "center-v": object.set("top", (canvasH / 2) - (bounds.height / 2)); break;
      case "bottom": object.set("top", canvasH - bounds.height); break;
      default: break;
    }
    object.setCoords();
    canvas.renderAll();
    onUpdate();
  }

  // --- Text Callbacks ---
  const toggleBold = () => {
    const next = !isBold;
    setIsBold(next);
    updateProp("fontWeight", next ? "bold" : "normal");
  };
  const toggleItalic = () => {
    const next = !isItalic;
    setIsItalic(next);
    updateProp("fontStyle", next ? "italic" : "normal");
  };
  const toggleUnderline = () => {
    const next = !isUnderline;
    setIsUnderline(next);
    updateProp("underline", next);
  };

  return (
    <div style={style} className="absolute z-30 flex items-center gap-2 bg-slate-800 border border-slate-700 p-1.5 rounded-xl shadow-xl transition-all">
      
      {/* Visual Props */}
      <div className="flex flex-col items-center px-2 border-r border-slate-700">
        <span className="text-[10px] text-slate-500 mb-0.5">Opacity</span>
        <input 
          type="range" min="0.1" max="1" step="0.1" 
          value={opacity} onChange={(e) => handleOpacity(e.target.value)}
          className="w-16 accent-blue-500 h-1"
        />
      </div>

      {isText && (
        <div className="flex items-center gap-1 border-r border-slate-700 pr-2">
          <select 
            value={fontFamily} onChange={e => { setFontFamily(e.target.value); updateProp("fontFamily", e.target.value); }}
            className="bg-slate-900 border border-slate-700 text-xs rounded p-1 text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="Inter">Sans-serif</option>
            <option value="Georgia">Serif</option>
            <option value="monospace">Monospace</option>
            <option value="cursive">Cursive</option>
          </select>
          <select 
            value={fontSize} onChange={e => { const val = parseInt(e.target.value); setFontSize(val); updateProp("fontSize", val); }}
            className="bg-slate-900 border border-slate-700 text-xs rounded p-1 text-slate-300 focus:outline-none focus:border-blue-500"
          >
            {[12,14,16,18,24,32,48,64].map(sz => <option key={sz} value={sz}>{sz}px</option>)}
          </select>

          <button onClick={toggleBold} className={`p-1.5 rounded ${isBold ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}><Bold size={14} /></button>
          <button onClick={toggleItalic} className={`p-1.5 rounded ${isItalic ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}><Italic size={14} /></button>
          <button onClick={toggleUnderline} className={`p-1.5 rounded ${isUnderline ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}><Underline size={14} /></button>
        </div>
      )}

      {/* Align Props */}
      <div className="flex items-center gap-0.5 border-r border-slate-700 pr-2">
        <button onClick={()=>handleAlign("left")} className="p-1.5 rounded text-slate-400 hover:bg-slate-700 hover:text-white" title="Align Left"><AlignLeft size={14} /></button>
        <button onClick={()=>handleAlign("center-h")} className="p-1.5 rounded text-slate-400 hover:bg-slate-700 hover:text-white" title="Center Horizontal"><AlignCenterHorizontal size={14} /></button>
        <button onClick={()=>handleAlign("right")} className="p-1.5 rounded text-slate-400 hover:bg-slate-700 hover:text-white" title="Align Right"><AlignRight size={14} /></button>
        <button onClick={()=>handleAlign("top")} className="p-1.5 rounded text-slate-400 hover:bg-slate-700 hover:text-white" title="Align Top"><AlignStartVertical size={14} /></button>
        <button onClick={()=>handleAlign("center-v")} className="p-1.5 rounded text-slate-400 hover:bg-slate-700 hover:text-white" title="Center Vertical"><AlignCenterVertical size={14} /></button>
        <button onClick={()=>handleAlign("bottom")} className="p-1.5 rounded text-slate-400 hover:bg-slate-700 hover:text-white" title="Align Bottom"><AlignEndVertical size={14} /></button>
      </div>

      {/* Layer/Action Props */}
      <div className="flex items-center gap-1">
        <button onClick={() => { canvas.bringForward(object); onUpdate(); }} className="p-1.5 rounded text-slate-400 hover:bg-slate-700 hover:text-white" title="Layer Up"><ArrowUpToLine size={14} /></button>
        <button onClick={() => { canvas.sendBackward(object); onUpdate(); }} className="p-1.5 rounded text-slate-400 hover:bg-slate-700 hover:text-white" title="Layer Down"><ArrowDownToLine size={14} /></button>
        <div className="w-px h-5 bg-slate-700 mx-1"></div>
        <button onClick={toggleLock} className={`p-1.5 rounded ${locked ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`} title="Lock/Unlock">
          {locked ? <Lock size={14} /> : <Unlock size={14} />}
        </button>
        <button onClick={() => { 
          object.clone((cloned) => {
            cloned.set({ left: object.left + 10, top: object.top + 10 });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            onUpdate();
          });
        }} className="p-1.5 rounded text-slate-400 hover:bg-slate-700 hover:text-white" title="Duplicate (Ctrl+D)"><Copy size={14} /></button>
        <button onClick={() => { canvas.remove(object); canvas.discardActiveObject(); onUpdate(); }} className="p-1.5 rounded text-red-400 hover:bg-red-500/10 hover:text-red-300" title="Delete"><Trash2 size={14} /></button>
      </div>
    </div>
  );
}
