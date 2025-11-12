import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { motion } from "framer-motion";
import { FaSyncAlt } from "react-icons/fa";

function Tooltip({ item, parentRef }) {
  if (!item || !parentRef?.current) return null;

  const rect = parentRef.current.getBoundingClientRect();
  const spaceAbove = rect.top;
  const spaceBelow = window.innerHeight - rect.bottom;
  const showAbove = spaceAbove > spaceBelow;
  const positionClass = showAbove ? "bottom-full mb-1" : "top-full mt-1";

  const gold = item.gold?.total ?? 0;
  const tags = (item.tags || []).join(", ") || "Không có tag";

  return (
    <div
      className={`absolute ${positionClass} left-1/2 transform -translate-x-1/2 
        w-72 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg z-[9999]
        overflow-y-auto max-h-64`}
      style={{ maxWidth: "90vw", wordWrap: "break-word" }}
    >
      <div
        dangerouslySetInnerHTML={{
          __html: `
            <b>${item.name}</b><br/>
            ${item.description || item.plaintext || "Không có description"}<br/>
            <b>Gold:</b> ${gold}<br/>
            <b>Tags:</b> ${tags}
          `,
        }}
      />
    </div>
  );
}

const ItemSlot = ({ item }) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);

  return (
    <div
      ref={ref}
      className="relative flex flex-col items-center group w-16 h-16"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {item ? (
        <img
          src={item.image}
          alt={item.name}
          className="w-16 h-16 rounded-md border border-gray-600 hover:scale-110 transition-transform duration-150"
        />
      ) : (
        <div className="w-16 h-16 bg-gray-700 rounded-md border border-gray-600" />
      )}
      {hovered && item && <Tooltip item={item} parentRef={ref} />}
    </div>
  );
};

