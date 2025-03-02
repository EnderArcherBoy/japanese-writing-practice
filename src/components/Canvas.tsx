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
  const [guideOnTop, setGuideOnTop] = useState(false);
  const [canvasInitialized, setCanvasInitialized] = useState(false);

  // Initialize canvas once on mount with better performance handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true }); // Changed to true for transparency
    if (!ctx) return;

    ctxRef.current = ctx;

    // Handle high DPI displays once
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.scale(dpr, dpr);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "black";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear any previous drawings when component mounts with a new character
    pathsRef.current = [];
    setRedoStack([]);
    setCanvasInitialized(true);
  }, [character]);

  // More efficient redraw function with fewer state updates
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    // Clear canvas with a single operation
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all paths in a single pass
    ctx.beginPath();
    pathsRef.current.forEach((path) => {
      if (path.length < 2) return;

      ctx.moveTo(path[0].x, path[0].y);

      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
    });

    ctx.stroke();
  }, []);

  // Optimized drawing functions that minimize state updates
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    pathsRef.current.push([{ x, y }]);

    // Start new path immediately
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  }, []);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;

    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update the current path
    pathsRef.current[pathsRef.current.length - 1].push({ x, y });

    // Draw just the new line segment for better performance
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, [drawing]);

  const stopDrawing = useCallback(() => {
    setDrawing(false);
    // Ensure redoStack is cleared when a new stroke is completed
    setRedoStack([]);
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

    const [pathToRestore, ...restStack] = redoStack;
    pathsRef.current.push(pathToRestore);
    setRedoStack(restStack);
    redraw();
  }, [redoStack, redraw]);

  const clearCanvas = useCallback(() => {
    pathsRef.current = [];
    setRedoStack([]);
    redraw();
  }, [redraw]);

  // Toggle guide position (on top or behind)
  // Toggle guide visibility (show/hide only)
  const toggleGuidePosition = useCallback(() => {
    // Simply toggle the guide visibility
    setShowGuide(prev => !prev);
    // Always set guide on top when showing
    if (!showGuide) {
      setGuideOnTop(true);
    }
  }, [showGuide]);
  // Keyboard shortcuts with memoized handlers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "z") {
        event.preventDefault();
        undo();
      } else if ((event.metaKey || event.ctrlKey) && event.key === "y") {
        event.preventDefault();
        redo();
      } else if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "x") {
        event.preventDefault();
        clearCanvas();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, clearCanvas]);

  // Touch support with debounced handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length !== 1) return;

      setDrawing(true);
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      pathsRef.current.push([{ x, y }]);

      // Start path immediately
      const ctx = ctxRef.current;
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!drawing || e.touches.length !== 1) return;

      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      pathsRef.current[pathsRef.current.length - 1].push({ x, y });

      // Draw just the new segment
      const ctx = ctxRef.current;
      if (ctx) {
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      setDrawing(false);
      setRedoStack([]);
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [drawing]);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-4">{character}</h2>

      {/* Canvas + Guide */}
      <div className="relative w-[700px] h-[500px] bg-white">
        {/* Guide layer - positioned based on guideOnTop */}
        {showGuide && (
          <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{
              zIndex: guideOnTop ? 30 : 10,
              opacity: 0.7
            }}
          >
            <StrokeOrder character={character} />
          </div>
        )}

        {/* Base white canvas layer */}
        <div
          className="absolute top-0 left-0 w-full h-full bg-white rounded-2xl"
          style={{ zIndex: 5 }}
        />

        {/* Drawing canvas - always on top of base layer but below/above guide based on toggle */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full rounded-2xl shadow-lg border border-gray-300"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ zIndex: 20 }}
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
            onClick={toggleGuidePosition}
            className={`${styles.button} ${styles.toggle}`}
          >
            {showGuide ? "Hide Guide" : "Show Guide"}
          </button>
        </div>
      </div>
    </div>
  );
}