"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import styles from "@/styles/Button.module.css";
import Link from "next/link";
import StrokeOrder from "./StrokeOrder"; // Import the guide component

export default function WritingPractice({ character }: { character: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [paths, setPaths] = useState<{ x: number; y: number }[][]>([]);
  const [redoStack, setRedoStack] = useState<{ x: number; y: number }[][]>([]);
  const [showGuide, setShowGuide] = useState(true); // Toggle for stroke order guide

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 700 * dpr;
    canvas.height = 500 * dpr;
    canvas.style.width = "700px";
    canvas.style.height = "500px";
    ctx.scale(dpr, dpr);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDrawing(true);
    setPaths((prev) => [...prev, [{ x, y }]]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPaths((prev) => {
      const newPaths = [...prev];
      newPaths[newPaths.length - 1].push({ x, y });
      return newPaths;
    });
  };

  const stopDrawing = () => {
    setDrawing(false);
    setRedoStack([]);
  };

  const redraw = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "black";

    paths.forEach((path) => {
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      path.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    });
  }, [paths]);

  useEffect(() => {
    redraw();
  }, [paths, redraw]);

  const undo = useCallback(() => {
    if (paths.length === 0) return;
    setRedoStack((prev) => [paths[paths.length - 1], ...prev]);
    setPaths((prev) => prev.slice(0, -1));
  }, [paths]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    setPaths((prev) => [...prev, redoStack[0]]);
    setRedoStack((prev) => prev.slice(1));
  }, [redoStack]);

  const clearCanvas = useCallback(() => {
    setPaths([]);
    setRedoStack([]);
  }, []);

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
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo, clearCanvas]);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-4">{character}</h2>

      {/* Canvas + Guide Wrapper */}
      <div className="relative w-[700px] h-[500px]">
        {/* Stroke Order Guide */}
        {showGuide && (
          <div className="absolute top-0 left-0 w-full h-full z-0">
            <StrokeOrder character={character} />
          </div>
        )}
        {/* Drawing Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full z-10 bg-transparent rounded-2xl shadow-lg border border-gray-300"
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
            <button className={`${styles.button} ${styles.goBack}`}>
              Go back
            </button>
          </Link>
          <button onClick={undo} className={`${styles.button} ${styles.undo}`}>
            Undo
          </button>
          <button onClick={redo} className={`${styles.button} ${styles.redo}`}>
            Redo
          </button>
          <button onClick={clearCanvas} className={`${styles.button} ${styles.clear}`}>
            Clear
          </button>
          {/* Toggle Guide Button */}
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
