import React from 'react';
import { AnalysisSession } from '../types';
import { Clock, ChevronRight, Trash2, Calendar, Download } from 'lucide-react';
import { exportSessionToJSON } from '../utils';

interface HistoryViewProps {
  sessions: AnalysisSession[];
  onSelectSession: (session: AnalysisSession) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ sessions, onSelectSession, onClearHistory }) => {
  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8 pb-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
        <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">History</h2>
            <p className="text-gray-500 mt-1 text-sm">Past market analysis sessions.</p>
        </div>
        {sessions.length > 0 && (
             <button 
                onClick={onClearHistory}
                className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
                <Trash2 className="w-4 h-4" /> Clear
            </button>
        )}
      </div>

      <div className="space-y-3">
        {sessions.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                 <Clock className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-900 font-medium">No history yet</p>
            <p className="text-gray-500 text-sm mt-1">Start a new analysis to see it here.</p>
          </div>
        ) : (
          sessions.slice().reverse().map(session => (
            <div 
              key={session.id}
              className="group bg-white border border-gray-200/80 hover:border-blue-300 rounded-2xl p-5 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-4">
                <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onSelectSession(session)}
                >
                  <h3 className="font-semibold text-gray-900 truncate">{session.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>{new Date(session.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span>•</span>
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium">{session.messages.length} msgs</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); exportSessionToJSON(session, session.title); }}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        title="Export JSON"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};