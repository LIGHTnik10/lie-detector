import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface TimerProps {
  seconds: number;
  onComplete?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function Timer({ seconds, onComplete, size = 'md' }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isLow = timeLeft <= 10;
  const isWarning = timeLeft <= 30 && timeLeft > 10;

  const sizes = {
    sm: 'text-sm px-3 py-1',
    md: 'text-base px-4 py-2',
    lg: 'text-xl px-6 py-3'
  };

  return (
    <motion.div
      className={`
        inline-flex items-center gap-2 rounded-full font-mono font-bold
        ${sizes[size]}
        ${isLow ? 'bg-red-500/20 text-red-400' : isWarning ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-300'}
      `}
      animate={isLow ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: Infinity, duration: 0.5 }}
    >
      <Clock size={size === 'lg' ? 24 : size === 'md' ? 18 : 14} />
      <span>{minutes}:{secs.toString().padStart(2, '0')}</span>
    </motion.div>
  );
}
