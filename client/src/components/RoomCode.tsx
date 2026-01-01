import { motion } from 'framer-motion';

interface RoomCodeProps {
  code: string;
  size?: 'sm' | 'lg';
}

export function RoomCode({ code, size = 'lg' }: RoomCodeProps) {
  const isLarge = size === 'lg';

  return (
    <div className="text-center">
      <p className={`text-slate-400 mb-2 ${isLarge ? 'text-lg' : 'text-sm'}`}>
        Room Code
      </p>
      <motion.div
        className={`
          inline-flex gap-2 font-mono font-bold tracking-widest
          ${isLarge ? 'text-6xl md:text-7xl' : 'text-3xl'}
        `}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        {code.split('').map((char, i) => (
          <motion.span
            key={i}
            className="bg-gradient-to-br from-indigo-400 to-purple-500 text-transparent bg-clip-text"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            {char}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
