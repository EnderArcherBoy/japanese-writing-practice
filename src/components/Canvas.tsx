"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import styles from "@/styles/Button.module.css";
import Link from "next/link";
import StrokeOrder from "./StrokeOrder";

export default function WritingPractice({ character }: { character: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const pathsRef = useRef<{ x: number; y: number }[][]>([]);
  const [drawing, setDrawing] = useState(false);
  const [redoStack, setRedoStack] = useState<{ x: number; y: number }[][]>([]);
  const [showGuide, setShowGuide] = useState(true);

  // Initialize canvas once on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctxRef.current = ctx;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "black";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    // Clear any previous drawings when component mounts with a new character
    pathsRef.current = [];
    setRedoStack([]);
    redraw();
  }, [character]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pathsRef.current.forEach((path) => {
      if (path.length < 2) return;
      
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      
      ctx.stroke();
    });
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    pathsRef.current.push([{ x, y }]);
    redraw();
  }, [redraw]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    pathsRef.current[pathsRef.current.length - 1].push({ x, y });
    redraw();
  }, [drawing, redraw]);

  const stopDrawing = useCallback(() => {
    setDrawing(false);
  }, []);

  const undo = useCallback(() => {
    if (pathsRef.current.length === 0) return;
    
    const lastPath = pathsRef.current.pop();
    if (lastPath) {
      setRedoStack((prev) => [lastPath, ...prev]);
      redraw();
    }
  }, [redraw]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const pathToRestore = redoStack[0];
    pathsRef.current.push(pathToRestore);
    setRedoStack((prev) => prev.slice(1));
    redraw();
  }, [redoStack, redraw]);

  const clearCanvas = useCallback(() => {
    pathsRef.current = [];
    setRedoStack([]);
    redraw();
  }, [redraw]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "z") {
        event.preventDefault();
        undo();
      } else if (event.ctrlKey && event.key === "y") {
        event.preventDefault();
        redo();
      } else if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "x") {
        event.preventDefault();
        clearCanvas();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, clearCanvas]);

  // Add touch support
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length !== 1) return;
      
      setDrawing(true);
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
      const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
      
      pathsRef.current.push([{ x, y }]);
      redraw();
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!drawing || e.touches.length !== 1) return;
      
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
      const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
      
      pathsRef.current[pathsRef.current.length - 1].push({ x, y });
      redraw();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      setDrawing(false);
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [drawing, redraw]);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-4">{character}</h2>

      {/* Canvas + Guide */}
      <div className="relative w-[700px] h-[500px]">
        {showGuide && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
            <StrokeOrder character={character} />
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full z-10 bg-white rounded-2xl shadow-lg border border-gray-300"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>

      {/* Buttons */}
      <div className="mt-4 flex gap-4">
        <div className={styles["button-group"]}>
          <Link href="/">
            <button className={`${styles.button} ${styles.goBack}`}>Go back</button>
          </Link>
          <button 
            onClick={undo} 
            disabled={pathsRef.current.length === 0}
            className={`${styles.button} ${styles.undo}`}
          >
            Undo
          </button>
          <button 
            onClick={redo} 
            disabled={redoStack.length === 0}
            className={`${styles.button} ${styles.redo}`}
          >
            Redo
          </button>
          <button 
            onClick={clearCanvas} 
            disabled={pathsRef.current.length === 0}
            className={`${styles.button} ${styles.clear}`}
          >
            Clear
          </button>
          <button 
            onClick={() => setShowGuide(!showGuide)} 
            className={`${styles.button} ${styles.toggle}`}
          >
            {showGuide ? "Hide Guide" : "Show Guide"}
          </button>
        </div>
      </div>
    </div>
  );
}