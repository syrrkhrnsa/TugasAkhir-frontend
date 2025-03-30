import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  PieController,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import Sidebar from "../components/Sidebar";

// Register ChartJS components
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PieController,
  ArcElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTanah: 0,
    jenisSertifikat: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://127.0.0.1:8000/api/dashboard/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      setStats({
        totalTanah: response.data.total_tanah,
        jenisSertifikat: response.data.jenis_sertifikat || {},
      });
      setError(null);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="relative">
        <Sidebar>
          <div className="p-5">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </Sidebar>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        <Sidebar>
          <div className="p-5">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> {error}
              <button
                onClick={fetchDashboardStats}
                className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          </div>
        </Sidebar>
      </div>
    );
  }

  // Prepare chart data
  const chartLabels = stats.jenisSertifikat
    ? Object.keys(stats.jenisSertifikat)
    : [];
  const chartData = stats.jenisSertifikat
    ? Object.values(stats.jenisSertifikat)
    : [];

  const barChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Jumlah Sertifikat",
        data: chartData,
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: ["Total Tanah Wakaf"],
    datasets: [
      {
        data: [stats.totalTanah],
        backgroundColor: ["rgba(54, 162, 235, 0.7)"],
        borderColor: ["rgba(54, 162, 235, 1)"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="relative">
      <Sidebar>
        <div className="p-5">
          <div className="mb-4">
            <h2 className="text-xl font-medium">Statistik Tanah Wakaf</h2>
            <p className="text-gray-500">PC Persis Banjaran</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500">Total Tanah Wakaf</h3>
              <p className="text-2xl font-bold">{stats.totalTanah}</p>
            </div>

            {chartLabels.map((jenis, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-gray-500">{jenis}</h3>
                <p className="text-2xl font-bold">{chartData[index]}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">
                Distribusi Jenis Sertifikat
              </h3>
              <div className="h-64">
                <Bar
                  data={barChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            return `${context.parsed.y} sertifikat`;
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0,
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Total Tanah Wakaf</h3>
              <div className="h-64">
                <Pie
                  data={pieChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            return `${context.parsed} tanah wakaf`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default Dashboard;
