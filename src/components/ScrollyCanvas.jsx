import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent } from "framer-motion";

export const ScrollyCanvas = ({ scrollYProgress }) => {
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);

  const renderFrame = (index, imgArray) => {
    if (!canvasRef.current || !imgArray || imgArray.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use current frame or nearest loaded fallback frame
    let img = imgArray[index];
    if (!img || !img.complete) {
      for (let offset = 1; offset < imgArray.length; offset++) {
        if (imgArray[index - offset] && imgArray[index - offset].complete) {
          img = imgArray[index - offset];
          break;
        }
        if (imgArray[index + offset] && imgArray[index + offset].complete) {
          img = imgArray[index + offset];
          break;
        }
      }
    }
    if (!img || !img.complete) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const hRatio = rect.width / img.width;
    const vRatio = rect.height / img.height;
    const ratio = Math.max(hRatio, vRatio);
    const centerShift_x = (rect.width - img.width * ratio) / 2;
    const centerShift_y = (rect.height - img.height * ratio) / 2;

    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      centerShift_x,
      centerShift_y,
      img.width * ratio,
      img.height * ratio
    );
  };

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

    imagesRef.current = loadedImages;
    setImages(loadedImages);

    // Initial render: if frame 0 is already cached, draw immediately; else on load
    if (loadedImages[0]) {
      if (loadedImages[0].complete) {
        renderFrame(0, loadedImages);
      } else {
        loadedImages[0].onload = () => {
          renderFrame(0, loadedImages);
        };
      }
    }

    const handleResize = () => {
      if (imagesRef.current.length > 0) {
        renderFrame(currentFrameRef.current, imagesRef.current);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const imgList = imagesRef.current.length > 0 ? imagesRef.current : images;
    if (imgList.length === 0) return;

    // Map scroll progress strictly to the frame count
    const frameIndex = Math.min(
      imgList.length - 1,
      Math.max(0, Math.floor(latest * imgList.length))
    );

    if (frameIndex !== currentFrameRef.current) {
      currentFrameRef.current = frameIndex;
      renderFrame(frameIndex, imgList);
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
