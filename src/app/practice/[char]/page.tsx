"use client";
import { useParams } from "next/navigation";
import WritingPractice from "@/components/Canvas";
import StrokeOrder from "@/components/StrokeOrder";

export default function PracticePage() {
  const { char } = useParams();
  const decodedChar = decodeURIComponent(char);

  return (
    <main className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">{decodedChar} - Writing Practice</h1>
      
      {/* Container for Stroke Order + Canvas */}
      <div className="relative w-[700px] h-[500px]">
        {/* Stroke Order Overlay with adjusted opacity and sizing */}
        <StrokeOrder character={decodedChar} className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none" />

        {/* Writing Practice Canvas */}
        <WritingPractice character={decodedChar} />
      </div>
    </main>
  );
}
