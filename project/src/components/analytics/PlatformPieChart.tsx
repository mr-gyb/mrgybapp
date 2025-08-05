import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface PlatformPieChartProps {
  platformData: Array<{ name: string; value: number; percentage: number; color: string }>;
  COLORS: string[] | Record<string, string>;
  renderCustomPieLabel: (props: any) => React.ReactNode;
}

const PlatformPieChart: React.FC<PlatformPieChartProps> = ({
  platformData,
  COLORS,
  renderCustomPieLabel
}) => {
  const hasData = platformData && platformData.length > 0 && platformData.some(d => d.value > 0);

  return (
    <div style={{ width: '100%', minHeight: 400 }}>
      {hasData ? (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={platformData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              label={renderCustomPieLabel}
              labelLine={false}
            >
              {platformData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || '#8884d8'}
                />
              ))}
            </Pie>
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div style={{
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#aaa',
          fontSize: 18,
          margin: '0 auto',
          border: '4px solid #e0e0e0'
        }}>
          No Data
        </div>
      )}
    </div>
  );
};

export default PlatformPieChart; 