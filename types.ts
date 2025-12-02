
export interface Message {
  role: 'user' | 'model';
  content: string;
  images?: string[]; // Array of Base64 strings
  timestamp: number;
}

export interface AnalysisSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface SessionTemplate {
  id: string;
  name: string;
  messages: Message[];
  createdAt: number;
}

export interface AppSettings {
  // systemPrompt is now handled via constants.ts
  useProModel: boolean;
  thinkingBudget: number; // 0 for disabled
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS',
}

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface ChartConfig {
  type: 'area' | 'line' | 'bar';
  title: string;
  data: ChartDataPoint[];
  xAxisKey: string;
  dataKey: string;
  color?: string;
  description?: string;
}