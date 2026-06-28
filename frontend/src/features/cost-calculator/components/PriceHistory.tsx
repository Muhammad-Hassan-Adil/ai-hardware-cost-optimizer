import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { supabase } from '../../../services/supabaseClient';
import { useCostCalculator } from '../hooks/useCostCalculator';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const PriceHistory: React.FC = () => {
  const { models } = useCostCalculator();
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const activeModels = models.filter(m => m.is_active).sort((a, b) => a.friendly_name.localeCompare(b.friendly_name));

  useEffect(() => {
    if (!selectedModelId && activeModels.length > 0) {
      const defaultId = activeModels.find(m => m.friendly_name.includes('GPT-4o'))?.id || activeModels[0].id;
      setSelectedModelId(defaultId);
    }
  }, [activeModels, selectedModelId]);

  useEffect(() => {
    if (!selectedModelId) return;
    
    const fetchHistory = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('price_history')
        .select('*')
        .eq('model_id', selectedModelId)
        .order('date', { ascending: true });
        
      if (!error && data) {
        // Current price as the latest data point
        const currentModel = activeModels.find(m => m.id === selectedModelId);
        const latestPoint = {
          date: new Date().toISOString().split('T')[0],
          prompt_price: currentModel ? currentModel.prompt_price_per_1m_usd : 0,
          completion_price: currentModel ? currentModel.completion_price_per_1m_usd : 0
        };

        const formatted = data.map(row => ({
          date: row.date,
          prompt_price: Number(row.prompt_price_per_1m_usd),
          completion_price: Number(row.completion_price_per_1m_usd)
        }));
        
        // Push the current price if the last history date isn't today
        if (formatted.length === 0 || formatted[formatted.length - 1].date !== latestPoint.date) {
          formatted.push(latestPoint);
        }

        setHistoryData(formatted);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [selectedModelId, activeModels]);

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">API Price History</h3>
        
        <div className="w-full sm:w-64">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Select Model
          </label>
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
          >
            {activeModels.map(m => (
              <option key={m.id} value={m.id}>{m.friendly_name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-80 w-full mt-4">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-slate-500 animate-pulse font-medium">Loading history...</div>
          </div>
        ) : historyData.length <= 1 ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-slate-500 text-sm">No historical price changes recorded for this model yet.</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                tickMargin={10}
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
                label={{ value: 'Price / 1M Tokens (USD)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#64748b', fontSize: 12 } }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                itemStyle={{ fontSize: '14px' }}
                formatter={(value: any) => [`$${Number(value).toFixed(2)}`, '']}
              />
              <Legend verticalAlign="top" height={36} />
              <Line 
                type="stepAfter" 
                dataKey="prompt_price" 
                name="Input Price"
                stroke="#3b82f6" 
                strokeWidth={2}
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="stepAfter" 
                dataKey="completion_price" 
                name="Output Price"
                stroke="#10b981" 
                strokeWidth={2} 
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};
