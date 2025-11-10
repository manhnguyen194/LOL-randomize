// ItemDisplay.jsx (SỬA LẠI: filter SR only, rolling restored, debug helpers)
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { motion } from "framer-motion";
import { FaSyncAlt } from "react-icons/fa";

function Tooltip({ item }) {
  if (!item) return null;
  const gold = item.gold?.total ?? 0;
  const tags = (item.tags || []).join(", ") || "Không có tag";
  return (
    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-72 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg z-50">
      <div
        dangerouslySetInnerHTML={{
          __html: `<b>${item.name}</b><br/>
                   ${item.description || item.plaintext || "Không có description"}<br/>
                   <b>Gold:</b> ${gold}<br/>
                   <b>Tags:</b> ${tags}`,
        }}
      />
    </div>
  );
}

const ItemDisplay = forwardRef(({ instant = false }, ref) => {
  const [allItems, setAllItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [starterItems, setStarterItems] = useState([]);
  const [bootsItems, setBootsItems] = useState([]);
  const [mainItemsPool, setMainItemsPool] = useState([]);
  const [selectedItems, setSelectedItems] = useState({
    start: null,
    boots: null,
    main: Array(6).fill(null),
  });
  const [loading, setLoading] = useState(true);

  const getRandom = (arr) => (arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null);

  useEffect(() => {
    async function fetchItems() {
      try {
        const versionRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
        const [latestVersion] = await versionRes.json();

        const dataRes = await fetch(
          `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/vi_VN/item.json`
        );
        const data = await dataRes.json();

        // groups top-level (array or object depending on file) — normalize to array of groups
        const groupsDataRaw = data.groups || [];
        const groupsList = Array.isArray(groupsDataRaw) ? groupsDataRaw : Object.values(groupsDataRaw);
        setGroups(groupsList);

        // map items
        const mapped = Object.entries(data.data).map(([id, i]) => ({
          id,
          name: i.name,
          description: i.description || i.plaintext || "",
          image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/item/${i.image.full}`,
          gold: i.gold || { total: 0 },
          tags: i.tags || [],
          maps: i.maps || {},
          groupId: i.group || null,
          inStore: i.inStore !== false,
        }));

        // KEEP ONLY Summoner's Rift items: maps["11"] === true AND NOT present on ARAM/Arena/TFT
        const riftOnly = mapped.filter(
          (it) =>
            Boolean(it.maps && it.maps["11"]) &&
            !Boolean(it.maps && it.maps["30"]) &&
            !Boolean(it.maps && it.maps["33"]) &&
            !Boolean(it.maps && it.maps["35"])
        );

        // Starter by IDs (use stable IDs to avoid localization problems)
        const starterIds = [
          "1054", // Khiên Doran (IDs depend on patch — adjust if needed)
          "1055", // Kiếm Doran
          "1056", // Nhẫn Doran
          "1082", // Phong Ấn Hắc Ám (example; adjust IDs if mismatch)
          "3070", // Tear
          "2033", // ...
          "2031",
          "1039",
          "1036",
        ];
        const starters = riftOnly.filter((i) => starterIds.includes(i.id));

        // Boots 900-1250, inStore
        const boots = mapped.filter(
            (i) =>
            (i.tags || []).includes("Boots") &&
            i.inStore &&
            i.gold.total  >= 900 &&
            i.gold.total  <= 1250
        );

        // Main items: price >= 2000 (use gold.total) and exclude boot/starter
        const mains = riftOnly.filter(
          (i) => (i.gold?.total ?? 0) >= 2000 && !starterIds.includes(i.id) && !(i.tags || []).includes("Boots")
        );

        // debug: print pools (open console to inspect)
        console.debug("ItemDisplay pools:", {
          total: mapped.length,
          riftOnlyCount: riftOnly.length,
          starters: starters.map((s) => ({ id: s.id, name: s.name, maps: s.maps })),
          boots: boots.map((b) => ({ id: b.id, name: b.name, gold: b.gold?.total, maps: b.maps })),
          mains: mains.length,
        });
 
        setAllItems(riftOnly);
        setStarterItems(starters);
        setBootsItems(boots);
        setMainItemsPool(mains);
      } catch (e) {
        console.error("ItemDisplay.fetchItems error:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  // build set of group IDs that are limited (MaxGroupOwnable >= 0 or == "1")
  const onePerGroupIds = (groups || [])
    .filter((g) => {
      const mg = Number(g.MaxGroupOwnable);
      return !Number.isNaN(mg) && mg >= 0; // treat numeric >=0 as limited
    })
    .map((g) => g.id);

  // random main items with group exclusion and ensure unique by id
  const randomMainItems = () => {
    const pool = [...mainItemsPool];
    const selected = [];
    const usedGroups = new Set();
    const usedIds = new Set();

    // shuffle pool for randomness
    for (let attempts = 0; attempts < 1000 && selected.length < 6 && pool.length > 0; attempts++) {
      const idx = Math.floor(Math.random() * pool.length);
      const candidate = pool[idx];
      // skip if id already used
      if (usedIds.has(candidate.id)) {
        pool.splice(idx, 1);
        continue;
      }
      const group = candidate.groupId;
      const limitedGroup = group && onePerGroupIds.includes(group);
      if (limitedGroup && usedGroups.has(group)) {
        // cannot pick from that group again
        pool.splice(idx, 1);
        continue;
      }
      // accept
      selected.push(candidate);
      usedIds.add(candidate.id);
      if (limitedGroup) usedGroups.add(group);
      pool.splice(idx, 1);
    }

    // fill empties with null if not enough
    while (selected.length < 6) selected.push(null);
    return selected;
  };

  const randomizeItems = (inst = false) => {
    if (!allItems.length) return;

    const rollOnce = () => ({
      start: getRandom(starterItems),
      boots: getRandom(bootsItems),
      main: randomMainItems(),
    });

    if (inst) {
      setSelectedItems(rollOnce());
      return;
    }

    // rolling 2-3s: update interval then stop
    const duration = 2000 + Math.random() * 1000;
    const interval = setInterval(() => setSelectedItems(rollOnce()), 150); // 150ms is smoother + less CPU
    setTimeout(() => clearInterval(interval), duration);
  };

  useImperativeHandle(ref, () => ({
    // allow parent to pass instant param to override local instant prop
    randomize: (instParam = instant) => randomizeItems(instParam),
  }));

  if (loading) {
    return (
      <div className="bg-gray-800 p-4 rounded-2xl text-white text-center">
        <p>Đang tải dữ liệu Summoner’s Rift...</p>
      </div>
    );
  }

  const ItemSlot = ({ item }) => {
    const [hovered, setHovered] = useState(false);
    return (
      <div
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
        {hovered && item && <Tooltip item={item} />}
      </div>
    );
  };

  return (
    <div className="bg-gray-800 p-4 rounded-2xl shadow-lg flex flex-col items-center w-full">
      <div className="flex gap-4 justify-center mb-4 items-center">
        <p className="text-lg font-bold text-white">Summoner’s Rift Items</p>

        {/* button uses current instant prop; parent can call ref.randomize(true/false) too */}
        <motion.button
          onClick={() => randomizeItems(instant)}
          whileTap={{ rotate: 180 }}
          className="p-2 bg-blue-500 rounded-full text-white text-lg flex items-center justify-center"
        >
          <FaSyncAlt />
        </motion.button>
      </div>

      <div className="flex gap-2 mb-2">
        <ItemSlot item={selectedItems.start} />
        <ItemSlot item={selectedItems.boots} />
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {selectedItems.main.map((item, idx) => (
          <ItemSlot key={idx} item={item} />
        ))}
      </div>
    </div>
  );
});

export default ItemDisplay;
