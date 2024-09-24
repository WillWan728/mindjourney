import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getWellbeingTrend } from '../utils/wellbeingUtils';
import { auth } from '../config/firebase';

const WellnessTrendGraph = () => {
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    const fetchTrendData = async () => {
      const user = auth.currentUser;
      if (user) {
        const data = await getWellbeingTrend(user.uid);
        setTrendData(data);
      }
    };

    fetchTrendData();
  }, []);

  return (
    <div className="wellness-trend-graph">
      <h3>Your 7-Day Wellness Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => new Date(date).toLocaleDateString()}
          />
          <YAxis domain={[0, 100]} />
          <Tooltip 
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
            formatter={(value) => [`${value.toFixed(2)}%`, 'Wellness Score']}
          />
          <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WellnessTrendGraph;