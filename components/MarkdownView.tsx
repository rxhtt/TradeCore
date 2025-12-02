import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChartView } from './ChartView';
import { ChartConfig } from '../types';

interface MarkdownViewProps {
  content: string;
  chartPreference?: 'area' | 'line' | 'bar';
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, chartPreference }) => {
  return (
    <div className="prose prose-sm md:prose-base max-w-none text-gray-800 leading-relaxed space-y-2">
      <ReactMarkdown
        components={{
          h1: ({node, ...props}) => <h1 className="text-2xl font-semibold text-gray-900 mt-6 mb-4 tracking-tight" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-gray-900 mt-5 mb-3 tracking-tight" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2" {...props} />,
          
          // Enhanced Code Block handling for Charts
          code: ({node, inline, className, children, ...props}: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            // Check for JSON Chart block
            if (!inline && language === 'json-chart') {
              try {
                const jsonContent = String(children).replace(/\n$/, '');
                const chartConfig = JSON.parse(jsonContent) as ChartConfig;
                return <ChartView config={chartConfig} overrideType={chartPreference} />;
              } catch (e) {
                return (
                  <div className="p-4 bg-red-50 text-red-600 rounded-lg text-xs font-mono">
                    Failed to render chart: Invalid JSON data.
                  </div>
                );
              }
            }

            return !inline ? (
              <div className="bg-gray-50 rounded-lg p-3 my-3 border border-gray-100 overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </div>
            ) : (
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800" {...props}>
                {children}
              </code>
            );
          },

          // Tables
          table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg" {...props} /></div>,
          thead: ({node, ...props}) => <thead className="bg-gray-50" {...props} />,
          th: ({node, ...props}) => <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider" {...props} />,
          tbody: ({node, ...props}) => <tbody className="bg-white divide-y divide-gray-200" {...props} />,
          tr: ({node, ...props}) => <tr className="hover:bg-gray-50 transition-colors" {...props} />,
          td: ({node, ...props}) => <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap" {...props} />,
          
          // Lists & Paragraphs
          ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 space-y-1.5 text-gray-700 my-2" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 space-y-1.5 text-gray-700 my-2" {...props} />,
          li: ({node, ...props}) => <li className="pl-1" {...props} />,
          p: ({node, ...props}) => <p className="mb-3 text-gray-800" {...props} />,
          strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-200 pl-4 italic text-gray-600 my-4" {...props} />,
          a: ({node, ...props}) => <a className="text-blue-600 hover:underline hover:text-blue-800 transition-colors" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
