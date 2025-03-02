"use client";
import Image from "next/image";

interface StrokeOrderProps {
  character: string;
  className?: string;
}

const getUnicodeHex = (char: string) => {
  const hex = char.codePointAt(0)?.toString(16).toLowerCase();
  return hex ? hex.padStart(5, "0") : null;
};

export default function StrokeOrder({ character, className }: StrokeOrderProps) {
  const unicodeHex = getUnicodeHex(character);
  if (!unicodeHex) return null;

  const strokeOrderSrc = `/stroke-order/${unicodeHex}.svg`;

  return (
    <div className={`absolute inset-0 flex justify-center items-center ${className}`}>
      <Image
        src={strokeOrderSrc}
        alt={`Stroke order for ${character}`}
        width={700}  // Original canvas width
        height={500} // Original canvas height
        className="w-[80%] h-[80%] object-contain opacity-30 pointer-events-none"
      />
    </div>
  );
}
