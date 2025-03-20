import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { getRoleId } from "../utils/Auth";

const Approval = () => {
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [viewedMessages, setViewedMessages] = useState(new Set()); // Track viewed messages
  const isCreating = !selectedMessage?.data?.details?.previous_data;

  // Fetch notifications from the backend
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:8000/api/notifications", {
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

  const roleId = getRoleId();
  const isPimpinanJamaah = roleId === "326f0dde-2851-4e47-ac5a-de6923447317";

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
    const approvalId = selectedMessage.data.id_approval; // Get the id_approval

    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/approvals/${approvalId}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("Response from approval:", response.data); // Log response
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
    const approvalId = selectedMessage.data.id_approval; // Get the id_approval

    try {
      await axios.post(`http://127.0.0.1:8000/api/approvals/${approvalId}/reject`, {}, {
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

  const handleUpdateApprove = async () => {
    if (!selectedMessage) return;

    const token = localStorage.getItem("token");
    const approvalId = selectedMessage.data.id_approval; // Get the id_approval

    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/approvals/${approvalId}/update/approve`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("Response from approval:", response.data); // Log response
      alert("Data telah disetujui dan disimpan.");
      fetchNotifications(); // Refresh notifications after approval
    } catch (error) {
      console.error("Gagal menyetujui data:", error);
      alert("Terjadi kesalahan saat menyetujui data.");
    }
  };

  const handleUpdateReject = async () => {
    if (!selectedMessage) return;

    const token = localStorage.getItem("token");
    const approvalId = selectedMessage.data.id_approval; // Get the id_approval

    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/approvals/${approvalId}/update/reject`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("Response from rejection:", response.data); // Log response
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
                const details = msg.data.details || {};
                const previousData = details.previous_data || {};
                const updatedData = details.updated_data || {}; // Ambil updated_data jika ada
                const isCreating = !details.previous_data; 

                // Ambil NamaPimpinanJamaah dari updated_data, details, atau previous_data
                const namaPimpinan =
                  updatedData.NamaPimpinanJamaah ||
                  details.NamaPimpinanJamaah ||
                  previousData.NamaPimpinanJamaah ||
                  "Unknown";

                // Ambil pesan dari updated_data atau message dari msg.data jika kosong
                let message =
                  updatedData.message || // Prioritaskan pesan dari updated_data
                  msg.data.message || // Jika tidak ada, pakai default dari msg.data
                  "Tidak ada pesan tersedia";

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
                      selectedMessage?.id === msg.id ? "bg-yellow-200" : "hover:bg-gray-100"
                    }`}
                    onClick={() => handleSelectMessage(msg)}
                  >
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center">
                        {/* Red circle for unread messages */}
                        {!viewedMessages.has(msg.id) && (
                          <span className="w-2.5 h-2.5 bg-red-500 rounded-full mr-2"></span>
                        )}
                        <strong className="text-gray-800">{namaPimpinan}</strong>
                      </div>
                      <span className="text-gray-600 text-sm">{message}</span>
                      <span
                        className={`text-xs font-semibold mt-1 ${
                          isCreating ? "text-green-500" : "text-blue-500"
                        }`}
                      >
                        {isCreating ? "Pembuatan Baru" : "Perubahan Data"}
                      </span>
                    </div>
                    <span className="text-gray-500 text-xs">{formattedDate}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Detail Message */}
          <div className="w-1/2 p-6 bg-white-50 flex flex-col justify-center items-center text-center">
            {selectedMessage ? (
              <>
                <div className="text-gray-600 mb-4 text-left">
                  {isCreating ? (
                    <table className="min-w-full border-collapse border border-gray-300">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 px-4 py-2">Judul</th>
                          <th className="border border-gray-300 px-4 py-2">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">Pimpinan Jamaah</td>
                          <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details?.NamaPimpinanJamaah || "N/A"}</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">Nama Wakif</td>
                          <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details?.NamaWakif || "N/A"}</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">Lokasi</td>
                          <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details?.lokasi || "N/A"}</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">Luas Tanah</td>
                          <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details?.luasTanah || "N/A"}</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">Legalitas</td>
                          <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details?.legalitas || "N/A"}</td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex flex-col gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Data Sebelumnya</h3>
                        <table className="min-w-full border-collapse border border-gray-300">
                          <thead>
                            <tr>
                              <th className="border border-gray-300 px-4 py-2">Judul</th>
                              <th className="border border-gray-300 px-4 py-2">Data</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(selectedMessage.data.details.updated_data).map(([key]) => (
                              key !== "id_tanah" && selectedMessage.data.details.previous_data[key] !== undefined && (
                                <tr key={key}>
                                  <td className="border border-gray-300 px-4 py-2">{key}</td>
                                  <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details.previous_data[key] || "N/A"}</td>
                                </tr>
                              )
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Data Terbaru</h3>
                        <table className="min-w-full border-collapse border border-gray-300">
                          <thead>
                            <tr>
                              <th className="border border-gray-300 px-4 py-2">Judul</th>
                              <th className="border border-gray-300 px-4 py-2">Data</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(selectedMessage.data.details.updated_data).map(([key, value]) => (
                              key !== "id_tanah" && (
                                <tr key={key}>
                                  <td className="border border-gray-300 px-4 py-2">{key}</td>
                                  <td className="border border-gray-300 px-4 py-2">{value || "N/A"}</td>
                                </tr>
                              )
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {isPimpinanJamaah ? (
                    <div>
                      {isCreating ? (
                        <span className="text-green-500 text-xs">Data diperbaharui</span>
                      ) : (
                        <span className="text-red-500 text-xs">Data ditolak</span>
                      )}
                    </div>
                  ) : (
                    <>
                      <button
                        className="bg-green-500 text-white text-xs px-3 py-2 rounded-md hover:bg-green-600"
                        onClick={isCreating ? handleApprove : handleUpdateApprove}
                      >
                        Setuju
                      </button>
                      <button
                        className="bg-red-500 text-white text-xs px-3 py-2 rounded-md hover:bg-red-600"
                        onClick={isCreating ? handleReject : handleUpdateReject}
                      >
                        Tolak
                      </button>
                    </>
                  )}
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