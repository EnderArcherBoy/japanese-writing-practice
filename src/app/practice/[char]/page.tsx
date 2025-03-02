"use client";
import { useParams } from "next/navigation";
import WritingPractice from "@/components/Canvas";
import Link from "next/link";

export default function PracticePage() {
  const params = useParams();
  // Safely handle string or array of strings
  const charParam = Array.isArray(params.char) ? params.char[0] : params.char;
  const decodedChar = charParam ? decodeURIComponent(charParam) : '';

  return (
    <main className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">
        <Link href="/" className="hover:underline">
          Japanese Writing Practice
        </Link>
        {" > "}{decodedChar}
      </h1>
      
      {/* The StrokeOrder component is now handled inside WritingPractice */}
      <WritingPractice character={decodedChar} />
    </main>
  );
}