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
    kategoriFasilitas: null,
    totalFasilitas: 0,
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
        kategoriFasilitas: response.data.kategori_fasilitas || {},
        totalFasilitas: response.data.total_fasilitas || 0,
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

  // Prepare chart data for certificate types
  const certLabels = stats.jenisSertifikat
    ? Object.keys(stats.jenisSertifikat)
    : [];
  const certData = stats.jenisSertifikat
    ? Object.values(stats.jenisSertifikat)
    : [];

  // Prepare chart data for facility categories
  const facilityLabels = stats.kategoriFasilitas
    ? Object.keys(stats.kategoriFasilitas)
    : [];
  const facilityData = stats.kategoriFasilitas
    ? Object.values(stats.kategoriFasilitas)
    : [];

  const barChartData = {
    labels: certLabels,
    datasets: [
      {
        label: "Jumlah Sertifikat",
        data: certData,
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

  const facilityBarChartData = {
    labels: facilityLabels,
    datasets: [
      {
        label: "Jumlah Fasilitas",
        data: facilityData,
        backgroundColor: [
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 99, 132, 0.7)",
          "rgba(75, 192, 192, 0.7)",
        ],
        borderColor: [
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Combined pie chart data for tanah wakaf and fasilitas
  const combinedPieChartData = {
    labels: ["Total Tanah Wakaf", "Total Fasilitas"],
    datasets: [
      {
        data: [stats.totalTanah, stats.totalFasilitas],
        backgroundColor: [
          "rgba(54, 162, 235, 0.7)", // Blue for tanah
          "rgba(255, 159, 64, 0.7)",  // Orange for fasilitas
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

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

  return (
    <div className="relative">
      <Sidebar>
        <div className="p-5">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Wakaf</h1>
            <p className="text-gray-600">PC Persis Banjaran</p>
          </div>

          {/* Summary Cards Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Ringkasan Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                <h3 className="text-gray-500 text-sm font-medium">Total Tanah Wakaf</h3>
                <p className="text-3xl font-bold text-gray-800">{stats.totalTanah}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
                <h3 className="text-gray-500 text-sm font-medium">Total Fasilitas</h3>
                <p className="text-3xl font-bold text-gray-800">{stats.totalFasilitas}</p>
              </div>
            </div>
          </div>

          {/* Combined Pie Chart Section */}
          <div className="mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4 text-gray-700">
                Perbandingan Total Tanah Wakaf dan Fasilitas
              </h3>
              <div className="h-80">
                <Pie
                  data={combinedPieChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${value}`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Certificate Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Data Sertifikat</h2>
            
            {/* Certificate Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {certLabels.map((jenis, index) => (
                <div key={`cert-${index}`} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                  <h3 className="text-gray-500 text-sm font-medium">{jenis}</h3>
                  <p className="text-2xl font-bold text-gray-800">{certData[index]}</p>
                </div>
              ))}
            </div>
            
            {/* Certificate Bar Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4 text-gray-700">
                Distribusi Jenis Sertifikat
              </h3>
              <div className="h-80">
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
          </div>

          {/* Facility Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Data Fasilitas</h2>
            
            {/* Facility Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {facilityLabels.map((kategori, index) => (
                <div key={`facility-${index}`} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                  <h3 className="text-gray-500 text-sm font-medium">{kategori}</h3>
                  <p className="text-2xl font-bold text-gray-800">{facilityData[index]}</p>
                </div>
              ))}
            </div>
            
            {/* Facility Bar Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4 text-gray-700">
                Distribusi Kategori Fasilitas
              </h3>
              <div className="h-80">
                <Bar
                  data={facilityBarChartData}
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
                            return `${context.parsed.y} fasilitas`;
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
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default Dashboard;