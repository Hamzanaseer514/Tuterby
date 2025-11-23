import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({ data, colors }) => {
  const theme = useTheme();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme.palette.text.secondary,
          font: {
            family: theme.typography.fontFamily
          },
          boxWidth: 12,
          padding: 16
        }
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        usePointStyle: true,
        boxPadding: 4,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: theme.palette.text.secondary
        }
      },
      y: {
        grid: {
          color: theme.palette.divider,
          drawBorder: false
        },
        ticks: {
          color: theme.palette.text.secondary,
          padding: 8
        }
      }
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        backgroundColor: theme.palette.background.paper,
        borderWidth: 2
      },
      line: {
        tension: 0.4,
        borderWidth: 2,
        fill: true
      }
    }
  };

  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      borderColor: colors[index] || theme.palette.primary.main,
      backgroundColor: `${colors[index]}20` || `${theme.palette.primary.main}20`,
      pointBorderColor: colors[index] || theme.palette.primary.main,
      pointBackgroundColor: theme.palette.background.paper
    }))
  };

  return (
    <Box sx={{ height: '100%', p: 2 }}>
      <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
        Session Trends
      </Typography>
      <Box sx={{ height: 300 }}>
        <Line options={options} data={chartData} />
      </Box>
    </Box>
  );
};

export default LineChart;