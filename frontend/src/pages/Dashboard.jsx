import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import axios from 'axios';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [hourlyData, setHourlyData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const [hourlyRes, dailyRes] = await Promise.all([
        axios.get('/api/dashboard/trends/hourly'),
        axios.get('/api/dashboard/trends/daily'),
      ]);

      // Process hourly data
      const hourly = hourlyRes.data;
      const hourlyChartData = {
        labels: hourly.map((d) => `${d.hour}:00`),
          datasets: [
          {
            label: 'שיחות לשעה',
            data: hourly.map((d) => d.call_count),
            borderColor: 'rgb(52, 152, 219)',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            tension: 0.4,
          },
        ],
      };
      setHourlyData(hourlyChartData);

      // Process daily data
      const daily = dailyRes.data;
      const dailyChartData = {
        labels: daily.map((d) => new Date(d.date).toLocaleDateString('he-IL')),
        datasets: [
          {
            label: 'שיחות ליום',
            data: daily.map((d) => d.call_count),
            backgroundColor: 'rgba(231, 76, 60, 0.8)',
            borderColor: 'rgb(231, 76, 60)',
            borderWidth: 1,
          },
        ],
      };
      setDailyData(dailyChartData);
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  if (loading) {
    return <div className="loading">טוען לוח בקרה...</div>;
  }

  return (
    <div className="dashboard-page">
      <h1>לוח בקרה - מגמות שיחות לקוחות</h1>

      <div className="charts-container">
        <div className="chart-card">
          <h2>מגמות שעתיות (24 השעות האחרונות)</h2>
          <div className="chart-wrapper">
            {hourlyData && (
              <Line data={hourlyData} options={{ ...chartOptions, title: { display: false } }} />
            )}
          </div>
        </div>

        <div className="chart-card">
          <h2>מגמות יומיות (30 הימים האחרונים)</h2>
          <div className="chart-wrapper">
            {dailyData && (
              <Bar data={dailyData} options={{ ...chartOptions, title: { display: false } }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

