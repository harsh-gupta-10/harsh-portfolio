import { useState } from "react";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

export default function WhiteboardEditor({ initialData, onChange, setThumbnailBlob }) {
  
  const handleMount = (editor) => {
    // Attempt to load initial snapshot if it belongs to tldraw
    // (We ignore excalidraw data to prevent crashes)
    if (initialData && typeof initialData === 'object' && Object.keys(initialData).length > 0) {
      try {
        // Excalidraw used to have .elements. If it has .elements or is an array, we must ignore it!
        if (initialData.elements || Array.isArray(initialData)) return; 
        
        // Load the tldraw snapshot
        editor.store.loadSnapshot(initialData);
      } catch (e) {
        console.warn("Failed to load tldraw snapshot", e);
      }
    }

    // Subscribe to store changes for auto-saving
    editor.store.listen(() => {
      try {
        const snapshot = editor.store.getSnapshot();
        // Strip signal/proxy objects via deep copy so Supabase-JS network client doesn't silently reject it
        const serialized = JSON.parse(JSON.stringify(snapshot));
        onChange(serialized);
      } catch (e) {
        // Ignore rapid reading errors
      }
    });
  };

  return (
    <div className="w-full h-full relative border border-slate-700/50 rounded-xl overflow-hidden shadow-inner flex flex-col pt-1">
      <div className="flex-1 w-full relative" style={{ minHeight: "600px", zIndex: 1 }}>
        <Tldraw 
          onMount={handleMount}
          // The canvas itself manages its internal theme via user preferences, but inferDarkMode sets it by default
          inferDarkMode
        />
      </div>
    </div>
  );
}
