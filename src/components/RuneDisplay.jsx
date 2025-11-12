import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { motion } from "framer-motion";
import { FaSyncAlt } from "react-icons/fa";

// 🧩 Tooltip tự động định vị
function Tooltip({ rune, parentRef }) {
  if (!rune || !parentRef?.current) return null;

  const rect = parentRef.current.getBoundingClientRect();
  const spaceAbove = rect.top;
  const spaceBelow = window.innerHeight - rect.bottom;
  const showAbove = spaceAbove > spaceBelow;
  const positionClass = showAbove ? "bottom-full mb-1" : "top-full mt-1";

  return (
    <div
      className={`absolute ${positionClass} left-1/2 transform -translate-x-1/2 w-72 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg z-50 overflow-y-auto max-h-64`}
      style={{ maxWidth: "90vw", wordWrap: "break-word" }}
    >
      <div
        dangerouslySetInnerHTML={{
          __html: `<b>${rune.name}</b><br/>${rune.longDesc || rune.shortDesc || ""}`,
        }}
      />
    </div>
  );
}

// 🧩 Slot hiển thị ngọc hoặc stat có tooltip
function RuneSlot({ rune, hoveredId, setHoveredId }) {
  const ref = useRef(null);
  return (
    <div
      ref={ref}
      className="relative flex flex-col items-center group"
      onMouseEnter={() => setHoveredId(rune.id)}
      onMouseLeave={() => setHoveredId(null)}
    >
      <img
        src={`https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`}
        alt={rune.name}
        className="w-10 h-10 rounded-full border border-gray-700 hover:scale-110 transition-transform duration-150"
      />
      {hoveredId === rune.id && <Tooltip rune={rune} parentRef={ref} />}
    </div>
  );
}
function Rune({ rune, hoveredId, setHoveredId }) {
  const ref = useRef(null);
  return (
    <div
      ref={ref}
      className="relative flex flex-col items-center group"
      onMouseEnter={() => setHoveredId(rune.id)}
      onMouseLeave={() => setHoveredId(null)}
    >
      <img
        src={`https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`}
        alt={rune.name}
        className="w-20 h-20 hover:scale-110 transition-transform duration-150"
      />
      {hoveredId === rune.id && <Tooltip rune={rune} parentRef={ref} />}
    </div>
  );
}

