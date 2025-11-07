import { useState } from "react";

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

export default function SpellDisplay({ spells }) {
  const [hoveredId, setHoveredId] = useState(null);

  if (!spells || spells.length < 2)
    return (
      <div className="bg-gray-800 p-4 rounded-2xl shadow-lg flex-[0.6] flex-col items-center text-center text-white">
        <p>Chưa chọn phép</p>
      </div>
    );

  return (
    <div className="bg-gray-800 p-4 rounded-2xl shadow-lg flex-[0.6] flex-col items-center">
      <div className="flex gap-4 justify-center">
        <p className="text-lg font-bold mb-2">Phép bổ trợ</p>
      </div>

      <div className="flex gap-4 justify-center">
        {spells.slice(0, 2).map((s) => (
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
        ))}
      </div>
    </div>
  );
}
