import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent } from "framer-motion";

export const ScrollyCanvas = ({ scrollYProgress }) => {
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  
  // Preload images
  useEffect(() => {
    const frameCount = 76; // 0 to 75
    const loadedImages = [];
    
    for (let i = 0; i < frameCount; i++) {
        const img = new window.Image();
        const frameIndex = i.toString().padStart(2, "0");
        img.src = `/sequence/frame_${frameIndex}_delay-0.055s.webp`;
        loadedImages.push(img);
    }
    
    setImages(loadedImages);
    
    if (loadedImages[0]) {
      loadedImages[0].onload = () => {
         renderFrame(0, loadedImages);
      }
    }
    
    const handleResize = () => {
        if (loadedImages.length > 0) {
            renderFrame(currentFrame, loadedImages); 
        }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderFrame = (index, imgArray) => {
    if (!canvasRef.current || imgArray.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imgArray[index];
    if (!img || !img.complete) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);

    const hRatio = rect.width / img.width;
    const vRatio = rect.height / img.height;
    const ratio = Math.max(hRatio, vRatio);
    const centerShift_x = (rect.width - img.width * ratio) / 2;
    const centerShift_y = (rect.height - img.height * ratio) / 2;

    ctx.clearRect(0, 0, rect.width, rect.height);
    // Use smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, img.width, img.height,
                  centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
  };

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (images.length === 0) return;
    // Map scroll progress strictly to the frame count
    const frameIndex = Math.min(
      images.length - 1,
      Math.floor(latest * images.length)
    );
    if (frameIndex !== currentFrame) {
      setCurrentFrame(frameIndex);
      renderFrame(frameIndex, images);
    }
  });

  return (
    <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full object-cover" 
        style={{ backgroundColor: "#121212" }}
    />
  );
};
