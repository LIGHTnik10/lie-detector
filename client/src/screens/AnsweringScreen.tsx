import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Check } from 'lucide-react';
import { Button } from '../components/Button';
import { Timer } from '../components/Timer';
import { useGame } from '../contexts/GameContext';

export function AnsweringScreen() {
  const {
    currentRound,
    maxRounds,
    prompt,
    assignment,
    timeLimit,
    answeredCount,
    players,
    hasAnswered,
    submitAnswer
  } = useGame();

  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      submitAnswer(answer.trim());
    }
  };

  if (hasAnswered) {
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Check size={40} className="text-white" />
        </motion.div>

        <h2 className="text-2xl font-bold mb-2">Answer Submitted!</h2>
        <p className="text-slate-400 mb-8">Waiting for others...</p>

        <div className="bg-slate-800 rounded-xl px-6 py-3">
          <span className="text-slate-400">{answeredCount}</span>
          <span className="text-slate-600"> / </span>
          <span className="text-white">{players.length}</span>
          <span className="text-slate-400 ml-2">answered</span>
        </div>
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
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-slate-400">
          Round {currentRound} of {maxRounds}
        </div>
        <Timer seconds={timeLimit} />
      </div>

      {/* Assignment badge */}
      <motion.div
        className={`
          text-center py-4 px-6 rounded-2xl mb-6 font-bold text-xl
          ${assignment === 'TRUTH'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
            : 'bg-red-500/20 text-red-400 border border-red-500/50'
          }
        `}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        Tell the {assignment}
      </motion.div>

      {/* Prompt */}
      <div className="flex-1">
        <motion.div
          className="bg-slate-800/50 rounded-2xl p-6 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xl md:text-2xl font-medium text-center">
            {prompt}
          </p>
        </motion.div>

        {/* Answer form */}
        <form onSubmit={handleSubmit}>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={assignment === 'TRUTH' ? 'Write your honest answer...' : 'Make up a convincing lie...'}
            maxLength={500}
            rows={4}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none mb-4"
            autoFocus
          />

          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={!answer.trim()}
          >
            <Send size={20} />
            Submit Answer
          </Button>
        </form>
      </div>

      {/* Progress */}
      <div className="text-center text-sm text-slate-400 mt-4">
        {answeredCount} / {players.length} players answered
      </div>
    </motion.div>
  );
}
