import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Plus, Trash2, CheckCircle2, Circle, CheckSquare } from "lucide-react";

export default function ChecklistEditor({ initialContent, onChange }) {
  const [items, setItems] = useState(() => {
    return Array.isArray(initialContent) ? initialContent : [];
  });
  const [newItemText, setNewItemText] = useState("");

  const notifyChange = (newItems) => {
    setItems(newItems);
    onChange(newItems);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const newItems = [...items, { id: crypto.randomUUID(), text: newItemText.trim(), checked: false }];
    notifyChange(newItems);
    setNewItemText("");
  };

  const handleToggle = (id) => {
    const newItems = items.map(item => item.id === id ? { ...item, checked: !item.checked } : item);
    notifyChange(newItems);
  };

  const handleEditText = (id, text) => {
    const newItems = items.map(item => item.id === id ? { ...item, text } : item);
    notifyChange(newItems);
  };

  const handleDelete = (id) => {
    const newItems = items.filter(item => item.id !== id);
    notifyChange(newItems);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(items);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    notifyChange(reordered);
  };

  const completed = items.filter(i => i.checked).length;
  const progress = items.length === 0 ? 0 : Math.round((completed / items.length) * 100);

  return (
    <div className="w-full h-full flex flex-col bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden shadow-inner p-6">
      
      {/* Progress Bar */}
      {items.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-slate-300">Progress</span>
            <span className="text-xs text-slate-500 font-mono">{progress}% ({completed}/{items.length})</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Item List using DnD */}
      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="checklist">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                          snapshot.isDragging ? "bg-slate-700 border-blue-500/50 shadow-xl" : "bg-slate-900/50 border-slate-700/50 hover:border-slate-600"
                        } ${item.checked ? "opacity-60 grayscale-[50%]" : ""}`}
                      >
                        <div {...provided.dragHandleProps} className="text-slate-500 hover:text-white mt-1 cursor-grab">
                          <GripVertical size={16} />
                        </div>
                        
                        <button onClick={() => handleToggle(item.id)} className={`mt-0.5 transition-colors flex-shrink-0 ${item.checked ? "text-green-500" : "text-slate-400 hover:text-white"}`}>
                          {item.checked ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>
                        
                        <div className="flex-1">
                          <textarea
                            value={item.text}
                            onChange={(e) => handleEditText(item.id, e.target.value)}
                            className={`w-full bg-transparent border-none focus:ring-0 p-0 text-sm resize-none overflow-hidden focus:outline-none min-h-[24px] ${item.checked ? "text-slate-400 line-through" : "text-slate-200"}`}
                            rows={1}
                            onInput={(e) => {
                              e.target.style.height = 'auto';
                              e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                          />
                        </div>

                        <button onClick={() => handleDelete(item.id)} className="text-slate-500 hover:text-red-400 mt-0.5 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {items.length === 0 && (
          <div className="text-center py-10 mt-10">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckSquare size={32} className="text-slate-500" />
            </div>
            <p className="text-slate-400 text-sm">Your checklist is empty.</p>
          </div>
        )}
      </div>

      {/* Add New Item */}
      <form onSubmit={handleAddItem} className="pt-4 border-t border-slate-700/50 flex gap-3 mt-auto">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add a new item..."
          className="flex-1 bg-slate-900 border border-slate-700 text-sm text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-slate-500"
        />
        <button 
          type="submit" 
          disabled={!newItemText.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white px-5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Add
        </button>
      </form>
    </div>
  );
}
