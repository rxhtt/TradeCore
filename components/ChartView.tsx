import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Brush
} from 'recharts';
import { ChartConfig } from '../types';

interface ChartViewProps {
  config: ChartConfig;
  overrideType?: 'area' | 'line' | 'bar';
}

export const ChartView: React.FC<ChartViewProps> = ({ config, overrideType }) => {
  const type = overrideType || config.type;
  const { data, xAxisKey, dataKey, title, color = "#007AFF", description } = config;

  // Common styles
  const gridStroke = "#e5e7eb";
  const textFill = "#6b7280";
  const fontSize = 11;

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
            <XAxis 
                dataKey={xAxisKey} 
                tick={{fill: textFill, fontSize}} 
                axisLine={false} 
                tickLine={false}
                dy={10}
            />
            <YAxis 
                tick={{fill: textFill, fontSize}} 
                axisLine={false} 
                tickLine={false}
            />
            <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cursor={{fill: 'rgba(0,0,0,0.05)'}}
            />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
            <Brush dataKey={xAxisKey} height={20} stroke={color} fill="#f9fafb" />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
            <XAxis 
                dataKey={xAxisKey} 
                tick={{fill: textFill, fontSize}} 
                axisLine={false} 
                tickLine={false}
                dy={10}
            />
            <YAxis 
                tick={{fill: textFill, fontSize}} 
                axisLine={false} 
                tickLine={false}
            />
            <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={3} 
                dot={{r: 3, strokeWidth: 2}} 
                activeDot={{r: 6}} 
            />
            <Brush dataKey={xAxisKey} height={20} stroke={color} fill="#f9fafb" />
          </LineChart>
        );
      case 'area':
      default:
        return (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <defs>
              <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
            <XAxis 
                dataKey={xAxisKey} 
                tick={{fill: textFill, fontSize}} 
                axisLine={false} 
                tickLine={false}
                dy={10}
            />
            <YAxis 
                tick={{fill: textFill, fontSize}} 
                axisLine={false} 
                tickLine={false}
            />
            <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={2} 
                fillOpacity={1} 
                fill={`url(#color${dataKey})`} 
            />
            <Brush dataKey={xAxisKey} height={20} stroke={color} fill="#f9fafb" />
          </AreaChart>
        );
    }
  };

  return (
    <div className="w-full my-6 bg-white border border-gray-100 rounded-2xl p-5 shadow-card overflow-hidden">
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{title}</h4>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="w-full h-[250px] md:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};