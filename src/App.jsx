import { useState, useEffect } from "react";
import ChampionCard from "./components/ChampionCard";
import RuneDisplay from "./components/RuneDisplay";
import SpellDisplay from "./components/SpellDisplay";

export default function App() {
  const [champions, setChampions] = useState([]);
  const [runes, setRunes] = useState([]);
  const [spells, setSpells] = useState([]);

  const [champion, setChampion] = useState(null);
  const [runeSet, setRuneSet] = useState(null);
  const [spellPair, setSpellPair] = useState([]);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const versionRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
      const versions = await versionRes.json();
      const latestVersion = versions[0];

      // 🔹 Champions
      const champRes = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/vi_VN/champion.json`
      );
      const champData = await champRes.json();
      const champList = Object.values(champData.data).map((c) => ({
        id: c.id,
        name: c.name,
        image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${c.image.full}`,
      }));
      setChampions(champList);

      // 🔹 Summoner Spells (only Summoner’s Rift)
      const spellRes = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/vi_VN/summoner.json`
      );
      const spellData = await spellRes.json();
      const spellList = Object.values(spellData.data)
        .filter((s) => s.modes.includes("CLASSIC"))
        .map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description, // ✅ Có trong data
          tooltip: s.tooltip,         // ✅ Fallback khi description rỗng
          image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/spell/${s.image.full}`,
        }));
      setSpells(spellList);

      // 🔹 Runes
      const runeRes = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/vi_VN/runesReforged.json`
      );
      const runeData = await runeRes.json();
      setRunes(runeData);
    }

    fetchData();
  }, []);

  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const statOptions = [
    { id: "5001", name: "Tốc độ đánh", icon: "perk-images/StatMods/StatModsAttackSpeedIcon.png", longDesc: "+10% Tốc độ đánh" },
    { id: "5002", name: "Tốc độ di chuyển", icon: "perk-images/StatMods/StatModsMovementSpeedIcon.png", longDesc: "+2.5% Tốc độ di chuyển" },
    { id: "5003", name: "Kháng hiệu ứng và Kháng làm chậm", icon: "perk-images/StatMods/StatModsTenacityIcon.png", longDesc: "+15% Kháng hiệu ứng và Kháng làm chậm" },
    { id: "5004", name: "Máu", icon: "perk-images/StatMods/StatModsHealthScalingIcon.png", longDesc: "+65 Máu" },
    { id: "5005", name: "Máu tăng tiến", icon: "perk-images/StatMods/StatModsHealthPlusIcon.png", longDesc: "+10-180 Máu (theo cấp)" },
    { id: "5006", name: "Máu tăng tiến", icon: "perk-images/StatMods/StatModsHealthPlusIcon.png", longDesc: "+10-180 Máu (theo cấp)" },
    { id: "5007", name: "Điểm hồi kỹ năng", icon: "perk-images/StatMods/StatModsCDRScalingIcon.png", longDesc: "+8 Điểm hồi kỹ năng" },
    { id: "5008", name: "Sức mạnh thích ứng", icon: "perk-images/StatMods/StatModsAdaptiveForceIcon.png", longDesc: "+9 Sức Mạnh Thích Ứng" },
    { id: "5009", name: "Sức mạnh thích ứng", icon: "perk-images/StatMods/StatModsAdaptiveForceIcon.png", longDesc: "+9 Sức Mạnh Thích Ứng" },
  ];
  function randomStats() {
    const statRows = [
      ["5008", "5001", "5007"], // hàng 1
      ["5009", "5002", "5005"], // hàng 2
      ["5004", "5003", "5006"], // hàng 3
    ];
    return statRows.map(row => {
      const options = statOptions.filter(opt => row.includes(opt.id));
      return getRandom(options);
    });
  }
  function randomSpells() {
    if (spells.length < 2) return [];
    let first = getRandom(spells);
    let second = getRandom(spells);
    while (second.id === first.id) second = getRandom(spells);
    return [first, second];
  }

  function randomRunes() {
    if (runes.length < 2) return null;

    const primary = getRandom(runes);
    let secondary = getRandom(runes);
    while (secondary.id === primary.id) secondary = getRandom(runes);

    const keystone = getRandom(primary.slots[0].runes);
    const minors = primary.slots.slice(1).map(slot => getRandom(slot.runes));
    const subs = secondary.slots.slice(1, 3).map(slot => getRandom(slot.runes));
    const stats = randomStats();

    return {
      primary: {
        name: primary.name,
        icon: `https://ddragon.leagueoflegends.com/cdn/img/${primary.icon}`,
        keystone,
        minors,
      },
      secondary: {
        name: secondary.name,
        icon: `https://ddragon.leagueoflegends.com/cdn/img/${secondary.icon}`,
        minors: subs,
      },
      stats,
    };
  }

  function randomize() {
    if (!champions.length || !runes.length || !spells.length) return;

    setIsRolling(true);
    const duration = Math.random() * 1000 + 2000;

    const interval = setInterval(() => {
      setChampion(getRandom(champions));
      setSpellPair(randomSpells());
      setRuneSet(randomRunes());
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setIsRolling(false);
    }, duration);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-3xl font-bold mb-4">🎲 Random LOL</h1>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl items-stretch">
      {/* Cột 1: Tướng + Phép bổ trợ */}
      <div className="flex flex-row md:flex-col gap-4 items-stretch">
        <ChampionCard champion={champion} />
        <SpellDisplay spells={spellPair} />
      </div>

      {/* Cột 2: Bảng Ngọc */}
      <RuneDisplay runeSet={runeSet} />
    </div>


      <button
        onClick={randomize}
        disabled={isRolling}
        className="mt-6 px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-2xl text-lg font-semibold"
      >
        {isRolling ? "Đang random..." : "Random!"}
      </button>
    </div>
  );
}
