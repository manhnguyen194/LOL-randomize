import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { motion } from "framer-motion";
import { FaSyncAlt } from "react-icons/fa";

const ChampionCard = forwardRef(({ instant }, ref) => {
  const [champions, setChampions] = useState([]);
  const [champion, setChampion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rolling, setRolling] = useState(false);

  const getRandom = arr => arr[Math.floor(Math.random() * arr.length)];

  useEffect(() => {
    async function fetchChampions() {
      try {
        const versionRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
        const [latestVersion] = await versionRes.json();
        const champRes = await fetch(
          `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/vi_VN/champion.json`
        );
        const data = await champRes.json();
        const list = Object.values(data.data).map((c) => ({
          id: c.id,
          name: c.name,
          image: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${c.image.full}`,
        }));
        setChampions(list);
      } catch (err) {
        console.error("Lỗi fetch champion:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchChampions();
  }, []);

  const randomizeChampion = () => {
    if (!champions.length) return;

    if (instant) {
      setChampion(getRandom(champions));
      return;
    }

    // Rolling 2-3s
    setRolling(true);
    const duration = Math.random() * 1000 + 2000; // 2-3s
    const interval = setInterval(() => {
      setChampion(getRandom(champions));
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setRolling(false);
    }, duration);
  };

  // Cho phép App.jsx gọi random từ ngoài
  useImperativeHandle(ref, () => ({
    randomize: (instant = false) => {
      randomizeChampion(instant);
    }
  }));

  if (loading)
    return (
      <div className="bg-gray-800 p-4 rounded-2xl shadow-lg flex-[0.4] flex-col items-center text-center text-white">
        <p>Đang tải tướng...</p>
      </div>
    );

  return (
    <div className="bg-gray-800 p-4 rounded-2xl shadow-lg flex-[0.4] flex-col items-center">
      <div className="flex justify-between w-full mb-3 items-center">
        <h2 className="text-lg font-bold text-center flex-1">Tướng</h2>
        <motion.button
          onClick={randomizeChampion}
          whileTap={{ rotate: 180 }}
          className="p-2 bg-blue-500 rounded-full text-white text-lg flex items-center justify-center"
        >
          <FaSyncAlt />
        </motion.button>
      </div>

      {champion ? (
        <>
          <div className="flex justify-center">
            <motion.img
              key={champion.id}
              src={champion.image}
              alt={champion.name}
              className="w-32 h-32 object-cover rounded-full mb-2"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="flex justify-center"><p className="text-lg font-semibold">{champion.name}</p></div>
        </>
      ) : (
        <p>Chưa chọn tướng</p>
      )}
    </div>
  );
});

export default ChampionCard;
