import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MarketDataPoint } from '../types';
import { TrendingUp, PieChart, ArrowUpRight } from 'lucide-react';

interface MarketAnalysisProps {
  data: MarketDataPoint[];
}

const MarketAnalysis: React.FC<MarketAnalysisProps> = ({ data }) => {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-notion-text">Market Analysis</h1>
        <p className="text-notion-dim mt-2">Real-time performance metrics and optimization opportunities.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border border-notion-border rounded-lg bg-white shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-notion-dim font-medium uppercase tracking-wide">Total Revenue</p>
              <h3 className="text-2xl font-bold text-notion-text mt-1">$124,500</h3>
            </div>
            <div className="text-green-600 bg-green-50 p-1 rounded">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <ArrowUpRight size={16} className="mr-1" />
            <span>+12.5% vs last month</span>
          </div>
        </div>
        
        <div className="p-6 border border-notion-border rounded-lg bg-white shadow-sm">
          <div className="flex justify-between items-start">
             <div>
              <p className="text-sm text-notion-dim font-medium uppercase tracking-wide">Net Profit</p>
              <h3 className="text-2xl font-bold text-notion-text mt-1">$45,200</h3>
            </div>
             <div className="text-blue-600 bg-blue-50 p-1 rounded">
              <PieChart size={20} />
            </div>
          </div>
           <div className="mt-4 flex items-center text-sm text-green-600">
            <ArrowUpRight size={16} className="mr-1" />
            <span>+8.2% vs last month</span>
          </div>
        </div>

        <div className="p-6 border border-notion-border rounded-lg bg-white shadow-sm flex flex-col justify-center">
          <h4 className="font-semibold text-notion-text mb-2">AI Insight</h4>
          <p className="text-sm text-notion-dim leading-relaxed">
            Revenue is outpacing expenses. Consider reinvesting 15% of profit into marketing channels identified in the Q2 report to accelerate growth.
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 border border-notion-border rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Revenue vs Expenses</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" stroke="#9b9a97" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9b9a97" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '12px' }}
                  cursor={{ fill: '#f7f7f5' }}
                />
                <Bar dataKey="revenue" fill="#37352f" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="expenses" fill="#e0e0e0" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 border border-notion-border rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Profit Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" stroke="#9b9a97" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9b9a97" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="profit" stroke="#37352f" strokeWidth={2} dot={{ r: 4, fill: '#37352f' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysis;