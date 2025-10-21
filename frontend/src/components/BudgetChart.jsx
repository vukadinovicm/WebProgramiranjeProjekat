import * as React from "react";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";

export default function BudgetChart({ data = [] }) {
  // data: [{ category_name, limit_amount, spent }]
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="category_name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="limit_amount" name="Limit" />
          <Bar dataKey="spent" name="Potrošeno" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}