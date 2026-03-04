import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Timer from './components/Timer';
import AIInsights from './components/AIInsights';
import { Plus, BookOpen, Trash2, Tag, LayoutGrid } from 'lucide-react';
import { SUBJECT_GROUPS, SUBJECT_ICONS, cn } from './lib/utils';
import * as Icons from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loginName, setLoginName] = useState('');

  // Subject Form State
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubGroup, setNewSubGroup] = useState('Science');
  const [newSubIcon, setNewSubIcon] = useState('BookOpen');

  useEffect(() => {
    const savedUser = localStorage.getItem('studyflow_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      fetchData(u.id);
    }
  }, []);

  const fetchData = async (userId: number) => {
    const [subRes, sessRes, statRes] = await Promise.all([
      fetch(`/api/subjects/${userId}`),
      fetch(`/api/sessions/${userId}`),
      fetch(`/api/stats/${userId}`)
    ]);
    setSubjects(await subRes.json());
    setSessions(await sessRes.json());
    setStats(await statRes.json());
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName) return;
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: loginName })
    });
    const u = await res.json();
    setUser(u);
    localStorage.setItem('studyflow_user', JSON.stringify(u));
    fetchData(u.id);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('studyflow_user');
  };

  const onTimerComplete = async (seconds: number, type: string) => {
    if (!user || subjects.length === 0) return;
    const subjectId = subjects[0].id; // Default to first for now, Timer component should pass this
    await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, subjectId, durationSeconds: seconds, type })
    });
    fetchData(user.id);
  };

  const addSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, name: newSubName, category: newSubGroup, icon: newSubIcon })
    });
    const newSub = await res.json();
    setSubjects([...subjects, newSub]);
    setShowAddSubject(false);
    setNewSubName('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
        <div className="w-full max-w-md glass-card rounded-[2rem] p-10 shadow-2xl shadow-indigo-100/50">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 mb-6">
              <Icons.Timer size={32} />
            </div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-gray-900">StudyFlow</h1>
            <p className="text-gray-500 mt-2">The Ultimate Smart Study Tracker</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Your Name</label>
              <input 
                type="text" 
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="Enter your name to start"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Get Started
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-50 text-center">
            <p className="text-xs text-gray-400 font-medium">Designed & Developed by: <span className="text-indigo-600 font-bold">Al Amin</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userName={user.name} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard stats={stats} sessions={sessions} userName={user.name} />
          )}
          
          {activeTab === 'timer' && (
            <div className="max-w-2xl mx-auto">
              <header className="mb-10 text-center">
                <h2 className="text-3xl font-display font-bold tracking-tight">Focus Session</h2>
                <p className="text-gray-500 mt-1">Deep work is the key to mastery.</p>
              </header>
              <Timer onComplete={onTimerComplete} subjects={subjects} />
            </div>
          )}

          {activeTab === 'subjects' && (
            <div className="space-y-8">
              <header className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-display font-bold tracking-tight">Subjects</h2>
                  <p className="text-gray-500 mt-1">Manage your curriculum and study groups.</p>
                </div>
                <button 
                  onClick={() => setShowAddSubject(true)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  <Plus size={20} /> Add Subject
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((sub) => {
                  const IconComp = (Icons as any)[sub.icon] || BookOpen;
                  return (
                    <div key={sub.id} className="glass-card rounded-3xl p-6 flex items-center gap-4 group hover:border-indigo-200 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <IconComp size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{sub.name}</h4>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{sub.category}</span>
                      </div>
                      <button className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {showAddSubject && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-6 z-50">
                  <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
                    <h3 className="text-xl font-bold mb-6">New Subject</h3>
                    <form onSubmit={addSubject} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Name</label>
                        <input 
                          type="text" 
                          required
                          value={newSubName}
                          onChange={(e) => setNewSubName(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Group</label>
                          <select 
                            value={newSubGroup}
                            onChange={(e) => setNewSubGroup(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3"
                          >
                            {SUBJECT_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Icon</label>
                          <select 
                            value={newSubIcon}
                            onChange={(e) => setNewSubIcon(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3"
                          >
                            {SUBJECT_ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-8">
                        <button 
                          type="button"
                          onClick={() => setShowAddSubject(false)}
                          className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-100"
                        >
                          Create
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai' && (
            <AIInsights sessions={sessions} subjects={subjects} />
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-8">
              <header>
                <h2 className="text-3xl font-display font-bold tracking-tight">Achievements</h2>
                <p className="text-gray-500 mt-1">Your milestones and study badges.</p>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <BadgeCard 
                  title="Bronze Scholar" 
                  desc="Complete 10 hours of study" 
                  progress={Math.min(100, (sessions.reduce((a,b)=>a+b.duration_seconds,0)/36000)*100)}
                  icon="Award"
                  color="amber"
                />
                <BadgeCard 
                  title="Silver Master" 
                  desc="Complete 50 hours of study" 
                  progress={Math.min(100, (sessions.reduce((a,b)=>a+b.duration_seconds,0)/180000)*100)}
                  icon="Trophy"
                  color="slate"
                />
                <BadgeCard 
                  title="Gold Legend" 
                  desc="Complete 100 hours of study" 
                  progress={Math.min(100, (sessions.reduce((a,b)=>a+b.duration_seconds,0)/360000)*100)}
                  icon="Crown"
                  color="yellow"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function BadgeCard({ title, desc, progress, icon, color }: any) {
  const IconComp = (Icons as any)[icon];
  const colors: any = {
    amber: "text-amber-600 bg-amber-50",
    slate: "text-slate-400 bg-slate-50",
    yellow: "text-yellow-500 bg-yellow-50",
  };

  return (
    <div className="glass-card rounded-[2rem] p-8 flex flex-col items-center text-center">
      <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-sm", colors[color])}>
        <IconComp size={40} />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6">{desc}</p>
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <div className="bg-indigo-600 h-full transition-all duration-1000" style={{ width: `${progress}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-400 mt-3 uppercase tracking-widest">{Math.round(progress)}% Complete</span>
    </div>
  );
}
