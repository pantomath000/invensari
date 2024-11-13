import React, { useEffect, useState } from 'react';
import { fetchDashboardData } from '../api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Link } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const getData = async () => {
      const response = await fetchDashboardData();
      setData(response.data.weekly_sales);
    };
    getData();
  }, []);

  const chartData = data ? {
    labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
    datasets: [{
      label: 'Grafik Penjualan',
      data: data.map(sale => sale.total_sales),
      fill: false,
      borderColor: 'rgba(75, 192, 192, 1)',
      pointBackgroundColor: 'black',
      pointBorderColor: 'black',
      pointRadius: 5,
      tension: 0.1
    }]
  } : null;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Beranda</h1>
      {chartData && (
        <div style={styles.chartContainer}>
          <Line data={chartData} options={{ maintainAspectRatio: false }} />
        </div>
      )}
      <div style={styles.navbar}>
        <Link to="/" style={styles.navItem}>
          <img src="http://134.209.236.158:8369/home.png" alt="Home" style={styles.icon} />
          <span>Beranda</span>
        </Link>
        <Link to="/stock" style={styles.navItem}>
          <img src="http://134.209.236.158:8369/stok.png" alt="Stok" style={styles.icon} />
          <span>Stok</span>
        </Link>
        <Link to="/transactions" style={styles.navItem}>
          <img src="http://134.209.236.158:8369/transaksi.png" alt="Transaksi" style={styles.icon} />
          <span>Transaksi</span>
        </Link>
        <Link to="/profile" style={styles.navItem}>
          <img src="http://134.209.236.158:8369/profil.png" alt="Profil" style={styles.icon} />
          <span>Profil</span>
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: `'Baloo 2', sans-serif`,
    padding: '20px',
  },
  title: {
    color: '#8A5C34',
    fontSize: '1.8rem',
    marginBottom: '20px',
  },
  chartContainer: {
    width: '100%',
    maxWidth: '600px',
    height: '300px',
    backgroundColor: '#F0F0F0',
    padding: '10px',
    borderRadius: '8px',
  },
  navbar: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    backgroundColor: '#D9B18E',
    padding: '10px 0',
    boxShadow: '0px -2px 5px rgba(0, 0, 0, 0.1)',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textDecoration: 'none',
    color: '#8A5C34',
    fontFamily: `'Baloo 2', sans-serif`,
  },
  icon: {
    width: '24px',
    height: '24px',
    marginBottom: '5px',
  },
};

export default Dashboard;
