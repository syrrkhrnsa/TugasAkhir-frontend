import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";

const Approval = () => {
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [viewedMessages, setViewedMessages] = useState(new Set()); // Track viewed messages

  // Fetch notifications from the backend
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:8000/api/approvals", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      // Sort messages by created_at in descending order
      const sortedMessages = response.data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setMessages(sortedMessages); // Set messages to the fetched notifications
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications(); // Fetch notifications on mount

    // Load viewed messages from local storage
    const viewed = JSON.parse(localStorage.getItem("viewedMessages")) || [];
    setViewedMessages(new Set(viewed));
  }, []);

  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    setViewedMessages((prev) => {
      const updated = new Set(prev);
      updated.add(msg.id);
      localStorage.setItem("viewedMessages", JSON.stringify(Array.from(updated))); // Save to local storage
      return updated;
    });
  };

  const handleApprove = async () => {
    if (!selectedMessage) return;

    const token = localStorage.getItem("token");
    try {
      await axios.post(`http://127.0.0.1:8000/api/approvals/${selectedMessage.id}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      alert("Data telah disetujui dan disimpan.");
      fetchNotifications(); // Refresh notifications after approval
    } catch (error) {
      console.error("Gagal menyetujui data:", error);
      alert("Terjadi kesalahan saat menyetujui data.");
    }
  };

  const handleReject = async () => {
    if (!selectedMessage) return;

    const token = localStorage.getItem("token");
    try {
      await axios.post(`http://127.0.0.1:8000/api/approvals/${selectedMessage.id}/reject`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      alert("Data telah ditolak.");
      fetchNotifications(); // Refresh notifications after rejection
    } catch (error) {
      console.error("Gagal menolak data:", error);
      alert("Terjadi kesalahan saat menolak data.");
    }
  };

  return (
    <div className="relative">
      <Sidebar>
        <div className="relative mb-4 flex justify-between items-center p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">Pesan Perubahan</h2>
            <p className="text-gray-500">PC Persis Banjaran</p>
          </div>
          <input
            type="text"
            placeholder="Cari pesan..."
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Container utama untuk daftar pesan dan detail */}
        <div className="flex border rounded-lg overflow-hidden shadow-md">
          {/* List Messages */}
          <div className="w-1/2 p-4 bg-white border-r">
            <ul className="divide-y divide-gray-300">
              {messages.map((msg) => {
                let data = {};
                try {
                  data = JSON.parse(msg.data); // Parse JSON data
                } catch (error) {
                  console.error("Error parsing JSON:", error);
                }

                // Tentukan teks berdasarkan metode HTTP
                let approvalText = "Meminta persetujuan perubahan data tanah";
                if (msg.method === "POST") {
                  approvalText = "Meminta persetujuan pembuatan data tanah";
                } else if (msg.method === "PUT") {
                  approvalText = "Meminta persetujuan pembaruan data tanah"; // Tambahkan logika untuk PUT
                }

                // Format waktu notifikasi
                const formattedDate = new Intl.DateTimeFormat("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }).format(new Date(msg.created_at));

                return (
                  <li
                    key={msg.id}
                    className={`py-3 px-4 rounded-md cursor-pointer transition duration-200 flex justify-between items-center ${
                      selectedMessage?.id === msg.id
                        ? "bg-yellow-200"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => handleSelectMessage(msg)}
                  >
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center">
                        {/* Red circle for unread messages */}
                        {!viewedMessages.has(msg.id) && (
                          <span className="w-2.5 h-2.5 bg-red-500 rounded-full mr-2"></span>
                        )}
                        <strong className="text-gray-800">{data.NamaPimpinanJamaah || "N/A"}</strong>
                      </div>
                      <span className="text-gray-600 text-sm">{approvalText}</span>
                    </div>
                    <span className="text-gray-500 text-xs">{formattedDate}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Detail Message */}
          <div className="w-1/2 p-6 bg-gray-50 flex flex-col justify-center items-center text-center">
            {selectedMessage ? (
              <>
                <h3 className="font-medium text-lg mb-2">
                  {selectedMessage.message}
                </h3>

                {/* Parsing data jika berbentuk JSON */}
                {(() => {
                  let data = {};
                  try {
                    data = JSON.parse(selectedMessage.data);
                  } catch (error) {
                    console.error("Error parsing JSON:", error);
                  }

                  return (
                    <div className="text-gray-600 mb-4 text-left">
                      <strong className="block text-lg mb-1">
                        {data.NamaPimpinanJamaah || "N/A"}
                      </strong>
                      <div className="mb-4">
                        <p className="font-semibold">Detail:</p>
                        <p><strong>Lokasi:</strong> {data.lokasi || "N/A"}</p>
                        <p><strong>Luas Tanah:</strong> {data.luasTanah || "N/A"}</p>
                        <p><strong>Legalitas:</strong> {data.legalitas || "N/A"}</p>
                      </div>

                      {/* Menampilkan Data Sebelumnya */}
                      {data.previous_data && (
                        <div className="border-t border-gray-300 pt-4 mt-4">
                          <p className="font-semibold">Data Sebelumnya:</p>
                          <p><strong>Lokasi:</strong> {data.previous_data.lokasi || "N/A"}</p>
                          <p><strong>Luas Tanah:</strong> {data.previous_data.luasTanah || "N/A"}</p>
                          <p><strong>Legalitas:</strong> {data.previous_data.legalitas || "N/A"}</p>
                        </div>
                      )}
                      {/* Menampilkan Data Terbaru */}
                      {data.updated_data && (
                        <div className="border-t border-gray-300 pt-4 mt-4">
                          <p className="font-semibold">Data Terbaru:</p>
                          <p><strong>Lokasi:</strong> {data.updated_data.lokasi || "N/A"}</p>
                          <p><strong>Luas Tanah:</strong> {data.updated_data.luasTanah || "N/A"}</p>
                          <p><strong>Legalitas:</strong> {data.updated_data.legalitas || "N/A"}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="flex gap-4">
                  <button 
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                    onClick={handleApprove} // Call approve function
                  >
                    Setuju
                  </button>
                  <button 
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    onClick={handleReject} // Call reject function
                  >
                    Tolak
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-lg">
                Klik pesan untuk melihat permintaan persetujuan
              </p>
            )}
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default Approval;