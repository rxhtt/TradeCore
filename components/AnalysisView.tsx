import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Loader2, ArrowRight, Plus, Sparkles, Zap, SquarePen, TrendingUp, RefreshCw, Activity, Edit2, BarChart, LineChart as LineChartIcon, AreaChart as AreaChartIcon, Save as SaveIcon, Download, FileText, ChevronDown } from 'lucide-react';
import { Message, AppSettings, AnalysisSession, SessionTemplate } from '../types';
import { analyzeMarketData } from '../services/perplexityService';
import { fetchMarketTicker } from '../services/marketDataService';
import { MarkdownView } from './MarkdownView';
import { exportSessionToJSON } from '../utils';

interface AnalysisViewProps {
  settings: AppSettings;
  onSaveSession: (session: AnalysisSession) => void;
  onSaveTemplate: (template: SessionTemplate) => void;
  templates: SessionTemplate[];
  activeSession?: AnalysisSession; 
  onNewChat: (template?: SessionTemplate) => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ settings, onSaveSession, onSaveTemplate, templates, activeSession, onNewChat }) => {
  const [input, setInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');
  
  // Header Editing State
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  
  // Template & Menu State
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

  // Ticker State
  const [ticker, setTicker] = useState({ symbol: 'XAUUSD', price: 0, change: 0 });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Sync state with activeSession whenever the session ID changes
  useEffect(() => {
    if (activeSession) {
      setMessages(activeSession.messages);
      setEditedTitle(activeSession.title);
    } else {
      // If just cleared or new, we might keep existing if creating new from template
      // But usually reset
      if (!messages.length) {
         setMessages([]);
         setEditedTitle('TradeCore AI');
      }
    }
  }, [activeSession?.id]); 

  // Focus title input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  // Real Market Data Ticker
  const updateTicker = async () => {
    // Determine symbol based on context or default to XAUUSD/BTC
    const data = await fetchMarketTicker(ticker.symbol.includes('XAU') ? 'XAU' : 'BTC');
    setTicker(data);
  };

  useEffect(() => {
    updateTicker();
    const interval = setInterval(updateTicker, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, images]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filePromises = Array.from(files).map(file => 
      new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) resolve(reader.result as string);
        };
        reader.readAsDataURL(file as Blob);
      })
    );

    try {
      const newImages = await Promise.all(filePromises);
      setImages(prev => [...prev, ...newImages]);
    } catch (error) {
      console.error("Error reading images", error);
    }
    
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const saveTitle = () => {
    setIsEditingTitle(false);
    if (activeSession && editedTitle.trim() !== activeSession.title) {
        const updatedSession = { ...activeSession, title: editedTitle };
        onSaveSession(updatedSession);
    }
  };

  const handleSaveAsTemplate = () => {
     if (messages.length === 0) return;
     const name = prompt("Enter a name for this template:");
     if (name) {
         onSaveTemplate({
             id: crypto.randomUUID(),
             name,
             messages: messages,
             createdAt: Date.now()
         });
         alert("Template saved!");
     }
  };

  const handleExport = () => {
      if (!activeSession) return;
      exportSessionToJSON(activeSession, activeSession.title);
  };

  const handleQuickAction = (actionText: string) => {
    let prompt = actionText;
    
    // Customized prompt for FVG logic
    if (actionText === 'Analyze FVG') {
        prompt = `Analyze the Fair Value Gaps (FVG) in the current context. Identify any unmitigated imbalances, categorize them as Bullish or Bearish, and suggest potential entry zones if price returns to these levels. Provide a chart if possible.`;
    } else if (actionText === 'Refresh market data analysis') {
        updateTicker();
        prompt = `Refresh market analysis based on the latest data. Re-evaluate structure.`;
    }

    handleSubmit(prompt);
  };

  const handleSubmit = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if ((!textToSend.trim() && images.length === 0) || isLoading) return;

    const currentImages = [...images];
    const userMsg: Message = {
      role: 'user',
      content: textToSend,
      images: currentImages.length > 0 ? currentImages : undefined,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setInput('');
    setImages([]);
    
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }

    try {
      const responseText = await analyzeMarketData(userMsg.content, currentImages.length > 0 ? currentImages : undefined, settings);
      
      const modelMsg: Message = {
        role: 'model',
        content: responseText,
        timestamp: Date.now(),
      };

      setMessages(prev => {
        const newMessages = [...prev, modelMsg];
        
        // Preserve current session ID or generate a new one
        const sessionId = activeSession?.id || crypto.randomUUID();
        
        // Update Session
        const updatedSession: AnalysisSession = {
            id: sessionId,
            // Keep existing title or use current editing title, else generate from message
            title: activeSession ? activeSession.title : (userMsg.content.slice(0, 30) + (userMsg.content.length > 30 ? '...' : '') || 'Market Analysis'),
            messages: newMessages,
            createdAt: activeSession?.createdAt || Date.now(),
        };

        onSaveSession(updatedSession);
        return newMessages;
      });

    } catch (error) {
      const errorMsg: Message = {
        role: 'model',
        content: "Analysis failed. Please check your API configuration or network connection.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex flex-col border-b border-gray-100 bg-white sticky top-0 z-20 transition-all duration-200 shadow-sm">
        
        {/* Ticker Bar (Mini) */}
        <div className="bg-gray-50 px-4 md:px-6 py-1 flex items-center justify-between text-[10px] text-gray-500 font-medium tracking-wide">
             <div className="flex items-center gap-2">
                <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-green-500 animate-pulse" /> LIVE MARKET</span>
             </div>
             <div className="flex items-center gap-3">
                 <span>{ticker.symbol}</span>
                 <span className="text-gray-900 font-mono font-semibold">{ticker.price.toFixed(2)}</span>
                 <span className={`${ticker.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {ticker.change >= 0 ? '+' : ''}{ticker.change.toFixed(2)}%
                 </span>
             </div>
        </div>

        {/* Main Toolbar */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
            <div className="flex-1 min-w-0 pr-4 flex items-center gap-3">
                {activeSession ? (
                    isEditingTitle ? (
                        <input 
                            ref={titleInputRef}
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            onBlur={saveTitle}
                            onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
                            className="text-lg font-semibold text-gray-800 bg-gray-50 px-2 py-1 rounded border border-blue-200 outline-none w-full max-w-[250px]"
                        />
                    ) : (
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                            <h2 className="text-lg font-semibold tracking-tight text-gray-800 truncate max-w-[200px] md:max-w-md">
                                {activeSession.title}
                            </h2>
                            <Edit2 className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    )
                ) : (
                    <h2 className="text-lg font-semibold tracking-tight text-gray-800">TradeCore AI</h2>
                )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
                {/* Chart Toggle */}
                <div className="hidden md:flex bg-gray-100 p-0.5 rounded-lg mr-2">
                    <button 
                        onClick={() => setChartType('area')}
                        className={`p-1.5 rounded-md transition-all ${chartType === 'area' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Area Chart"
                    >
                        <AreaChartIcon className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setChartType('line')}
                        className={`p-1.5 rounded-md transition-all ${chartType === 'line' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Line Chart"
                    >
                        <LineChartIcon className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setChartType('bar')}
                        className={`p-1.5 rounded-md transition-all ${chartType === 'bar' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        title="Bar Chart"
                    >
                        <BarChart className="w-4 h-4" />
                    </button>
                </div>

                {/* Refresh Data */}
                <button 
                    onClick={() => handleQuickAction("Refresh market data analysis")}
                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                    title="Refresh Analysis"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>

                {/* Templates & Export */}
                <div className="relative">
                    <button 
                        onClick={() => setShowTemplateMenu(!showTemplateMenu)}
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                    >
                        <FileText className="w-5 h-5" />
                    </button>
                    {showTemplateMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                            {messages.length > 0 && (
                                <>
                                    <button onClick={() => { handleSaveAsTemplate(); setShowTemplateMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                        <SaveIcon className="w-4 h-4" /> Save as Template
                                    </button>
                                    <button onClick={() => { handleExport(); setShowTemplateMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100">
                                        <Download className="w-4 h-4" /> Export JSON
                                    </button>
                                </>
                            )}
                            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Start from Template</div>
                            {templates.length === 0 ? (
                                <div className="px-4 py-2 text-xs text-gray-400 italic">No templates saved</div>
                            ) : (
                                templates.map(t => (
                                    <button key={t.id} onClick={() => { onNewChat(t); setShowTemplateMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 truncate">
                                        {t.name}
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* New Chat */}
                <button 
                    onClick={() => onNewChat()}
                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                    title="New Chat"
                >
                    <SquarePen className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 scroll-smooth custom-scrollbar">
        <div className="max-w-[800px] mx-auto space-y-8 pb-4 h-full flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center animate-[fadeIn_0.8s_ease-out_forwards] -mt-10">
              <div className="relative mb-8 group cursor-default">
                  <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full animate-pulse-slow"></div>
                  <div className="w-20 h-20 bg-gradient-to-tr from-[#007AFF] to-[#5856D6] rounded-[24px] flex items-center justify-center shadow-xl relative z-10 transition-transform duration-500 group-hover:scale-105">
                    <TrendingUp className="w-10 h-10 text-white" />
                  </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight text-center mb-2">
                TradeCore AI
              </h1>
              <p className="text-lg text-gray-500 font-light text-center max-w-md leading-relaxed">
                Decoding the Market's Pulse.
              </p>
            </div>
          ) : (
             messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col animate-[slideIn_0.2s_ease-out] w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
               {/* Image Grid */}
               {msg.images && msg.images.length > 0 && (
                 <div className={`mb-3 overflow-hidden rounded-xl border border-gray-100 shadow-sm bg-white ${
                    msg.images.length === 1 ? 'w-full max-w-[300px]' : 'grid grid-cols-2 gap-0.5 w-full max-w-[340px]'
                 } ${msg.role === 'user' ? 'mr-1' : 'ml-10'}`}>
                   {msg.images.map((img, i) => (
                     <div key={i} className="relative aspect-square cursor-pointer active:opacity-90">
                       <img src={img} alt={`Attachment ${i}`} className="w-full h-full object-cover" />
                     </div>
                   ))}
                 </div>
               )}
               
               {/* Gemini Style Layout */}
               {msg.role === 'user' ? (
                 <div className="bg-[#f0f4f9] text-[#1f1f1f] px-5 py-3.5 rounded-[24px] rounded-br-sm max-w-[85%] md:max-w-[75%] text-[15px] leading-relaxed break-words">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                 </div>
               ) : (
                 <div className="flex gap-4 w-full max-w-full">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center mt-1 shadow-sm">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="text-[15px] text-[#1f1f1f] leading-relaxed">
                            <MarkdownView content={msg.content} chartPreference={chartType} />
                        </div>
                        
                        {/* Quick Actions after AI Response */}
                        {idx === messages.length - 1 && !isLoading && (
                            <div className="flex flex-wrap gap-2 mt-4 ml-1">
                                {['Analyze FVG', 'Show Levels', 'Check Volume', 'Trend Check'].map((action) => (
                                    <button 
                                        key={action}
                                        onClick={() => handleQuickAction(action)}
                                        className="text-xs bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-full transition-all"
                                    >
                                        {action}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                 </div>
               )}
            </div>
          )))}

          {isLoading && (
             <div className="flex gap-4 w-full max-w-full animate-pulse">
                <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mt-1">
                    <Sparkles className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1 space-y-2 pt-2">
                    <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white px-4 pb-4 pt-2 z-30">
        <div className="max-w-[800px] mx-auto bg-[#f0f4f9] rounded-[28px] p-2 flex flex-col transition-all focus-within:bg-white focus-within:shadow-[0_2px_12px_rgba(0,0,0,0.08)] focus-within:ring-1 focus-within:ring-gray-200">
          
          {/* Image Previews */}
          {images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto px-2 pb-2 pt-1 no-scrollbar">
              {images.map((img, idx) => (
                <div key={idx} className="relative shrink-0 group">
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200">
                    <img src={img} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <button 
                    onClick={() => removeImage(idx)}
                    className="absolute -top-1.5 -right-1.5 bg-gray-500 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 pl-2">
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleImageUpload} 
               className="hidden" 
               accept="image/*"
               multiple
             />
             
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-full text-gray-500 hover:bg-gray-200 transition-colors mb-0.5"
             >
                <Plus className="w-5 h-5" />
             </button>
             
             <textarea 
               ref={textareaRef}
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault();
                   handleSubmit();
                 }
               }}
               placeholder="Ask anything..."
               className="flex-1 bg-transparent border-none text-gray-900 placeholder-gray-500 resize-none py-3 px-1 focus:ring-0 text-[16px] leading-relaxed max-h-32"
               rows={1}
               style={{ minHeight: '48px' }}
             />
             
             <button 
                onClick={() => handleSubmit()}
                disabled={isLoading || (!input.trim() && images.length === 0)}
                className={`
                    p-2.5 rounded-full mb-1 transition-all duration-200
                    ${isLoading || (!input.trim() && images.length === 0)
                      ? 'text-gray-400' 
                      : 'bg-black text-white hover:bg-gray-800'
                    }
                `}
             >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
             </button>
          </div>
        </div>
        <div className="text-center mt-2">
            <p className="text-[11px] text-gray-400">TradeCore can make mistakes. Verify important info.</p>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};