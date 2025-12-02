import React, { useState, useEffect } from 'react';
import { LayoutDashboard, History, Settings as SettingsIcon, BarChart3, PlusCircle, TrendingUp } from 'lucide-react';
import { ViewState, AppSettings, AnalysisSession, SessionTemplate } from './types';
import { STORAGE_KEYS } from './constants';
import { AnalysisView } from './components/AnalysisView';
import { SettingsView } from './components/SettingsView';
import { HistoryView } from './components/HistoryView';
import { secureStorage } from './utils';

const App = () => {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  
  // Intro Animation State
  const [showIntro, setShowIntro] = useState(true);
  
  // Track the currently active session ID for history navigation
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = secureStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) return stored;
    
    // Fallback for legacy plain text data
    const legacy = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (legacy) {
        const parsed = JSON.parse(legacy);
        return {
            useProModel: parsed.useProModel ?? false,
            thinkingBudget: parsed.thinkingBudget ?? 0
        };
    }
    return { 
        useProModel: false,
        thinkingBudget: 0 
    };
  });

  // Sessions State
  const [sessions, setSessions] = useState<AnalysisSession[]>(() => {
    const stored = secureStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (stored) return stored;
    // Fallback
    const legacy = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return legacy ? JSON.parse(legacy) : [];
  });

  // Templates State
  const [templates, setTemplates] = useState<SessionTemplate[]>(() => {
    const stored = secureStorage.getItem(STORAGE_KEYS.TEMPLATES);
    return stored || [];
  });

  // Derived state for the active session object
  const activeSession = sessions.find(s => s.id === activeSessionId);

  useEffect(() => {
    secureStorage.setItem(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    secureStorage.setItem(STORAGE_KEYS.SESSIONS, sessions);
  }, [sessions]);

  useEffect(() => {
    secureStorage.setItem(STORAGE_KEYS.TEMPLATES, templates);
  }, [templates]);

  // Handle Intro Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2600); // 2.6 seconds total intro time
    return () => clearTimeout(timer);
  }, []);

  const handleSaveSession = (session: AnalysisSession) => {
    setSessions(prev => {
        const exists = prev.find(s => s.id === session.id);
        if (exists) {
            return prev.map(s => s.id === session.id ? session : s);
        }
        return [...prev, session];
    });
    // Ensure we stay on this session after saving (e.g. first message of new chat)
    if (activeSessionId !== session.id) {
        setActiveSessionId(session.id);
    }
  };

  const handleSaveTemplate = (template: SessionTemplate) => {
      setTemplates(prev => [...prev, template]);
  };

  const handleNewChat = (template?: SessionTemplate) => {
    setActiveSessionId(null);
    if (template) {
        // Create new session from template
        const newSessionId = crypto.randomUUID();
        const newSession: AnalysisSession = {
            id: newSessionId,
            title: template.name,
            messages: template.messages,
            createdAt: Date.now()
        };
        handleSaveSession(newSession);
    }
    setView(ViewState.DASHBOARD);
  };

  const NavItem = ({ targetView, icon: Icon, label, mobileOnly = false, onClick }: { targetView?: ViewState, icon: any, label: string, mobileOnly?: boolean, onClick?: () => void }) => {
     const isActive = targetView ? view === targetView : false;
     return (
        <button
          onClick={onClick || (() => targetView && setView(targetView))}
          className={`
            group flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300
            ${mobileOnly ? 'flex-1' : ''}
            ${isActive 
                ? 'text-ios-blue md:bg-blue-50' 
                : 'text-gray-400 hover:text-gray-600 md:hover:bg-gray-100'}
          `}
        >
          <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] font-medium">{label}</span>
        </button>
     );
  };

  return (
    <>
      {/* INTRO OVERLAY */}
      {showIntro && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center animate-fadeOut">
            <div className="relative mb-8 animate-logo-reveal">
               <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
               <div className="w-24 h-24 bg-gradient-to-tr from-[#007AFF] to-[#5856D6] rounded-[32px] flex items-center justify-center shadow-2xl relative z-10">
                  <TrendingUp className="w-12 h-12 text-white" />
               </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-3 animate-text-reveal">
              TradeCore AI
            </h1>
            <p className="text-gray-500 text-lg font-light animate-tagline-reveal">
              Decoding the Market's Pulse
            </p>
        </div>
      )}

      {/* MAIN APP */}
      <div className={`flex flex-col md:flex-row h-screen bg-ios-bg text-ios-text font-sans overflow-hidden transition-opacity duration-1000 ${showIntro ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        
        {/* DESKTOP SIDEBAR */}
        <nav className="hidden md:flex w-24 border-r border-gray-200 bg-white flex-col items-center py-8 gap-6 z-20 shadow-sm">
          <div className="mb-6 cursor-pointer" onClick={() => handleNewChat()}>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform">
                  <BarChart3 className="w-7 h-7 text-white" />
              </div>
          </div>
          
          <div className="flex flex-col gap-3 w-full px-3">
              <NavItem onClick={() => handleNewChat()} icon={PlusCircle} label="New Chat" />
              <div className="h-px w-full bg-gray-100 my-1" />
              <NavItem targetView={ViewState.DASHBOARD} icon={LayoutDashboard} label="Analyze" />
              <NavItem targetView={ViewState.HISTORY} icon={History} label="History" />
              <NavItem targetView={ViewState.SETTINGS} icon={SettingsIcon} label="Config" />
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-hidden bg-ios-bg">
          <div className="h-full relative z-10">
            {view === ViewState.DASHBOARD && (
              <AnalysisView 
                  settings={settings} 
                  onSaveSession={handleSaveSession}
                  onSaveTemplate={handleSaveTemplate}
                  templates={templates}
                  activeSession={activeSession}
                  onNewChat={handleNewChat}
              />
            )}
            {view === ViewState.SETTINGS && (
              <div className="h-full overflow-y-auto">
                  <SettingsView settings={settings} onSave={setSettings} />
              </div>
            )}
            {view === ViewState.HISTORY && (
              <div className="h-full overflow-y-auto">
                  <HistoryView 
                      sessions={sessions} 
                      onSelectSession={(session) => {
                          setActiveSessionId(session.id);
                          setView(ViewState.DASHBOARD);
                      }} 
                      onClearHistory={() => {
                          setSessions([]);
                          setActiveSessionId(null);
                      }}
                  />
              </div>
            )}
          </div>
        </main>

        {/* MOBILE BOTTOM TAB BAR */}
        <nav className="md:hidden w-full bg-white/90 backdrop-blur-lg border-t border-gray-200 pb-[env(safe-area-inset-bottom)] z-50 shrink-0">
          <div className="flex items-center justify-around p-2 pt-3">
              <NavItem targetView={ViewState.DASHBOARD} icon={LayoutDashboard} label="Analyze" mobileOnly />
              <NavItem targetView={ViewState.HISTORY} icon={History} label="History" mobileOnly />
              <NavItem targetView={ViewState.SETTINGS} icon={SettingsIcon} label="Settings" mobileOnly />
          </div>
        </nav>

      </div>

      <style>{`
        @keyframes logo-reveal {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes text-reveal {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeOut {
          0% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; pointer-events: none; }
        }
        .animate-logo-reveal {
          animation: logo-reveal 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .animate-text-reveal {
          animation: text-reveal 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s forwards;
          opacity: 0;
        }
        .animate-tagline-reveal {
          animation: text-reveal 1s cubic-bezier(0.2, 0.8, 0.2, 1) 0.6s forwards;
          opacity: 0;
        }
        .animate-fadeOut {
          animation: fadeOut 2.6s ease-in-out forwards;
        }
      `}</style>
    </>
  );
};

export default App;