// 🧩 Slot riêng cho các chỉ số cộng thêm
function StatSlot({ stat, hoveredId, setHoveredId }) {
  const ref = useRef(null);
  return (
    <div
      ref={ref}
      className="relative flex flex-col items-center"
      onMouseEnter={() => setHoveredId(stat.id)}
      onMouseLeave={() => setHoveredId(null)}
    >
      <img
        src={`https://ddragon.leagueoflegends.com/cdn/img/${stat.icon}`}
        alt={stat.name}
        className="w-7 h-7 rounded-full border border-gray-600 hover:scale-110 transition-transform duration-150"
      />
      {hoveredId === stat.id && <Tooltip rune={stat} parentRef={ref} />}
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
  const [hoveredId, setHoveredId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rolling, setRolling] = useState(false);

  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const randomStats = () => [
    getRandom([statOptions[0], statOptions[7], statOptions[6]]),
    getRandom([statOptions[1], statOptions[5], statOptions[8]]),
    getRandom([statOptions[2], statOptions[3], statOptions[4]]),
  ];

  useEffect(() => {
    async function fetchRunes() {
      try {
        const versionRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
        const [latestVersion] = await versionRes.json();
        const runeRes = await fetch(
          `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/vi_VN/runesReforged.json`
        );
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

  const getRandomRuneSet = () => {
    const primary = getRandom(runes);
    let secondary = getRandom(runes);
    while (secondary.id === primary.id) secondary = getRandom(runes);

    const keystone = getRandom(primary.slots[0].runes);
    const primaryMinors = primary.slots.slice(1).map((slot) => getRandom(slot.runes));
    const secondaryMinors = secondary.slots.slice(1, 3).map((slot) => getRandom(slot.runes));

    return {
      primary: { ...primary, keystone, minors: primaryMinors },
      secondary: { ...secondary, minors: secondaryMinors },
      stats: randomStats(),
    };
  };

  const randomizeRunes = (useInstant = false) =>
    new Promise((resolve) => {
      if (!runes.length) return resolve(null);

      if (useInstant) {
        const finalSet = getRandomRuneSet();
        setRuneSet(finalSet);
        resolve(finalSet);
        return;
      }

      setRolling(true);
      const duration = Math.random() * 1000 + 1000;
      const interval = setInterval(() => {
        setRuneSet(getRandomRuneSet());
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        const finalSet = getRandomRuneSet();
        setRuneSet(finalSet);
        setRolling(false);
        resolve(finalSet);
      }, duration);
    });

  useImperativeHandle(ref, () => ({
    randomize: (useInstant = false) => randomizeRunes(useInstant),
    randomizeSequential: (useInstant = false) => randomizeRunes(useInstant),
  }));

  if (loading)
    return (
      <div className="bg-gray-800 p-4 rounded-2xl shadow-lg flex flex-col items-center text-white">
        <p>Đang tải bảng ngọc...</p>
      </div>
    );

  if (!runeSet)
    return (
      <div className="bg-gray-800 p-4 rounded-2xl shadow-lg flex flex-col items-center text-white">
        <div className="flex justify-between items-center w-full mb-4">
          <h2 className="text-lg font-bold text-center flex-1">Bảng Ngọc</h2>
          <motion.button
            onClick={() =>randomizeRunes(instant)}
            whileTap={{ rotate: 100 }}
            className="p-2 rounded-full flex items-center justify-center"
          >
            <img
              src="/icon/util/Reroll.png"
              alt="reroll"
              className="w-8 h-8 object-contain"
            />
          </motion.button>
        </div>
        <p className="mt-2">Chưa chọn bảng ngọc</p>
      </div>
    );

  const { primary, secondary, stats } = runeSet;

  return (
    <div className="bg-gray-800 p-4 rounded-2xl shadow-lg flex flex-col items-center text-white w-full h-full overflow-visible">
      <div className="flex justify-between items-center w-full mb-4">
        <h2 className="text-lg font-bold text-center flex-1">Bảng Ngọc</h2>
        <motion.button
          onClick={() =>randomizeRunes(instant)}
          whileTap={{ rotate: 100 }}
          className="p-2 rounded-full flex items-center justify-center"
        >
          <img
            src="/icon/util/Reroll.png"
            alt="reroll"
            className="w-8 h-8 object-contain"
          />
        </motion.button>
      </div>

      <div className="flex flex-row gap-6 w-full justify-around overflow-visible">
        {/* 🩸 Nhánh chính */}
        <div className="flex flex-col items-center flex-1 overflow-visible">
          <div className="flex items-center gap-2 mb-2">
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/img/${primary.icon}`}
              alt={primary.name}
              className="w-6 h-6"
            />
            <p className="font-semibold">{primary.name}</p>
          </div>

          <Rune rune={primary.keystone} hoveredId={hoveredId} setHoveredId={setHoveredId} />
          <div className="flex flex-wrap gap-4 justify-center mt-2">
            {primary.minors.map((r) => (
              <RuneSlot key={r.id} rune={r} hoveredId={hoveredId} setHoveredId={setHoveredId} />
            ))}
          </div>
        </div>

        {/* 🌀 Nhánh phụ + stats */}
        <div className="flex flex-col items-center flex-1 overflow-visible">
          <div className="flex items-center gap-2 mb-6">
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/img/${secondary.icon}`}
              alt={secondary.name}
              className="w-6 h-6"
            />
            <span className="font-medium text-sm">{secondary.name}</span>
          </div>

          <div className="flex gap-4 justify-center flex-wrap mb-2">
            {secondary.minors.map((r) => (
              <RuneSlot key={r.id} rune={r} hoveredId={hoveredId} setHoveredId={setHoveredId} />
            ))}
          </div>

          <div className="mt-2 flex gap-3 justify-center flex-wrap border-t border-gray-700 pt-3 overflow-visible">
            {stats.map((stat) => (
              <StatSlot
                key={stat.id}
                stat={stat}
                hoveredId={hoveredId}
                setHoveredId={setHoveredId}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default RuneDisplay;
