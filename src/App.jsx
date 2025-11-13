import { useState, useRef } from "react";
import ChampionCard from "./components/ChampionCard";
import RuneDisplay from "./components/RuneDisplay";
import SpellDisplay from "./components/SpellDisplay";
import ItemDisplay from "./components/ItemDisplay";
import LaneSelector from "./components/LaneSelector";

export default function App() {
  const champRef = useRef();
  const runeRef = useRef();
  const spellRef = useRef();
  const itemRef = useRef();
  const [mode, setMode] = useState(null);
  const [instant, setInstant] = useState(false);
  const [hasSmite, setHasSmite] = useState(false);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [currentChampion, setCurrentChampion] = useState(null);
  const [testChampion, setTestChampion] = useState(null); 


  const randomAll = async () => {
    if (isRandomizing) {
      return;
    }

    setIsRandomizing(true);
    try {
      // 1️⃣ Champion
      let champion = null;
      if (champRef.current?.randomizeSequential) {
        champion = await champRef.current.randomizeSequential(instant);
      } else {
        champion = await champRef.current.randomize(instant);
      }
      setCurrentChampion(champion);

      // 2️⃣ Spell — nhận kết quả trả về, xác định có Smite hay không
      let smitePicked = false;
      if (spellRef.current?.randomizeSequential) {
        const spells = await spellRef.current.randomizeSequential(instant);
        smitePicked = spells?.some(
          (s) =>
            s.id === "SummonerSmite" ||
            s.name?.toLowerCase().includes("trừng phạt") ||
            s.name?.toLowerCase().includes("smite")
        );
        setHasSmite(smitePicked); // vẫn cập nhật state cho UI, nhưng không dùng ngay lập tức
      } else {
        spellRef.current?.randomize(instant);
      }

      // 3️⃣ Rune
      if (runeRef.current?.randomizeSequential) {
        await runeRef.current.randomizeSequential(instant);
      } else {
        runeRef.current?.randomize(instant);
      }

      // 4️⃣ Item — DÙNG GIÁ TRỊ TỪ BIẾN `smitePicked`, KHÔNG DÙNG STATE
      if (itemRef.current?.randomizeSequential) {
        await itemRef.current.randomizeSequential(instant, smitePicked);
      } else {
        itemRef.current?.randomize(instant, smitePicked);
      }
    } finally {
      setIsRandomizing(false);
    }
  };

  const handleTestCassiopeia = () => {
    const fakeChampion = {
      name: "Cassiopeia",
      attackRange: 550, // Cassiopeia là ranged
      rangeType: "ranged",
    };
    setTestChampion(fakeChampion);
    alert("✅ Test Cassiopeia đã được bật! Hãy nhấn Random All để kiểm tra.");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-3xl font-bold mb-4">🎲 Random LOL</h1>
      <LaneSelector mode={mode} setMode={setMode} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl items-stretch">
        <div className="flex flex-row md:flex-col gap-4 items-stretch">
          <ChampionCard ref={champRef} instant={instant} />
          <SpellDisplay ref={spellRef} instant={instant} onSmiteChange={setHasSmite} mode={mode}/>
        </div>
        <div className="flex flex-row md:flex-col gap-4 items-stretch">
          <RuneDisplay ref={runeRef} instant={instant} />
          {/* vẫn truyền hasSmite xuống để hiển thị UI đúng */}
          <ItemDisplay ref={itemRef} instant={instant} hasSmite={hasSmite} mode={mode} champion={testChampion} />
        </div>
      </div>
      <div className="flex justify-center gap-4 items-center w-full">
        <button
          onClick={randomAll}
          disabled={isRandomizing}
          className={`px-8 py-3 rounded-2xl text-lg font-semibold transition-all ${
            isRandomizing
              ? "bg-gray-500 cursor-wait"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isRandomizing
            ? `Randoming...`
            : "Random All!"}
        </button>

        <button
          onClick={() => setInstant(!instant)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white h-full"
        >
          {instant ? "Instant Mode" : "Rolling Mode"}
        </button>
        {/* <button
          onClick={handleTestCassiopeia}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white"
        >
          Test Cassiopeia
        </button> */}
      </div>
    </div>
  );
}
