import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const ToxicPieChart = ({ stats, predictions }) => {
  // Colors for the simplified pie chart
  const SIMPLE_COLORS = ['#FF6384', '#4CAF50'];
  
  // Get the total comments count
  const totalComments = stats[0] ? stats[0].count / (parseFloat(stats[0].percentage) / 100) : 0;
  
  // Calculate toxic comments count - a comment is toxic if ANY category is flagged
  let toxicCount = 0;
  
  // If we have access to the raw predictions data
  if (predictions) {
    toxicCount = predictions.filter(item => 
      item.prediction.some(flag => flag === 1)
    ).length;
  } else {
    // Fallback to approximation if predictions aren't available
    // This is still an approximation but better than summing all categories
    toxicCount = Math.min(
      stats.reduce((sum, stat) => sum + stat.count, 0) / 2,
      totalComments
    );
  }
  
  // Calculate non-toxic count
  const nonToxicCount = totalComments - toxicCount;
  
  // Create simplified data array
  const simplifiedData = [
    {
      name: "Negative",
      value: toxicCount,
      percentage: ((toxicCount / totalComments) * 100).toFixed(1)
    },
    {
      name: "Others",
      value: nonToxicCount,
      percentage: ((nonToxicCount / totalComments) * 100).toFixed(1),
      customPosition: true
    }
  ];
  
  // Use the simplified data for the pie chart
  const data = simplifiedData;
  const COLORS = SIMPLE_COLORS;

  // Custom tooltip to show percentage
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-md">
          <p className="font-medium">{payload[0].name}</p>
          <p>{`Count: ${Math.round(payload[0].value)}`}</p>
          <p>{`Percentage: ${payload[0].payload.percentage}%`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom label renderer to position labels better
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, payload }) => {
    const RADIAN = Math.PI / 180;
    // Position the label further from the pie
    const radius = outerRadius * 1.2;
    let x = cx + radius * Math.cos(-midAngle * RADIAN);
    let y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Move the "Non-Toxic" label up
    if (name === "Others") {
      y -= 150; // Adjust this value as needed
      x -= -125; // Adjust this value as needed
    }
  
    return (
      <text 
        x={x} 
        y={y} 
        fill={COLORS[index % COLORS.length]}
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontWeight="bold"
      >
        {`${payload.percentage}%`}
      </text>
    );
  };

  // Custom label line renderer
  const renderCustomizedLabelLine = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, payload }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.2;
    let x = cx + radius * Math.cos(-midAngle * RADIAN);
    let y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Get the point on the pie edge
    const px = cx + outerRadius * Math.cos(-midAngle * RADIAN);
    const py = cy + outerRadius * Math.sin(-midAngle * RADIAN);
    
    // Move the "Non-Toxic" label line
    if (payload.name === "Others") {
      y -= 150; // Match the label adjustment
      x -= -125; // Match the label adjustment
    }
    
    return (
      <path 
        d={`M${px},${py}L${x},${y}`} 
        stroke={COLORS[index % COLORS.length]} 
        fill="none"
      />
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={renderCustomizedLabelLine}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label={renderCustomizedLabel}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend layout="vertical" align="right" verticalAlign="middle" />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ToxicPieChart;
