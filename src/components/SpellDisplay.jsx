import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { motion } from "framer-motion";
import { FaSyncAlt } from "react-icons/fa";

function Tooltip({ spell }) {
  if (!spell) return null;

  return (
    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-64 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg z-50">
      <div
        dangerouslySetInnerHTML={{
          __html: `<b>${spell.name}</b><br/>${spell.description || spell.tooltip || "No description available."}`,
        }}
      />
    </div>
  );
}

const SpellDisplay = forwardRef(({ instant }, ref) => {
  const [spells, setSpells] = useState([]);
  const [selectedSpells, setSelectedSpells] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rolling, setRolling] = useState(false);

   // Fetch spells từ DDragon
  useEffect(() => {
    async function fetchSpells() {
      try {
        const versionRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
        const [latestVersion] = await versionRes.json();
        const spellRes = await fetch(
          `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/vi_VN/summoner.json`
        );
        const data = await spellRes.json();
        const list = Object.values(data.data)
          .filter(s => s.modes.includes("CLASSIC"))
          .map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            tooltip: s.tooltip,
            image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/spell/${s.image.full}`,
          }));
        setSpells(list);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi fetch spell:", err);
        setLoading(false);
      }
    }
    fetchSpells();
  }, []);

  const randomizeSpells = () => {
    if (spells.length < 2) return;

    const getRandomPair = () => {
      let first = spells[Math.floor(Math.random() * spells.length)];
      let second;
      do {
        second = spells[Math.floor(Math.random() * spells.length)];
      } while (second.id === first.id);
      return [first, second];
    };

    if (instant) {
      setSelectedSpells(getRandomPair());
      return;
    }

    // Rolling animation 2-3s
    setRolling(true);
    const duration = Math.random() * 1000 + 2000; // 2-3s
    const interval = setInterval(() => {
      setSelectedSpells(getRandomPair());
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setRolling(false);
    }, duration);
  };
  useImperativeHandle(ref, () => ({
    randomize: (instant = false) => {
      randomizeSpells(instant);
    }
  }));

  if (loading)
    return (
      <div className="bg-gray-800 p-4 rounded-2xl shadow-lg flex-[0.6] flex-col items-center text-center text-white">
        <p>Đang tải phép bổ trợ...</p>
      </div>
    );

  return (
    <div className="bg-gray-800 p-4 rounded-2xl shadow-lg flex-[0.6] flex-col items-center">
      <div className="flex gap-4 justify-center mb-4">
        <p className="text-lg font-bold">Phép bổ trợ</p>
        <motion.button
          onClick={randomizeSpells}
          whileTap={{ rotate: 180 }}
          className="p-2 bg-blue-500 rounded-full text-white text-lg flex items-center justify-center"
        >
          <FaSyncAlt />
        </motion.button>
      </div>

      <div className="flex gap-4 justify-around">
        {selectedSpells.length === 0 ? (
          <p>Chưa chọn phép</p>
        ) : (
          selectedSpells.map(s => (
            <div
              key={s.id}
              className="relative flex flex-col items-center group"
              onMouseEnter={() => setHoveredId(s.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <img
                src={s.image}
                alt={s.name}
                className="w-14 h-14 rounded-md border border-gray-700 hover:scale-110 transition-transform duration-150"
              />
              <p className="text-sm mt-1">{s.name}</p>
              {hoveredId === s.id && <Tooltip spell={s} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
});

export default SpellDisplay;