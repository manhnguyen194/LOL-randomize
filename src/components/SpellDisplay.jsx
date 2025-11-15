import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { motion } from "framer-motion";
import useSmartTooltipPosition from "@/utils/useSmartTooltipPosition";

function Tooltip({ spell, parentRef, onMouseEnter, onMouseLeave }) {
  if (!spell || !parentRef?.current) return null;
  const { verticalPosition, translateX } = useSmartTooltipPosition(parentRef, 288);

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`absolute ${verticalPosition} left-1/2 transform bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg z-[9999]
        overflow-y-auto max-h-64 transition-transform duration-150`}
      style={{
        width: "18rem",
        maxWidth: "90vw",
        wordWrap: "break-word",
        transform: `translateX(${translateX}%)`,
      }}
    >
      <div
        dangerouslySetInnerHTML={{
          __html: `
            <b>${spell.name}</b><br/>
            ${spell.description || spell.tooltip || "Không có mô tả."}<br/><br/>
            <span>⏱️ Hồi chiêu: ${spell.cooldown || "?"} giây</span>
          `,
        }}
      />
    </div>
  );
}


// 🧩 Component con hiển thị từng ô phép
function SpellSlot({ spell, hoveredId, setHoveredId }) {
  const ref = useRef(null);
  const [hoveringTooltip, setHoveringTooltip] = useState(false);

  const isHovered = hoveredId === spell.id || hoveringTooltip;

  return (
    <div
      ref={ref}
      className="relative flex flex-col flex-[0.5] items-center group"
      onMouseEnter={() => setHoveredId(spell.id)}
      onMouseLeave={() => {
        // Chỉ ẩn khi không hover tooltip
        if (!hoveringTooltip) setHoveredId(null);
      }}
    >
      <img
        src={spell.image}
        alt={spell.name}
        className="w-14 h-14 rounded-md border border-gray-700 hover:scale-110 transition-transform duration-150"
      />
      <p className="text-sm mt-1 text-center">{spell.name}</p>

      {isHovered && (
        <Tooltip
          spell={spell}
          parentRef={ref}
          onMouseEnter={() => setHoveringTooltip(true)}
          onMouseLeave={() => {
            setHoveringTooltip(false);
            setHoveredId(null);
          }}
        />
      )}
    </div>
  );
}

const SpellDisplay = forwardRef(({ instant, onSmiteChange, mode }, ref) => {
  const [spells, setSpells] = useState([]);
  const [selectedSpells, setSelectedSpells] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rolling, setRolling] = useState(false);

  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // 🧩 Fetch danh sách phép từ DDragon
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
          .filter((s) => s.modes.includes("CLASSIC"))
          .map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            tooltip: s.tooltip,
            cooldown: s.cooldownBurn,
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

  const checkHasSmite = (pair) =>
    pair?.some(
      (s) =>
        s.id === "SummonerSmite" ||
        s.name.toLowerCase().includes("trừng phạt") ||
        s.name.toLowerCase().includes("smite")
    );

  const randomizeSpellsCore = (useInstant = false) => {
    const smitePool = spells.filter(
      (s) =>
        s.id === "SummonerSmite" ||
        s.name.toLowerCase().includes("trừng phạt") ||
        s.name.toLowerCase().includes("smite")
    );
    const nonSmitePool = spells.filter(
      (s) =>
        s.id !== "SummonerSmite" &&
        !s.name.toLowerCase().includes("trừng phạt") &&
        !s.name.toLowerCase().includes("smite")
    );

    const getRandomPair = () => {
      if (mode === "jungle") {
        const smite = getRandom(smitePool);
        const other = getRandom(nonSmitePool);
        return Math.random() > 0.5 ? [smite, other] : [other, smite];
      }

      if (mode === "lane" || mode === "support") {
        const first = getRandom(nonSmitePool);
        let second;
        do {
          second = getRandom(nonSmitePool);
        } while (second.id === first.id);
        return [first, second];
      }

      // mode === "all"
      const pool = [...spells];
      const first = getRandom(pool);
      let second;
      do {
        second = getRandom(pool);
      } while (second.id === first.id);
      return [first, second];
    };

    return new Promise((resolve) => {
      if (useInstant) {
        const pair = getRandomPair();
        setSelectedSpells(pair);
        const hasSmite = checkHasSmite(pair);
        if (onSmiteChange) onSmiteChange(hasSmite);
        resolve(pair);
        return;
      }

      // Hiệu ứng roll
      setRolling(true);
      const duration = Math.random() * 1000 + 1000;
      const interval = setInterval(() => {
        setSelectedSpells(getRandomPair());
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        const final = getRandomPair();
        setSelectedSpells(final);
        setRolling(false);
        const hasSmite = checkHasSmite(final);
        if (onSmiteChange) onSmiteChange(hasSmite);
        resolve(final);
      }, duration);
    });
  };

  const randomizeSpells = () => {
    randomizeSpellsCore(instant).catch(console.error);
  };

  useImperativeHandle(ref, () => ({
    randomize: (useInstant = false) => {
      randomizeSpellsCore(useInstant);
    },
    randomizeSequential: (useInstant = false) => {
      return randomizeSpellsCore(useInstant);
    },
    getCurrent: () => selectedSpells
  }));

  if (loading)
    return (
      <div className="bg-gray-800 p-4 rounded-2xl shadow-lg flex-[0.6] flex-col items-center text-center text-white">
        <p>Đang tải phép bổ trợ...</p>
      </div>
    );

  return (
    <div className="bg-gray-800 p-4 rounded-2xl shadow-lg flex-[0.6] flex-col items-center">
      {/* Header + nút roll */}
      <div className="flex justify-between w-full mb-3 items-center">
        <p className="text-lg font-bold text-center flex-1">Phép bổ trợ</p>
        <motion.button
          onClick={randomizeSpells}
          whileTap={{ rotate: 100 }}
          className="p-2 rounded-full flex items-center justify-center"
        >
          <img
            src="/icon/util/Reroll.png"
            alt="reroll"
            className="w-8 h-8 object-contain"
          />
        </motion.button>
        {/* Hiển thị mode hiện tại
        <span
          className={`px-3 py-1 rounded-lg text-sm font-semibold text-white ${
            mode === "jungle"
              ? "bg-green-600"
              : mode === "lane"
              ? "bg-orange-500"
              : mode === "support"
              ? "bg-pink-500"
              : "bg-purple-500"
          }`}
        >
          {mode === "jungle"
            ? "Đi rừng"
            : mode === "lane"
            ? "Đi đường"
            : mode === "support"
            ? "Hỗ trợ"
            : "Tất cả"}
        </span> */}
      </div>

      {/* Khu hiển thị phép */}
      <div className="flex gap-4 justify-around relative overflow-visible">
        {selectedSpells.length === 0 ? (
          <p className="text-white">Chưa chọn phép</p>
        ) : (
          selectedSpells.map((s) => (
            <SpellSlot
              key={s.id}
              spell={s}
              hoveredId={hoveredId}
              setHoveredId={setHoveredId}
            />
          ))
        )}
      </div>
    </div>
  );
});

export default SpellDisplay;
