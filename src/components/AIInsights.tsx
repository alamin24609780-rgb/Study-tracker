import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { getStudyInsights, type StudyInsight } from '../services/geminiService';
import { motion } from 'motion/react';

interface AIInsightsProps {
  sessions: any[];
  subjects: any[];
}

export default function AIInsights({ sessions, subjects }: AIInsightsProps) {
  const [insight, setInsight] = useState<StudyInsight | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    if (subjects.length === 0) return;
    setLoading(true);
    try {
      const data = await getStudyInsights(sessions, subjects);
      setInsight(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <BrainCircuit className="text-indigo-600" size={32} />
            AI Study Insights
          </h2>
          <p className="text-gray-500 mt-1">Smart recommendations based on your learning patterns.</p>
        </div>
        <button 
          onClick={fetchInsights}
          disabled={loading}
          className="p-3 rounded-xl bg-white border border-gray-100 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      {loading ? (
        <div className="glass-card rounded-3xl p-12 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">Analyzing your study data...</p>
        </div>
      ) : insight ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-8 border-l-4 border-l-indigo-600"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <h3 className="font-bold text-lg">Next Focus</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/50 rounded-2xl">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Suggested Subject</span>
                <p className="text-xl font-display font-bold text-indigo-900 mt-1">{insight.suggestedSubject}</p>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {insight.recommendation}
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-3xl p-8 border-l-4 border-l-amber-500"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
              <h3 className="font-bold text-lg">Why this?</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {insight.reason}
            </p>
            <div className="mt-8 p-4 bg-amber-50/30 rounded-2xl border border-amber-100">
              <p className="text-xs text-amber-700 font-medium">
                Tip: Studying subjects you find difficult in the morning can improve retention by up to 20%.
              </p>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center">
          <p className="text-gray-400">Not enough study data to generate insights yet. Start a session!</p>
        </div>
      )}
    </div>
  );
}
