import { useState, useEffect, useRef } from "react";
import ChampionCard from "./components/ChampionCard";
import RuneDisplay from "./components/RuneDisplay";
import SpellDisplay from "./components/SpellDisplay";
import ItemDisplay from "./components/ItemDisplay";

export default function App() {
  
  const champRef = useRef();
  const runeRef = useRef();
  const spellRef = useRef();
  const itemRef = useRef();
  const [instant, setInstant] = useState(false);

  const randomAll = () => {
    if (champRef.current) champRef.current.randomize(!instant);
    if (runeRef.current) runeRef.current.randomize(!instant);
    if (spellRef.current) spellRef.current.randomize(!instant);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-3xl font-bold mb-4">🎲 Random LOL</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl items-stretch">
        <div className="flex flex-row md:flex-col gap-4 items-stretch">
          <ChampionCard ref={champRef} instant={instant}/>
          <SpellDisplay ref={spellRef} instant={instant}/>
        </div>
        <div className="flex flex-row md:flex-col gap-4 items-stretch">
          <RuneDisplay ref={runeRef} instant={instant}/>
          <ItemDisplay ref={itemRef} instant={instant}/>
        </div>
      </div>

      <button
        onClick={() => randomAll(true)}
        className="mt-6 px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-2xl text-lg font-semibold"
      >
        Random All!
      </button>
      <button
          onClick={() => setInstant(!instant)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
        >
          {instant ? "Instant Mode" : "Rolling Mode"}
        </button>
    </div>
  );
}
