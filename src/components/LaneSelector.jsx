import { motion } from "framer-motion";

export default function LaneSelector({ mode, setMode }) {
  const toggleMode = (newMode) => {
    setMode((prev) => (prev === newMode ? null : newMode));
  };

  const icons = {
    fill: "/icon/lanes/fill.png",
    lane: "/icon/lanes/top.png",
    jungle: "/icon/lanes/jungle.png",
    support: "/icon/lanes/support.png",
  };
  const color = "#3b83f690"
  const buttons = [
    { key: "fill", label: "All"},
    { key: "lane", label: "Lane"},
    { key: "jungle", label: "Jungle"},
    { key: "support", label: "Support"},
  ];

  return (
    <div className="flex gap-6 justify-center mb-6">
      {buttons.map(({ key, label}) => {
        const isActive = mode === key || (key === "fill" && mode === null);
        return(
          <motion.button
            key={key}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (key === "fill") setMode(null);
              else toggleMode(key);
            }}
            className={`p-2 rounded-full flex items-center justify-center transition-all`}
            style={{
              backgroundColor: isActive ? color : "#3741514a",
              borderColor: isActive ? color : "#6b72803b",
              boxShadow: isActive ? `0 0 10px ${color}` : "none",
            }}
            title={label}
          >
            <img
              src={icons[key]}
              alt={label}
              className="w-8 h-8 object-contain"
            />
          </motion.button>
        )
      })}
    </div>
  );
}
