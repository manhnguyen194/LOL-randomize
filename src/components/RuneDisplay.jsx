import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { motion } from "framer-motion";
import { FaSyncAlt } from "react-icons/fa";

// Tooltip component nhỏ gọn
function Tooltip({ text }) {
  return (
    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-56 bg-gray-900 text-white text-xs p-2 rounded-lg shadow-lg z-50">
      <div dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  );
}

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

const RuneDisplay = forwardRef(({ instant }, ref) => {
  const [runes, setRunes] = useState([]);
  const [runeSet, setRuneSet] = useState(null);
  const [hoveredRune, setHoveredRune] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rolling, setRolling] = useState(false);

  const getRandom = arr => arr[Math.floor(Math.random() * arr.length)];

  const randomStats = () => {
    const row1 = getRandom([statOptions[0], statOptions[7], statOptions[6]]);
    const row2 = getRandom([statOptions[1], statOptions[5], statOptions[8]]);
    const row3 = getRandom([statOptions[2], statOptions[3], statOptions[4]]);
    return [row1, row2, row3];
  };

  useEffect(() => {
    async function fetchRunes() {
      try {
        const versionRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
        const [latestVersion] = await versionRes.json();
        const runeRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/vi_VN/runesReforged.json`);
        const data = await runeRes.json();
        setRunes(data);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi fetch runes:", err);
        setLoading(false);
      }
    }
    fetchRunes();
  }, []);

  const randomizeRunes = () => {
    if (!runes.length) return;

    const getRandomRuneSet = () => {
      const primary = getRandom(runes);
      let secondary = getRandom(runes);
      while (secondary.id === primary.id) secondary = getRandom(runes);

      const keystone = getRandom(primary.slots[0].runes);
      const primaryMinors = primary.slots.slice(1).map(slot => getRandom(slot.runes));
      const secondaryMinors = secondary.slots.slice(1, 3).map(slot => getRandom(slot.runes));

      return {
        primary: { ...primary, keystone, minors: primaryMinors },
        secondary: { ...secondary, minors: secondaryMinors },
        stats: randomStats(), // hàm randomStats() bạn đã có
      };
    };

    if (instant) {
      setRuneSet(getRandomRuneSet());
      return;
    }

    // Rolling animation 2-3s
    setRolling(true);
    const duration = Math.random() * 1000 + 2000; // 2-3s
    const interval = setInterval(() => {
      setRuneSet(getRandomRuneSet());
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setRolling(false);
    }, duration);
  };
  useImperativeHandle(ref, () => ({
    randomize: (instant = false) => {
      randomizeRunes(instant);
    }
  }));

  const RuneIcon = ({ rune }) => (
    <div
      className="relative group"
      onMouseEnter={() => setHoveredRune(rune)}
      onMouseLeave={() => setHoveredRune(null)}
    >
      <img
        src={`https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`}
        alt={rune.name}
        className="w-10 h-10 rounded-full border border-gray-600 hover:scale-110 transition-transform duration-150"
      />
      {hoveredRune === rune && <Tooltip text={`<b>${rune.name}</b><br/>${rune.longDesc}`} />}
    </div>
  );

  if (loading) return (
    <div className="bg-gray-800 p-4 rounded-2xl shadow-lg flex flex-col items-center text-white">
      <p>Đang tải bảng ngọc...</p>
    </div>
  );

  if (!runeSet) return (
    <div className="bg-gray-800 p-4 rounded-2xl shadow-lg flex flex-col items-center text-white">
      <div className="flex justify-between items-center w-full mb-4">
        <h2 className="text-lg font-bold text-center flex-1">Bảng Ngọc</h2>
        <motion.button
          onClick={randomizeRunes}
          whileTap={{ rotate: 180 }}
          className="p-2 bg-blue-500 rounded-full text-white text-lg flex items-center justify-center"
        >
          <FaSyncAlt />
        </motion.button>
      </div>
      <p className="mt-2">Chưa chọn bảng ngọc</p>
    </div>
  );

  const { primary, secondary, stats } = runeSet;

  return (
    <div className="bg-gray-800 p-4 rounded-2xl shadow-lg flex flex-col items-center text-white w-full h-full">
      <div className="flex justify-between items-center w-full mb-4">
        <h2 className="text-lg font-bold text-center flex-1">Bảng Ngọc</h2>
        <motion.button
          onClick={randomizeRunes}
          whileTap={{ rotate: 180 }}
          className="p-2 bg-blue-500 rounded-full text-white text-lg flex items-center justify-center"
        >
          <FaSyncAlt />
        </motion.button>
      </div>

      <div className="flex flex-row gap-6 w-full">
        {/* Nhánh chính */}
        <div className="flex-[0.6] flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img 
              src={`https://ddragon.leagueoflegends.com/cdn/img/${primary.icon}`} 
              alt={primary.name} 
              className="w-6 h-6" 
            />
            <p className="font-semibold">{primary.name}</p>
          </div>

          {/* Keystone */}
          <div className="relative inline-block mb-2">
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/img/${primary.keystone.icon}`}
              alt={primary.keystone.name}
              className="w-16 h-16 mb-2 rounded-full hover:scale-110 transition-transform duration-150"
              onMouseEnter={() => setHoveredRune(primary.keystone)}
              onMouseLeave={() => setHoveredRune(null)}
            />
            {hoveredRune === primary.keystone && (
              <Tooltip text={`<b>${primary.keystone.name}</b><br/>${primary.keystone.longDesc}`} />
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {primary.minors.map((r) => <RuneIcon key={r.id} rune={r} />)}
          </div>
        </div>

        {/* Nhánh phụ + stats */}
        <div className="flex-[0.4] flex-col items-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img 
              src={`https://ddragon.leagueoflegends.com/cdn/img/${secondary.icon}`} 
              alt={secondary.name} 
              className="w-6 h-6" 
            />
            <span className="font-medium text-sm">{secondary.name}</span>
          </div>

          <div className="flex gap-2 justify-center flex-wrap mb-4">
            {secondary.minors.map((r) => <RuneIcon key={r.id} rune={r} />)}
          </div>

          <div className="mt-2 flex gap-3 justify-center flex-wrap border-t border-gray-700 pt-3">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="relative"
                onMouseEnter={() => setHoveredRune(stat)}
                onMouseLeave={() => setHoveredRune(null)}
              >
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/img/${stat.icon}`}
                  alt={stat.name}
                  className="w-8 h-8 rounded-full border border-gray-600 hover:scale-110 transition-transform duration-150"
                />
                {hoveredRune === stat && <Tooltip text={`<b>${stat.name}</b><br/>${stat.longDesc}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default RuneDisplay;