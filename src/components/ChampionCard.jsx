import { motion } from "framer-motion";

export default function ChampionCard({ champion }) {
  if (!champion) 
    return (
        <div className="bg-gray-800 p-4 rounded-2xl shadow-lg flex-[0.6] flex-col items-center text-center text-white">
            <p>Chưa chọn tướng</p>
        </div>
    );

  return (
    <div className="bg-gray-800 p-4 rounded-2xl shadow-lg flex-[0.4] flex-col items-center">
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
    </div>
    
  );
}
