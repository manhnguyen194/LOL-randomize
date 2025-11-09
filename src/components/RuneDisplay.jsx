import { useState } from "react";

// Tooltip component nhỏ gọn
function Tooltip({ text }) {
  return (
    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-56 bg-gray-900 text-white text-xs p-2 rounded-lg shadow-lg z-50">
      <div dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  );
}

export default function RuneDisplay({ runeSet }) {
  const [hoveredRune, setHoveredRune] = useState(null);

  if (!runeSet)
    return (
      <div className="bg-gray-800 p-4 rounded-2xl shadow-lg flex flex-col items-center text-center text-white">
        <p>Chưa chọn bảng ngọc</p>
      </div>
    );

  const { primary, secondary } = runeSet;

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

  return (
    <div className="bg-gray-800 p-4 rounded-2xl shadow-lg flex flex-row items-center text-white w-full h-full md:flex-col">
      {/* Tiêu đề */}
      <h2 className="text-lg font-bold m-5 text-center">Bảng Ngọc</h2>

      {/* Nội dung chính */}
      <div className="flex flex-row gap-6 w-full">
        {/* Nhánh chính */}
        <div className="flex-[0.6] flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src={primary.icon} alt={primary.name} className="w-6 h-6" />
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
              <Tooltip
                text={`<b>${primary.keystone.name}</b><br/>${primary.keystone.longDesc}`}
              />
            )}
          </div>

          {/* Minor runes */}
          <div className="flex flex-wrap gap-2 justify-center">
            {primary.minors.map((r) => (
              <RuneIcon key={r.id} rune={r} />
            ))}
          </div>
        </div>

        {/* ===== NHÁNH PHỤ + STAT ===== */}
        <div className="flex-[0.4] flex-col items-center">
          {/* Nhánh phụ */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <img src={secondary.icon} alt={secondary.name} className="w-6 h-6" />
            <span className="font-medium text-sm">{secondary.name}</span>
          </div>

          <div className="flex gap-2 justify-center flex-wrap mb-4">
            {secondary.minors.map((r) => (
              <RuneIcon key={r.id} rune={r} />
            ))}
          </div>

          {/* Stat runes (nằm dưới nhánh phụ) */}
          <div className="mt-2 flex gap-3 justify-center flex-wrap border-t border-gray-700 pt-3">
            {runeSet.stats?.map((stat) => (
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
                {hoveredRune === stat && (
                  <Tooltip text={`<b>${stat.name}</b><br/>${stat.longDesc}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