const ItemDisplay = forwardRef(({ instant, hasSmite, mode }, ref) => {
  const [allItems, setAllItems] = useState([]);
  const [bootsItems, setBootsItems] = useState([]);
  const [mainItemsPool, setMainItemsPool] = useState([]);
  const [rolling, setRolling] = useState(false);
  const [loading, setLoading] = useState(true);

  const [starterSets, setStarterSets] = useState({
    jungle: [],
    support: [],
    lane: [],
    starter: [],
  });
  const [selectedItems, setSelectedItems] = useState({
    start: null,
    boots: null,
    main: Array(6).fill(null),
  });

  const getRandom = (arr) =>
    arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;

  useEffect(() => {
    async function fetchItems() {
      try {
        const versionRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
        const [latestVersion] = await versionRes.json();

        const dataRes = await fetch(
          `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/vi_VN/item.json`
        );
        const data = await dataRes.json();

        const mapped = Object.entries(data.data).map(([id, i]) => ({
          id,
          name: i.name,
          description: i.description || i.plaintext || "",
          image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/item/${i.image.full}`,
          gold: {
            base: i.gold?.base ?? 0,
            total: i.gold?.total ?? 0,
            sell: i.gold?.sell ?? 0,
            purchasable: i.gold?.purchasable ?? false,
          },
          tags: i.tags || [],
          maps: i.maps || {},
          groupId: i.group || null,
          inStore: i.inStore !== false,
        }));

        const riftOnly = mapped.filter((it) => {
          const maps = it.maps || {};
          const idNum = Number(it.id);
          const allowedOnRift = maps["11"] === true;
          const isOtherMapCopy = idNum > 9999 || String(it.id).startsWith("32") || String(it.id).startsWith("33");
          return it.inStore && (it.gold?.purchasable ?? false) && allowedOnRift && !isOtherMapCopy;
        });

        const boots = riftOnly.filter(
          (i) =>
            (i.tags || []).includes("Boots") &&
            i.inStore &&
            i.gold.total >= 900 &&
            i.gold.total <= 1250
        );

        
        const starter = riftOnly.filter(
          (i) =>
            (
              i.tags.some((t) => ["Lane", "Jungle"].includes(t)) &&
              !i.tags.some((t) => ["Consumable"].includes(t)) && 
              (i.gold?.total ?? 0) <= 500 &&
              (i.gold?.sell??0) &&
              !["3865", "1036"].includes(i.id)
            ) || i.id === "3070"
        )
        const start = starter.filter(
          (i) =>
              !i.tags.some((t) => ["Jungle"].includes(t))
        )
        const support = starter.filter(
          (i) =>
            (i.tags || []).includes("GoldPer") &&            
            !i.id.includes("3865")
        );
        const jungle = starter.filter(
          (i) =>
            (i.tags || []).includes("Jungle")
        );
        const lane = starter.filter(
          (i) =>
            !i.tags.some((t) => ["Consumable", "GoldPer", "Jungle"].includes(t))
        );

        const mains = riftOnly.filter(
          (i) =>
            (i.gold?.total ?? 0) >= 2000 &&
            !i.tags.some((t) => ["Consumable", "Boots", "Trinket"].includes(t)) &&
            !["4638", "4643", "4641"].some((id) => i.id.includes(id))
        );
        
        console.debug("ItemDisplay pools:", { 
          total: mapped.length, 
          riftOnlyCount: riftOnly.length, 
          starters: start.map((s) => ({ id: s.id, name: s.name, maps: s.maps })), 
          boots: boots.map((b) => ({ id: b.id, name: b.name, gold: b.gold, maps: b.maps })),
          mains: mains.map((m) => ({ id: m.id, name: m.name, maps: m.maps })),
          jungle: jungle.map((j) => ({ id: j.id, name: j.name, gold: j.gold, maps: j.maps })), 
          support: support.map((p) => ({ id: p.id, name: p.name, gold: p.gold, maps: p.maps })), 
        });

        setAllItems(riftOnly);
        setBootsItems(boots);
        setMainItemsPool(mains);
        setStarterSets({ jungle, support, lane, start });
      } catch (e) {
        console.error("ItemDisplay.fetchItems error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, []);

  const getStarterPool = () => {
    if (mode === "jungle" || hasSmite) return starterSets.jungle;
    if (mode === "support") return starterSets.support;
    if (mode === "lane") return starterSets.lane;
    return starterSets.start;
  };

  const randomMainItems = () => {
    const pool = [...mainItemsPool].sort(() => Math.random() - 0.5);
    const selected = [];
    const usedGroups = new Set();
    for (const item of pool) {
      if (selected.length >= 6) break;
      if (!item) continue;
      const group = item.groupId;
      if (group && usedGroups.has(group)) continue;
      selected.push(item);
      if (group) usedGroups.add(group);
    }
    while (selected.length < 6) selected.push(null);
    return selected;
  };

  const randomizeItems = (useInstant = false) => {
    const getRandomItemSet = () => {
      const start = getRandom(getStarterPool());
      const boots = getRandom(bootsItems);
      const main = randomMainItems();
      
      return { start, boots, main };
    };

    if (useInstant) {
      const final = getRandomItemSet();
      setSelectedItems(final);
      return Promise.resolve(final);
    }

    setRolling(true);
    const duration = Math.random() * 1000 + 1000;
    const interval = setInterval(() => setSelectedItems(getRandomItemSet()), 100);
    return new Promise((resolve) => {
      setTimeout(() => {
        clearInterval(interval);
        const final = getRandomItemSet();
        setSelectedItems(final);
        setRolling(false);
        resolve(final);
      }, duration);
    });
  };

  useImperativeHandle(ref, () => ({
    randomize: (useInstant = false) => randomizeItems(useInstant),
    randomizeSequential: (useInstant = false) => randomizeItems(useInstant),
  }));

  if (loading) {
    return (
      <div className="bg-gray-800 p-4 rounded-2xl text-white text-center">
        <p>Đang tải dữ liệu Summoner’s Rift...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-2xl shadow-lg flex flex-col items-center w-full">
      <div className="flex justify-between w-full mb-3 items-center">
        <p className="text-lg font-bold text-center flex-1">Đồ</p>

        <motion.button
          onClick={() => randomizeItems(instant)}
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

      <div className="flex justify-around w-full gap-2 mb-2 relative overflow-visible">
        <ItemSlot item={selectedItems.start} />
        <ItemSlot item={selectedItems.boots} />
      </div>

      <div className="flex gap-2 flex-wrap justify-center relative overflow-visible">
        {selectedItems.main.map((item, idx) => (
          <ItemSlot key={idx} item={item} />
        ))}
      </div>
    </div>
  );
});

export default ItemDisplay;
