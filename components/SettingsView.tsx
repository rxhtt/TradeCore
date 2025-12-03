import React from 'react';
import { Save, AlertCircle, Zap, Sparkles, Award } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = React.useState<AppSettings>(settings);
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSave = () => {
    onSave(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8 space-y-8 animate-[fadeIn_0.3s_ease-out] pb-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h2>
        <p className="text-gray-500 mt-1 text-sm">Configure your trading assistant.</p>
      </div>

      <div className="grid gap-6">
        
        {/* Model Selection Card */}
        <div className="bg-white rounded-3xl p-6 shadow-ios-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Perplexity AI Engine</h3>
            
            <div className="space-y-4">
                <label className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${!localSettings.useProModel ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${!localSettings.useProModel ? 'border-blue-500' : 'border-gray-300'}`}>
                        {!localSettings.useProModel && <div className="w-3 h-3 bg-blue-500 rounded-full" />}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className={`w-4 h-4 ${!localSettings.useProModel ? 'text-blue-500' : 'text-gray-400'}`} />
                            <span className={`font-semibold ${!localSettings.useProModel ? 'text-blue-700' : 'text-gray-900'}`}>Sonar (Velocity)</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">Low latency, live search. Ideal for quick quotes, news, and standard analysis.</p>
                    </div>
                    <input type="radio" name="model" className="hidden" checked={!localSettings.useProModel} onChange={() => setLocalSettings(s => ({ ...s, useProModel: false }))} />
                </label>

                <label className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${localSettings.useProModel ? 'border-purple-500 bg-purple-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${localSettings.useProModel ? 'border-purple-500' : 'border-gray-300'}`}>
                        {localSettings.useProModel && <div className="w-3 h-3 bg-purple-500 rounded-full" />}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className={`w-4 h-4 ${localSettings.useProModel ? 'text-purple-500' : 'text-gray-400'}`} />
                            <span className={`font-semibold ${localSettings.useProModel ? 'text-purple-700' : 'text-gray-900'}`}>Sonar Reasoning (Pro)</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">Deep research and Chain of Thought reasoning. Best for complex market structure and correlation analysis.</p>
                    </div>
                    <input type="radio" name="model" className="hidden" checked={localSettings.useProModel} onChange={() => setLocalSettings(s => ({ ...s, useProModel: true }))} />
                </label>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                 <button
                    onClick={handleSave}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm ${
                        isSaved 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                 >
                    <Save className="w-4 h-4" />
                    {isSaved ? 'Changes Saved' : 'Save Changes'}
                 </button>
            </div>
        </div>

        {/* Credits Section */}
        <div className="bg-white rounded-3xl p-8 shadow-ios-sm border border-gray-100 text-center">
             <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-gray-900" />
             </div>
             <h3 className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-3">Architected in the Realm of Dreams</h3>
             <p className="text-lg font-serif italic text-gray-900 mb-3">
                "Innovation & Concept by Rohit Bagewadi"
             </p>
             <p className="text-[10px] text-gray-400 tracking-wide font-medium uppercase">
                Forged in the fires of intuition
             </p>
        </div>

        {/* System Prompt Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
            <div>
                <h3 className="text-sm font-semibold text-gray-900">System Prompt Locked</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    The Master System Prompt is managed in the codebase configuration (`constants.ts`) and cannot be modified from the client interface.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};