import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { useGame } from '../contexts/GameContext';

export function RevealScreen() {
  const {
    player,
    currentResult,
    revealIndex,
    revealTotal,
    nextReveal
  } = useGame();

  const isHost = player?.isHost;
  const isMyAnswer = currentResult?.playerId === player?.id;
  const isLie = currentResult?.assignment === 'LIE';
  const isLast = revealIndex === revealTotal - 1;

  if (!currentResult) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-slate-400">Loading...</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-sm text-slate-400 mb-2">
          Reveal {revealIndex + 1} of {revealTotal}
        </div>
      </div>

      {/* Main reveal card */}
      <motion.div
        className="flex-1 flex flex-col items-center justify-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {/* Player name */}
        <motion.div
          className="text-center mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {currentResult.playerName}
          </h2>
          {isMyAnswer && (
            <div className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm">
              Your answer
            </div>
          )}
        </motion.div>

        {/* Answer */}
        <motion.div
          className="w-full max-w-lg bg-slate-800 rounded-2xl p-6 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xl md:text-2xl text-center text-white leading-relaxed">
            "{currentResult.answer}"
          </p>
        </motion.div>

        {/* Truth/Lie reveal */}
        <motion.div
          className={`
            w-full max-w-lg py-6 px-8 rounded-2xl text-center mb-6
            ${isLie
              ? 'bg-red-500/20 border-2 border-red-500'
              : 'bg-emerald-500/20 border-2 border-emerald-500'
            }
          `}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            {isLie ? (
              <AlertCircle size={48} className="text-red-500" />
            ) : (
              <CheckCircle size={48} className="text-emerald-500" />
            )}
          </div>
          <h3 className="text-3xl md:text-4xl font-bold">
            {currentResult.assignment}
          </h3>
        </motion.div>

        {/* Who called it a lie */}
        {currentResult.votersWhoCalledLie.length > 0 && (
          <motion.div
            className="w-full max-w-lg text-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-slate-400 text-sm mb-2">
              {isLie ? 'Correctly identified as a lie by:' : 'Suspected as a lie by:'}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {currentResult.votersWhoCalledLie.map((name, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-slate-700 rounded-full text-sm"
                >
                  {name}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Points */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className={`inline-block px-8 py-4 rounded-2xl ${currentResult.pointsEarned > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
            <p className="text-sm mb-1">Points earned</p>
            <p className="text-3xl font-bold">
              {currentResult.pointsEarned > 0 ? '+' : ''}{currentResult.pointsEarned}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Next button (host only) */}
      {isHost && (
        <div className="pt-6 max-w-lg mx-auto w-full">
          <Button
            fullWidth
            size="lg"
            onClick={nextReveal}
          >
            {isLast ? 'Show Scoreboard' : 'Next Reveal'}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
