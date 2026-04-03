import React from "react";

export default function RemoteCursor({ cursor, canvas }) {
  const { x, y, userName, color } = cursor;
  
  if (!canvas) return null;

  // Convert canvas coords to relative screen coords using viewport transform
  const vpt = canvas.viewportTransform;
  const zoom = canvas.getZoom();
  
  const screenX = (x * zoom) + vpt[4];
  const screenY = (y * zoom) + vpt[5];

  return (
    <div 
      className="absolute pointer-events-none z-50 transition-all duration-75 ease-out"
      style={{ 
        left: screenX, 
        top: screenY,
        opacity: 1
      }}
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill={color} 
        stroke="white" 
        strokeWidth="1.5"
        className="drop-shadow-md"
      >
        <path d="M5.653 2.653l12.694 12.694a1.5 1.5 0 01-1.06 2.56l-5.694-.007-3.6 4.32a1.5 1.5 0 01-2.203.003L5.653 2.653z" />
      </svg>
      <div 
        className="ml-4 mt-2 px-2 py-1 rounded bg-black/80 text-white text-[10px] font-bold whitespace-nowrap border"
        style={{ borderColor: color }}
      >
        {userName}
      </div>
    </div>
  );
}
