import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AnalyticsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        No analytics data available yet.
      </div>
    );
  }

  // Process data: group by date
  // Assuming data is array of { timestamp: string, ... }
  // We want to show clicks per day for the last 7 days or similar.
  // Actually the data structure from backend is { ..., analytics: [{ timestamp, ... }] }
  // Wait, backend returns the whole document with an analytics array.
  
  const processData = () => {
      const counts = {};
      data.forEach(item => {
          const date = new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          counts[date] = (counts[date] || 0) + 1;
      });

      return Object.entries(counts).map(([name, clicks]) => ({ name, clicks }));
  };

  const chartData = processData();

  return (
    <div className="h-64 w-full bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
      <h3 className="text-slate-300 text-sm font-medium mb-4">Clicks Over Time</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            tick={{fontSize: 12}} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{fontSize: 12}} 
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
            cursor={{fill: 'rgba(99, 102, 241, 0.1)'}}
          />
          <Bar dataKey="clicks" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="url(#colorGradient)" />
            ))}
          </Bar>
           <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.5}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsChart;
