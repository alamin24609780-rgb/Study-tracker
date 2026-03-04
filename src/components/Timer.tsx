import React, { useState, useEffect, useRef } from 'react';
import { 
  Timer as TimerIcon, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Dices, 
  Settings2,
  Clock
} from 'lucide-react';
import { cn, formatDuration } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface TimerProps {
  onComplete: (seconds: number, type: string) => void;
  subjects: any[];
}

export default function Timer({ onComplete, subjects }: TimerProps) {
  const [mode, setMode] = useState<'pomodoro' | 'manual' | 'random' | 'custom'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || '');
  const [elapsed, setElapsed] = useState(0);
  const [customMins, setCustomMins] = useState(30);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
        setElapsed(prev => prev + 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    setIsActive(false);
    onComplete(elapsed, mode);
    setElapsed(0);
    if (mode === 'pomodoro') setTimeLeft(25 * 60);
    else if (mode === 'custom') setTimeLeft(customMins * 60);
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setElapsed(0);
    if (mode === 'pomodoro') setTimeLeft(25 * 60);
    else if (mode === 'custom') setTimeLeft(customMins * 60);
    else setTimeLeft(0);
  };

  const setRandomTimer = () => {
    const randomMins = Math.floor(Math.random() * (45 - 15 + 1)) + 15;
    setTimeLeft(randomMins * 60);
    setMode('random');
    setIsActive(false);
    setShowCustomInput(false);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeLeft(customMins * 60);
    setMode('custom');
    setIsActive(false);
    setShowCustomInput(false);
  };

  return (
    <div className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
      <div className="absolute top-4 right-4 flex space-x-2">
        <button 
          onClick={() => { setMode('pomodoro'); setTimeLeft(25 * 60); setIsActive(false); setShowCustomInput(false); }}
          className={cn("px-3 py-1 rounded-full text-xs font-medium transition-colors", mode === 'pomodoro' ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600")}
        >
          Pomodoro
        </button>
        <button 
          onClick={() => { setMode('manual'); setTimeLeft(0); setIsActive(false); setShowCustomInput(false); }}
          className={cn("px-3 py-1 rounded-full text-xs font-medium transition-colors", mode === 'manual' ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600")}
        >
          Manual
        </button>
        <button 
          onClick={setRandomTimer}
          className={cn("px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1", mode === 'random' ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600")}
        >
          <Dices size={12} /> Random
        </button>
        <button 
          onClick={() => setShowCustomInput(!showCustomInput)}
          className={cn("px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1", mode === 'custom' || showCustomInput ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600")}
        >
          <Settings2 size={12} /> Customize
        </button>
      </div>

      <AnimatePresence>
        {showCustomInput && (
          <motion.form 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleCustomSubmit}
            className="absolute top-16 right-4 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 z-10 flex flex-col gap-3"
          >
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Minutes</label>
              <input 
                type="number" 
                min="1" 
                max="300"
                value={customMins}
                onChange={(e) => setCustomMins(parseInt(e.target.value))}
                className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button type="submit" className="bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg">Set Timer</button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="w-full max-w-xs">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Subject</label>
        <select 
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
        >
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="relative flex items-center justify-center">
        <svg className="w-64 h-64 transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-100"
          />
          <motion.circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={754}
            initial={{ strokeDashoffset: 754 }}
            animate={{ 
              strokeDashoffset: mode === 'manual' ? 0 : 754 * (1 - timeLeft / (mode === 'pomodoro' ? 25 * 60 : timeLeft + elapsed)) 
            }}
            className="text-indigo-600"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-5xl font-display font-bold tracking-tight">
            {mode === 'manual' ? formatDuration(elapsed) : formatDuration(timeLeft)}
          </span>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-1">
            {isActive ? 'Focusing...' : 'Ready'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={resetTimer}
          className="p-4 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <RotateCcw size={24} />
        </button>
        <button 
          onClick={toggleTimer}
          className="p-6 rounded-3xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
        >
          {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>
        <button 
          onClick={handleComplete}
          disabled={elapsed < 10}
          className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
        >
          <CheckCircle2 size={24} />
        </button>
      </div>
    </div>
  );
}
