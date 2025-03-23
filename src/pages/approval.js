import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { getRoleId } from "../utils/Auth";
import Swal from 'sweetalert2';

const Approval = () => {
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [viewedMessages, setViewedMessages] = useState(new Set());
  const [approvalStatus, setApprovalStatus] = useState({}); // Track approval status for each message
  const isCreating = !selectedMessage?.data?.details?.previous_data;
  const isSertifikat= !selectedMessage?.data?.details?.NamaPimpinanJamaah;

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:8000/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const sortedMessages = response.data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setMessages(sortedMessages);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const roleId = getRoleId();
  const isPimpinanJamaah = roleId === "326f0dde-2851-4e47-ac5a-de6923447317";

  useEffect(() => {
    fetchNotifications();
    const viewed = JSON.parse(localStorage.getItem("viewedMessages")) || [];
    setViewedMessages(new Set(viewed));

    // Load approval status from localStorage
    const storedApprovalStatus = localStorage.getItem("approvalStatus");
    if (storedApprovalStatus) {
      try {
        setApprovalStatus(JSON.parse(storedApprovalStatus));
      } catch (error) {
        console.error("Failed to parse approval status from localStorage:", error);
        // Clear invalid data
        localStorage.removeItem("approvalStatus");
      }
    }
  }, []);

  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    setViewedMessages((prev) => {
      const updated = new Set(prev);
      updated.add(msg.id);
      localStorage.setItem("viewedMessages", JSON.stringify(Array.from(updated)));
      return updated;
    });
  };

  const handleApprove = async () => {
    if (!selectedMessage) return;
  
    const token = localStorage.getItem("token");
    const approvalId = selectedMessage.data.id_approval;
  
    try {
      await axios.post(`http://127.0.0.1:8000/api/approvals/${approvalId}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
  
      // Ganti alert dengan SweetAlert
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data telah disetujui dan disimpan.',
      });
  
      const newApprovalStatus = { ...approvalStatus, [selectedMessage.id]: "approved" };
      setApprovalStatus(newApprovalStatus);
      localStorage.setItem("approvalStatus", JSON.stringify(newApprovalStatus)); // Save to localStorage
      fetchNotifications();
    } catch (error) {
      console.error("Gagal menyetujui data:", error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menyetujui data.',
      });
    }
  };

  const handleReject = async () => {
    if (!selectedMessage) return;
  
    const token = localStorage.getItem("token");
    const approvalId = selectedMessage.data.id_approval;
  
    try {
      await axios.post(`http://127.0.0.1:8000/api/approvals/${approvalId}/reject`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
  
      // Ganti alert dengan SweetAlert
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data telah ditolak.',
      });
  
      const newApprovalStatus = { ...approvalStatus, [selectedMessage.id]: "rejected" };
      setApprovalStatus(newApprovalStatus);
      localStorage.setItem("approvalStatus", JSON.stringify(newApprovalStatus)); // Save to localStorage
      fetchNotifications();
    } catch (error) {
      console.error("Gagal menolak data:", error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menolak data.',
      });
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
      // Ganti alert dengan SweetAlert
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data telah disetujui dan disimpan.',
      });
  
      const newApprovalStatus = { ...approvalStatus, [selectedMessage.id]: "approved" };
      setApprovalStatus(newApprovalStatus);
      localStorage.setItem("approvalStatus", JSON.stringify(newApprovalStatus)); // Save to localStorage
      fetchNotifications(); // Refresh notifications after approval
    } catch (error) {
      console.error("Gagal menyetujui data:", error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menyetujui data.',
      });
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
      // Ganti alert dengan SweetAlert
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data telah ditolak.',
      });
  
      const newApprovalStatus = { ...approvalStatus, [selectedMessage.id]: "rejected" };
      setApprovalStatus(newApprovalStatus);
      localStorage.setItem("approvalStatus", JSON.stringify(newApprovalStatus)); // Save to localStorage
      fetchNotifications(); // Refresh notifications after rejection
    } catch (error) {
      console.error("Gagal menolak data:", error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menolak data.',
      });
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

        <div className="flex border rounded-lg overflow-hidden shadow-md">
          <div className="w-1/2 p-4 bg-white border-r">
            <ul className="divide-y divide-gray-300">
              {messages.map((msg) => {
                const details = msg.data.details || {};
                const previousData = details.previous_data || {};
                const updatedData = details.updated_data || {};
                const isCreating = !details.previous_data;

                const namaPimpinan = isPimpinanJamaah ? msg.data.approvername : (msg.data.username || "Unknown");

                let message =
                  updatedData.message ||
                  msg.data.message ||
                  "Tidak ada pesan tersedia";

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

          <div className="w-1/2 p-6 bg-white-50 flex flex-col justify-center items-center text-center">
            {selectedMessage ? (
              <>
                <div className="text-gray-600 mb-4 text-left">
                  {/* New section for isSertifikat */}
                  {isSertifikat && ( 
                        <>
                          {isCreating ? (
                            <div className="mt-6">
                              <h3 className="text-lg font-semibold mb-2">Detail Sertifikat</h3>
                              <table className="min-w-full border-collapse border border-gray-300">
                                <thead>
                                  <tr>
                                    <th className="border border-gray-300 px-4 py-2">Judul</th>
                                    <th className="border border-gray-300 px-4 py-2" colSpan="2">Data</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td className="border border-gray-300 px-4 py-2">Pimpinan Jamaah</td>
                                    <td className="border border-gray-300 px-4 py-2" colSpan="2">{selectedMessage.data.username || "N/A"}</td>
                                  </tr>
                                  <tr>
                                    <td className="border border-gray-300 px-4 py-2">No BASTW</td>
                                    <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details?.noDokumenBastw || "N/A"}</td>
                                    <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details?.dokBastw || "N/A"}</td>
                                  </tr>
                                  <tr>
                                    <td className="border border-gray-300 px-4 py-2">No AIW</td>
                                    <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details?.noDokumenAIW || "N/A"}</td>
                                    <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details?.dokAiw || "N/A"}</td>
                                  </tr>
                                  <tr>
                                    <td className="border border-gray-300 px-4 py-2">No SW</td>
                                    <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details?.noDokumenSW || "N/A"}</td>
                                    <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details?.dokSw || "N/A"}</td>
                                  </tr>
                                  <tr>
                                    <td className="border border-gray-300 px-4 py-2">Legalitas</td>
                                    <td className="border border-gray-300 px-4 py-2" colSpan="2">{selectedMessage.data.details?.legalitas || "N/A"}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-6">
                              <div>
                                <h3 className="text-lg font-semibold mb-2">Data Sebelumnya</h3>
                                <table className="min-w-full border-collapse border border-gray-300">
                                  <thead>
                                    <tr>
                                      <th className="border border-gray-300 px-4 py-2">Judul</th>
                                      <th className="border border-gray-300 px-4 py-2"colSpan="2">Data</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                  <tr>
                                    <td className="border border-gray-300 px-4 py-2">Pimpinan Jamaah</td>
                                    <td className="border border-gray-300 px-4 py-2" colSpan="2">{selectedMessage.data.username || "N/A"}</td>
                                  </tr>
                                  <tr>
                                    <td className="border border-gray-300 px-4 py-2">No BASTW</td>
                                    <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details?.previous_data.noDokumenBastw || "N/A"}</td>
                                    <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details?.previous_data.dokBastw || "N/A"}</td>
                                  </tr>
                                  <tr>
                                    <td className="border border-gray-300 px-4 py-2">No AIW</td>
                                    <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details?.previous_data.noDokumenAIW || "N/A"}</td>
                                    <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details?.previous_data.dokAiw || "N/A"}</td>
                                  </tr>
                                  <tr>
                                    <td className="border border-gray-300 px-4 py-2">No SW</td>
                                    <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details?.previous_data.noDokumenSW || "N/A"}</td>
                                    <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details?.previous_data.dokSw || "N/A"}</td>
                                  </tr>
                                  <tr>
                                    <td className="border border-gray-300 px-4 py-2">Legalitas</td>
                                    <td className="border border-gray-300 px-4 py-2" colSpan="2">{selectedMessage.data.details?.previous_data.legalitas || "N/A"}</td>
                                  </tr>
                                </tbody>
                                </table>
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold mb-2">Data Terbaru</h3>
                                <table className="min-w-full border-collapse border border-gray-300">
                                  <thead>
                                    <tr>
                                      <th className="border border-gray-300 px-4 py-2">Judul</th>
                                      <th className="border border-gray-300 px-4 py-2" colSpan="2">Data</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                  <tr>
                                    <td className="border border-gray-300 px-4 py-2">Pimpinan Jamaah</td>
                                    <td className="border border-gray-300 px-4 py-2" colSpan="2">{selectedMessage.data.username || "N/A"}</td>
                                  </tr>
                                  <tr>
                                    <td className="border border-gray-300 px-4 py-2">No BASTW</td>
                                    <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details?.updated_data.noDokumenBastw || "N/A"}</td>
                                    <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details?.updated_data.dokBastw || "N/A"}</td>
                                  </tr>
                                  <tr>
                                    <td className="border border-gray-300 px-4 py-2">No AIW</td>
                                    <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details?.updated_data.noDokumenAIW || "N/A"}</td>
                                    <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details?.updated_data.dokAiw || "N/A"}</td>
                                  </tr>
                                  <tr>
                                    <td className="border border-gray-300 px-4 py-2">No SW</td>
                                    <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details?.updated_data.noDokumenSW || "N/A"}</td>
                                    <td className="border border-gray-300 px-4 py-2">{selectedMessage.data.details?.updated_data.dokSw || "N/A"}</td>
                                  </tr>
                                  <tr>
                                    <td className="border border-gray-300 px-4 py-2">Legalitas</td>
                                    <td className="border border-gray-300 px-4 py-2" colSpan="2">{selectedMessage.data.details?.updated_data.legalitas || "N/A"}</td>
                                  </tr>
                                </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                  {/* Only show this table if isSertifikat is false */}
                  {!isSertifikat && (
                    <>
                      {isCreating ? (
                      <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Detail Tanah</h3>
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
                        </div>
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
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  {isPimpinanJamaah ? (
                    <div>
                      {approvalStatus[selectedMessage.id] === "approved" ? (
                        <div className="bg-green-100 p-2 rounded-md"> {/* Container for approved status */}
                          <span className="text-green-500 text-xs">Data disetujui</span>
                        </div>
                      ) : approvalStatus[selectedMessage.id] === "rejected" ? (
                        <div className="bg-red-100 p-2 rounded-md"> {/* Container for rejected status */}
                          <span className="text-red-500 text-xs">Data ditolak</span>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <>
                      {approvalStatus[selectedMessage.id] === "approved" ? (
                        <div className="bg-green-100 p-2 rounded-md"> {/* Container for approved status */}
                          <span className="text-green-500 text-xs">Data disetujui</span>
                        </div>
                      ) : approvalStatus[selectedMessage.id] === "rejected" ? (
                        <div className="bg-red-100 p-2 rounded-md"> {/* Container for rejected status */}
                          <span className="text-red-500 text-xs">Data ditolak</span>
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