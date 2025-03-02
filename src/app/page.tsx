"use client";
import Link from "next/link";
import { toHiragana, toKatakana } from "wanakana";
import kanjiDataRaw from "@/data/kanji.json" assert { type: "json" };
// Update the type to accept null values for jlpt_new
type KanjiDataType = Record<string, { jlpt_new?: number | null }>;
const kanjiData = kanjiDataRaw as KanjiDataType;

// Define Gojuon order
const baseSounds = ["a", "i", "u", "e", "o"];
const consonants = ["", "k", "s", "t", "n", "h", "m", "y", "r"];

// Generate sorted Hiragana/Katakana
const hiragana = consonants.map((c) =>
  baseSounds.map((v) => (c === "y" && (v === "i" || v === "e") ? null : toHiragana(c + v)))
);
const katakana = consonants.map((c) =>
  baseSounds.map((v) => (c === "y" && (v === "i" || v === "e") ? null : toKatakana(c + v)))
);

// Fix W-column manually (avoid extra vowels)
hiragana.push(["わ", "を"]);
katakana.push(["ワ", "ヲ"]);

// Additional characters
hiragana.push(["ん"]);
katakana.push(["ン"]);

// Function to get Kanji by JLPT level - modify to handle null values
const getKanjiByJLPT = (level: number) => {
  return Object.keys(kanjiData)
    .filter((kanji) => kanjiData[kanji].jlpt_new === level)
    .join("");
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Japanese Writing Practice</h1>

      {/* Hiragana */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Hiragana</h2>
        <div className="grid grid-cols-5 gap-2">
          {hiragana.flat().map((char, index) => (
            char ? (
              <Link key={`char-${index}`} href={`/practice/${char}`} className="p-2 border rounded flex justify-center items-center w-10 h-10">
                {char}
              </Link>
            ) : (
              <span key={`empty-${index}`} className="w-10 h-10 flex justify-center items-center"></span> // Unique key for empty spaces
            )
          ))}
        </div>
      </section>

      {/* Katakana */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Katakana</h2>
        <div className="grid grid-cols-5 gap-2">
          {katakana.flat().map((char, index) => (
            char ? (
              <Link key={`char-${index}`} href={`/practice/${char}`} className="p-2 border rounded flex justify-center items-center w-10 h-10">
                {char}
              </Link>
            ) : (
              <span key={`empty-${index}`} className="w-10 h-10 flex justify-center items-center"></span> // Unique key for empty spaces
            )
          ))}
        </div>
      </section>

      {/* Kanji */}
      {[5, 4, 3, 2, 1].map((level) => (
        <section key={level} className="mb-6">
          <h2 className="text-xl font-semibold mb-2">JLPT N{level} Kanji</h2>
          <div className="grid grid-cols-10 gap-2">
            {getKanjiByJLPT(level).split("").map((char) => (
              <Link key={char} href={`/practice/${char}`} className="p-2 border rounded flex justify-center items-center w-10 h-10">
                {char}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}