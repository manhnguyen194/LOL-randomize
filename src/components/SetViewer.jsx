import { useState, useRef } from "react";
import GenericTooltip from "@/utils/GenericTooltip";

export default function SetViewer({ savedSet, onClose }) {
  if (!savedSet) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">

      {/* WRAPPER GIỮA – CHO PHÉP SCROLL */}
      <div className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto relative p-6">

        <h2 className="text-2xl font-bold mb-4 text-center">Detail</h2>

        {/* CHAMPION */}
        <div className="flex items-center gap-3 mb-6">
          <img
            src={savedSet.champion.image}
            className="w-16 h-16 rounded-xl border border-gray-600"
          />
          <div>
            <p className="text-lg font-semibold">{savedSet.champion.name}</p>
          </div>
        </div>

        {/* ITEMS */}
        {Array.isArray(savedSet.items) && savedSet.items.length > 0 && (
          <Section title="Items">
            <div className="grid grid-cols-3 gap-4">
              {savedSet.items.map((item, i) => (
                <HoverSlot key={i} type="item" data={item} />
              ))}
            </div>
          </Section>
        )}

        {/* SPELLS */}
        {Array.isArray(savedSet.spells) && savedSet.spells.length > 0 && (
          <Section title="Spells">
            <div className="flex gap-4">
              {savedSet.spells.map((spell, i) => (
                <HoverSlot key={i} type="spell" data={spell} />
              ))}
            </div>
          </Section>
        )}

        {/* RUNES */}
        <div className="bg-gray-800 p-4 rounded-xl mt-4 text-white">
          <h3 className="text-lg font-bold mb-3">Bảng Ngọc</h3>

          {/* Nhánh Chính */}
          {savedSet.runes.primary && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <HoverRune
                  type="rune"
                  size="sm"
                  data={{
                    ...savedSet.runes.primary,
                    icon: savedSet.runes.primary.icon
                  }}
                />
                <span className="font-semibold">{savedSet.runes.primary.name}</span>
              </div>

              <div className="flex flex-col items-center">
                {/* Keystone */}
                {savedSet.runes.primary.keystone && (
                  <HoverRune
                    type="rune"
                    size="lg"
                    data={savedSet.runes.primary.keystone}
                  />
                )}

                {/* Minors */}
                <div className="flex gap-3 flex-wrap justify-center mt-2">
                  {savedSet.runes.primary.minors?.map((r) => (
                    <HoverRune
                      key={r.id}
                      type="rune"
                      size="md"
                      data={r}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Nhánh Phụ */}
          {savedSet.runes.secondary && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <HoverRune
                  type="rune"
                  size="sm"
                  data={{
                    ...savedSet.runes.secondary,
                    icon: savedSet.runes.secondary.icon
                  }}
                />
                <span className="font-semibold">{savedSet.runes.secondary.name}</span>
              </div>

              <div className="flex gap-3 flex-wrap justify-center">
                {savedSet.runes.secondary.minors?.map((r) => (
                  <HoverRune
                    key={r.id}
                    type="rune"
                    size="md"
                    data={r}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex gap-3 flex-wrap justify-center mt-2 border-t border-gray-700 pt-3">
            {savedSet.runes.stats?.map((s) => (
              <HoverRune
                key={s.id}
                type="rune"
                size="sm"
                data={s}
              />
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 bg-red-600 rounded-lg hover:bg-red-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*                            HoverSlot with Tooltip                       */
/* ---------------------------------------------------------------------- */
function HoverSlot({ type, data }) {
  const [hovered, setHovered] = useState(false);
  const timeoutRef = useRef(null);
  const ref = useRef(null);

  const enter = () => {
    clearTimeout(timeoutRef.current);
    setHovered(true);
  };

  const leave = () => {
    timeoutRef.current = setTimeout(() => setHovered(false), 10);
  };

  return (
    <div
      ref={ref}
      className="relative flex flex-col items-center group"
      onMouseEnter={enter}
      onMouseLeave={leave}
    >
      <img
        src={data.image || data.icon}
        alt={data.name}
        className="w-14 h-14 rounded-md border border-gray-600 hover:scale-110 transition-transform duration-150"
      />

      {hovered && (
        <GenericTooltip
          type={type}
          data={data}
          parentRef={ref}
          onMouseEnter={enter}
          onMouseLeave={leave}
        />
      )}
    </div>
  );
}

function HoverRune({ type, data, size = "md" }) {
  const [hovered, setHovered] = useState(false);
  const [lock, setLock] = useState(false);
  const ref = useRef(null);

  const sizeMap = {
    lg: "w-14 h-14",
    md: "w-10 h-10",
    sm: "w-7 h-7"
  };

  return (
    <div
      ref={ref}
      className="relative flex flex-col items-center group"
      onMouseEnter={() => {
        clearTimeout(lock);
        setHovered(true);
      }}
      onMouseLeave={() => {
        const t = setTimeout(() => setHovered(false), 10);
        setLock(t);
      }}
    >
      <img
        src={`https://ddragon.leagueoflegends.com/cdn/img/${data.icon}`}
        alt={data.name}
        className={`${sizeMap[size]} hover:scale-110 transition-transform duration-150`}
      />

      {hovered && (
        <GenericTooltip
          type={type}
          data={data}
          parentRef={ref}
          onMouseEnter={() => {
            clearTimeout(lock);
            setHovered(true);
          }}
          onMouseLeave={() => {
            const t = setTimeout(() => setHovered(false), 10);
            setLock(t);
          }}
        />
      )}
    </div>
  );
}
