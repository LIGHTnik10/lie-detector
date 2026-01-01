import { motion } from 'framer-motion';
import { Crown, Check } from 'lucide-react';
import type { PlayerData } from '../types';

interface PlayerListProps {
  players: PlayerData[];
  showScores?: boolean;
  showStatus?: boolean;
  highlightId?: string;
  roundScores?: Record<string, number>;
}

export function PlayerList({
  players,
  showScores = false,
  showStatus = false,
  highlightId,
  roundScores
}: PlayerListProps) {
  const colors = [
    'bg-rose-500',
    'bg-amber-500',
    'bg-emerald-500',
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-teal-500'
  ];

  return (
    <motion.div
      className="space-y-2"
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
      }}
    >
      {players.map((player, index) => (
        <motion.div
          key={player.id}
          variants={{
            hidden: { opacity: 0, x: -20 },
            show: { opacity: 1, x: 0 }
          }}
          className={`
            flex items-center gap-3 p-3 rounded-xl
            ${highlightId === player.id ? 'bg-indigo-500/20 border border-indigo-500/50' : 'bg-slate-800/50'}
          `}
        >
          <div className={`w-10 h-10 rounded-full ${colors[index % colors.length]} flex items-center justify-center font-bold text-white`}>
            {player.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{player.name}</span>
              {player.isHost && (
                <Crown size={14} className="text-amber-400 flex-shrink-0" />
              )}
            </div>
            {showScores && (
              <div className="text-sm text-slate-400">
                {player.score} pts
                {roundScores && roundScores[player.id] > 0 && (
                  <span className="text-emerald-400 ml-2">+{roundScores[player.id]}</span>
                )}
              </div>
            )}
          </div>

          {showStatus && (
            <div className="flex-shrink-0">
              {(player.hasAnswered || player.hasVoted) && (
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
